import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import CSLockerDocument from '../models/CSLockerDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
const MAX_FILES_PER_UPLOAD = 10;

// Allowed extensions & standard MIME mapping
const ALLOWED_EXTENSIONS = new Set([
    'pdf',
    'doc', 'docx', 'rtf', 'odt',
    'xls', 'xlsx', 'csv', 'ods',
    'ppt', 'pptx', 'odp',
    'txt', 'md', 'json', 'xml',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    'zip', 'rar', '7z', 'tar', 'gz'
]);

const BLOCKED_EXTENSIONS = new Set([
    'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'msi', 'dll', 'com', 'scr', 'jar'
]);

const EXTENSION_MIME_MAP = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odp: 'application/vnd.oasis.opendocument.presentation',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    xml: 'application/xml',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip'
};

const PREVIEWABLE_EXTENSIONS = new Set([
    'pdf',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    'txt', 'csv', 'md', 'json', 'xml'
]);

const TYPE_GROUP_EXTENSIONS = {
    pdf: ['pdf'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    word: ['doc', 'docx', 'rtf', 'odt'],
    excel: ['xls', 'xlsx', 'csv', 'ods'],
    powerpoint: ['ppt', 'pptx', 'odp'],
    text: ['txt', 'md', 'json', 'xml'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz']
};

// Local disk fallback directory (used only if MongoDB is temporarily disconnected)
const FALLBACK_DIR = path.join(__dirname, '..', 'uploads', 'cslocker');
const FALLBACK_META_FILE = path.join(FALLBACK_DIR, 'cslocker-meta.json');

let fallbackDocs = [];
function loadFallbackMeta() {
    try {
        if (!fs.existsSync(FALLBACK_DIR)) {
            fs.mkdirSync(FALLBACK_DIR, { recursive: true });
        }
        if (fs.existsSync(FALLBACK_META_FILE)) {
            fallbackDocs = JSON.parse(fs.readFileSync(FALLBACK_META_FILE, 'utf8')) || [];
        }
    } catch (e) {
        fallbackDocs = [];
    }
}
function saveFallbackMeta() {
    try {
        if (!fs.existsSync(FALLBACK_DIR)) {
            fs.mkdirSync(FALLBACK_DIR, { recursive: true });
        }
        fs.writeFileSync(FALLBACK_META_FILE, JSON.stringify(fallbackDocs, null, 2), 'utf8');
    } catch (e) {
        console.error('CSLocker fallback save error:', e.message);
    }
}
loadFallbackMeta();

const isMongoConnected = () => mongoose.connection.readyState === 1 && Boolean(mongoose.connection.db);

function getGridFSBucket() {
    if (!isMongoConnected()) return null;
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'cslocker_files'
    });
}

// Sanitize filename to prevent path traversal or header injection
function sanitizeFilename(rawName = 'document') {
    const base = path.basename(String(rawName || 'document')).replace(/[\0\r\n"<>|?*\\/:]/g, '_').trim();
    return base || 'document';
}

function getFileExtension(filename = '') {
    const ext = path.extname(filename).toLowerCase().replace(/^\./, '');
    return ext;
}

function resolveMimeType(file) {
    const ext = getFileExtension(file.originalname);
    if (EXTENSION_MIME_MAP[ext]) {
        return EXTENSION_MIME_MAP[ext];
    }
    return file.mimetype || 'application/octet-stream';
}

// Configure Multer with memory storage for direct GridFS streaming
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES_PER_UPLOAD
    },
    fileFilter: (req, file, cb) => {
        const cleanName = sanitizeFilename(file.originalname);
        const ext = getFileExtension(cleanName);
        if (!ext || BLOCKED_EXTENSIONS.has(ext)) {
            return cb(new Error(`File type ".${ext || 'unknown'}" is not allowed for security reasons.`));
        }
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return cb(new Error(`Unsupported file format ".${ext}". Allowed: PDF, Word, Excel, PowerPoint, Images, TXT, CSV, ZIP.`));
        }
        cb(null, true);
    }
});

// Authentication middleware: Extract user_id from header, query, or body
router.use((req, res, next) => {
    const rawUserId = req.headers['x-user-id'] || req.query.user_id || req.body?.user_id;
    if (!rawUserId || String(rawUserId).trim() === '') {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please log in to access CS Locker.'
        });
    }
    req.lockerUserId = String(rawUserId).toLowerCase().trim();
    next();
});

// Enrich document record with preview/download URLs and capability flags
function enrichDoc(docObj) {
    const ext = (docObj.file_extension || '').toLowerCase();
    const isPreviewable = PREVIEWABLE_EXTENSIONS.has(ext);
    let previewKind = 'unsupported';
    if (ext === 'pdf') previewKind = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) previewKind = 'image';
    else if (['txt', 'csv', 'md', 'json', 'xml'].includes(ext)) previewKind = 'text';

    return {
        ...docObj,
        id: String(docObj.id || docObj._id),
        is_previewable: isPreviewable,
        preview_kind: previewKind,
        preview_url: `/cslocker/documents/${String(docObj.id || docObj._id)}/preview`,
        download_url: `/cslocker/documents/${String(docObj.id || docObj._id)}/download`
    };
}

// Helper: Save buffer to MongoDB GridFS
function uploadBufferToGridFS(bucket, filename, buffer, metadata) {
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            metadata
        });
        const readable = Readable.from(buffer);
        readable
            .pipe(uploadStream)
            .on('error', (err) => reject(err))
            .on('finish', () => resolve(uploadStream.id));
    });
}

// ============================================================================
// 1. GET /cslocker & GET /cslocker/documents — List, Search, Filter & Paginate
// ============================================================================
router.get(['/', '/documents'], async (req, res) => {
    try {
        const userId = req.lockerUserId;
        const search = String(req.query.q || req.query.search || '').trim();
        const category = String(req.query.category || 'all').trim();
        const fileType = String(req.query.file_type || 'all').trim().toLowerCase();
        const starredOnly = req.query.starred === 'true' || req.query.starred === '1';
        const dateFrom = req.query.date_from ? new Date(`${req.query.date_from}T00:00:00.000Z`) : null;
        const dateTo = req.query.date_to ? new Date(`${req.query.date_to}T23:59:59.999Z`) : null;
        const sortBy = String(req.query.sort_by || 'newest').trim();
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));

        if (isMongoConnected()) {
            const filter = { user_id: userId };

            if (category && category !== 'all') {
                filter.category = category;
            }
            if (starredOnly) {
                filter.is_starred = true;
            }
            if (fileType && fileType !== 'all') {
                if (TYPE_GROUP_EXTENSIONS[fileType]) {
                    filter.file_extension = { $in: TYPE_GROUP_EXTENSIONS[fileType] };
                } else {
                    filter.file_extension = fileType;
                }
            }
            if ((dateFrom && !isNaN(dateFrom)) || (dateTo && !isNaN(dateTo))) {
                filter.created_at = {};
                if (dateFrom && !isNaN(dateFrom)) filter.created_at.$gte = dateFrom;
                if (dateTo && !isNaN(dateTo)) filter.created_at.$lte = dateTo;
            }
            if (search) {
                const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'i');
                filter.$or = [
                    { title: regex },
                    { original_filename: regex },
                    { description: regex },
                    { category: regex },
                    { file_extension: regex },
                    { tags: regex }
                ];
            }

            let sortSpec = { created_at: -1 };
            if (sortBy === 'oldest') sortSpec = { created_at: 1 };
            else if (sortBy === 'name_asc') sortSpec = { title: 1 };
            else if (sortBy === 'name_desc') sortSpec = { title: -1 };
            else if (sortBy === 'size_desc') sortSpec = { file_size: -1 };
            else if (sortBy === 'size_asc') sortSpec = { file_size: 1 };

            const [totalMatching, docs, allUserDocs] = await Promise.all([
                CSLockerDocument.countDocuments(filter),
                CSLockerDocument.find(filter)
                    .sort(sortSpec)
                    .skip((page - 1) * limit)
                    .limit(limit),
                CSLockerDocument.find({ user_id: userId }).select('file_size category file_extension is_starred')
            ]);

            const totalSizeBytes = allUserDocs.reduce((acc, d) => acc + (Number(d.file_size) || 0), 0);
            const starredCount = allUserDocs.filter(d => d.is_starred).length;
            const categoryCounts = {};
            const typeCounts = {};

            for (const d of allUserDocs) {
                const cat = d.category || 'General';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                const ext = d.file_extension || 'other';
                typeCounts[ext] = (typeCounts[ext] || 0) + 1;
            }

            return res.json({
                success: true,
                brand: 'Chaudhary & Sons (CS Corp) • CS Locker',
                storage_engine: 'MongoDB GridFS',
                user_id: userId,
                documents: docs.map(d => enrichDoc(d.toJSON())),
                pagination: {
                    total: totalMatching,
                    page,
                    limit,
                    total_pages: Math.max(1, Math.ceil(totalMatching / limit))
                },
                stats: {
                    total_documents: allUserDocs.length,
                    total_size_bytes: totalSizeBytes,
                    starred_count: starredCount,
                    category_counts: categoryCounts,
                    type_counts: typeCounts
                }
            });
        }

        // Local fallback query if MongoDB is disconnected
        const allUserDocs = fallbackDocs.filter(d => d.user_id === userId);
        let filtered = [...allUserDocs];

        if (category && category !== 'all') {
            filtered = filtered.filter(d => d.category === category);
        }
        if (starredOnly) {
            filtered = filtered.filter(d => Boolean(d.is_starred));
        }
        if (fileType && fileType !== 'all') {
            const allowedExts = TYPE_GROUP_EXTENSIONS[fileType] || [fileType];
            filtered = filtered.filter(d => allowedExts.includes((d.file_extension || '').toLowerCase()));
        }
        if (dateFrom && !isNaN(dateFrom)) {
            filtered = filtered.filter(d => new Date(d.created_at) >= dateFrom);
        }
        if (dateTo && !isNaN(dateTo)) {
            filtered = filtered.filter(d => new Date(d.created_at) <= dateTo);
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(d =>
                (d.title || '').toLowerCase().includes(q) ||
                (d.original_filename || '').toLowerCase().includes(q) ||
                (d.description || '').toLowerCase().includes(q) ||
                (d.category || '').toLowerCase().includes(q) ||
                (d.file_extension || '').toLowerCase().includes(q) ||
                (Array.isArray(d.tags) && d.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'name_asc') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'name_desc') return (b.title || '').localeCompare(a.title || '');
            if (sortBy === 'size_desc') return (b.file_size || 0) - (a.file_size || 0);
            if (sortBy === 'size_asc') return (a.file_size || 0) - (b.file_size || 0);
            return new Date(b.created_at) - new Date(a.created_at);
        });

        const totalMatching = filtered.length;
        const paged = filtered.slice((page - 1) * limit, page * limit);
        const totalSizeBytes = allUserDocs.reduce((acc, d) => acc + (Number(d.file_size) || 0), 0);
        const starredCount = allUserDocs.filter(d => d.is_starred).length;
        const categoryCounts = {};
        const typeCounts = {};

        for (const d of allUserDocs) {
            const cat = d.category || 'General';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            const ext = d.file_extension || 'other';
            typeCounts[ext] = (typeCounts[ext] || 0) + 1;
        }

        return res.json({
            success: true,
            brand: 'Chaudhary & Sons (CS Corp) • CS Locker',
            storage_engine: 'Local Persistent Vault',
            user_id: userId,
            documents: paged.map(enrichDoc),
            pagination: {
                total: totalMatching,
                page,
                limit,
                total_pages: Math.max(1, Math.ceil(totalMatching / limit))
            },
            stats: {
                total_documents: allUserDocs.length,
                total_size_bytes: totalSizeBytes,
                starred_count: starredCount,
                category_counts: categoryCounts,
                type_counts: typeCounts
            }
        });
    } catch (err) {
        console.error('CSLocker list error:', err);
        return res.status(500).json({ success: false, error: err.message || 'Failed to load documents' });
    }
});

// ============================================================================
// 2. POST /cslocker/upload & POST /cslocker/documents — Single or Multi Upload
// ============================================================================
const uploadMiddleware = (req, res, next) => {
    const handler = upload.any();
    handler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size exceeds the 25 MB maximum limit.'
                });
            }
            return res.status(400).json({ success: false, error: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

router.post(['/upload', '/documents'], uploadMiddleware, async (req, res) => {
    try {
        const userId = req.lockerUserId;
        const uploadedFiles = req.files || [];

        if (!uploadedFiles.length) {
            return res.status(400).json({
                success: false,
                error: 'No files were provided for upload.'
            });
        }

        const body = req.body || {};
        const category = String(body.category || 'General').trim() || 'General';
        const description = String(body.description || '').trim();
        const ownerName = String(body.owner_name || '').trim();
        const isStarred = body.is_starred === 'true' || body.is_starred === true;

        let parsedTags = [];
        if (Array.isArray(body.tags)) {
            parsedTags = body.tags.map(t => String(t).trim()).filter(Boolean);
        } else if (typeof body.tags === 'string' && body.tags.trim()) {
            try {
                const maybeArr = JSON.parse(body.tags);
                if (Array.isArray(maybeArr)) {
                    parsedTags = maybeArr.map(t => String(t).trim()).filter(Boolean);
                } else {
                    parsedTags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
                }
            } catch {
                parsedTags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        let customTitles = [];
        if (body.titles) {
            try {
                const parsed = JSON.parse(body.titles);
                if (Array.isArray(parsed)) customTitles = parsed;
            } catch {
                // ignore
            }
        }

        const bucket = getGridFSBucket();
        const savedDocs = [];

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const cleanOriginalName = sanitizeFilename(file.originalname);
            const ext = getFileExtension(cleanOriginalName);
            const mimeType = resolveMimeType(file);
            const baseTitleWithoutExt = path.basename(cleanOriginalName, path.extname(cleanOriginalName));

            let docTitle = baseTitleWithoutExt;
            if (customTitles[i] && String(customTitles[i]).trim()) {
                docTitle = String(customTitles[i]).trim();
            } else if (body.title && String(body.title).trim()) {
                docTitle = uploadedFiles.length === 1
                    ? String(body.title).trim()
                    : `${String(body.title).trim()} (${i + 1})`;
            }

            const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
            const uniqueStoredName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${cleanOriginalName}`;

            if (bucket && isMongoConnected()) {
                const gridfsId = await uploadBufferToGridFS(bucket, uniqueStoredName, file.buffer, {
                    user_id: userId,
                    original_filename: cleanOriginalName,
                    mime_type: mimeType,
                    category,
                    checksum_sha256: checksum
                });

                const created = await CSLockerDocument.create({
                    user_id: userId,
                    owner_name: ownerName,
                    title: docTitle,
                    description,
                    category,
                    tags: parsedTags,
                    is_starred: isStarred,
                    original_filename: cleanOriginalName,
                    stored_filename: uniqueStoredName,
                    file_extension: ext,
                    mime_type: mimeType,
                    file_size: file.size,
                    storage_backend: 'gridfs',
                    gridfs_file_id: gridfsId,
                    checksum_sha256: checksum
                });

                savedDocs.push(enrichDoc(created.toJSON()));
            } else {
                // Local persistent disk fallback
                if (!fs.existsSync(FALLBACK_DIR)) {
                    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
                }
                const diskFilePath = path.join(FALLBACK_DIR, uniqueStoredName);
                fs.writeFileSync(diskFilePath, file.buffer);

                const fallbackRecord = {
                    id: 'doc_' + Date.now() + '_' + i,
                    user_id: userId,
                    owner_name: ownerName,
                    title: docTitle,
                    description,
                    category,
                    tags: parsedTags,
                    is_starred: isStarred,
                    original_filename: cleanOriginalName,
                    stored_filename: uniqueStoredName,
                    file_extension: ext,
                    mime_type: mimeType,
                    file_size: file.size,
                    storage_backend: 'disk',
                    gridfs_file_id: null,
                    disk_path: diskFilePath,
                    checksum_sha256: checksum,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                fallbackDocs.unshift(fallbackRecord);
                saveFallbackMeta();
                const { disk_path, ...publicRec } = fallbackRecord;
                savedDocs.push(enrichDoc(publicRec));
            }
        }

        return res.status(201).json({
            success: true,
            message: `${savedDocs.length} document(s) uploaded to CS Locker successfully.`,
            documents: savedDocs
        });
    } catch (err) {
        console.error('CSLocker upload error:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Failed to upload documents to CS Locker.'
        });
    }
});

// ============================================================================
// 3. GET /cslocker/documents/:id — View Single Document Details
// ============================================================================
router.get('/documents/:id', async (req, res) => {
    try {
        const userId = req.lockerUserId;
        const { id } = req.params;

        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const doc = await CSLockerDocument.findOne({ _id: id, user_id: userId });
            if (!doc) {
                return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
            }
            return res.json({ success: true, document: enrichDoc(doc.toJSON()) });
        }

        const doc = fallbackDocs.find(d => String(d.id) === String(id) && d.user_id === userId);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
        }
        const { disk_path, ...publicDoc } = doc;
        return res.json({ success: true, document: enrichDoc(publicDoc) });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 4. PUT / PATCH /cslocker/documents/:id — Update Document Metadata
// ============================================================================
router.put('/documents/:id', updateDocumentMetadata);
router.patch('/documents/:id', updateDocumentMetadata);

async function updateDocumentMetadata(req, res) {
    try {
        const userId = req.lockerUserId;
        const { id } = req.params;
        const b = req.body || {};

        const updateFields = {};
        if (b.title !== undefined && String(b.title).trim()) {
            updateFields.title = String(b.title).trim();
        }
        if (b.description !== undefined) {
            updateFields.description = String(b.description).trim();
        }
        if (b.category !== undefined && String(b.category).trim()) {
            updateFields.category = String(b.category).trim();
        }
        if (b.is_starred !== undefined) {
            updateFields.is_starred = Boolean(b.is_starred);
        }
        if (b.tags !== undefined) {
            if (Array.isArray(b.tags)) {
                updateFields.tags = b.tags.map(t => String(t).trim()).filter(Boolean);
            } else if (typeof b.tags === 'string') {
                updateFields.tags = b.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const updated = await CSLockerDocument.findOneAndUpdate(
                { _id: id, user_id: userId },
                { $set: updateFields },
                { new: true }
            );
            if (!updated) {
                return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
            }
            return res.json({
                success: true,
                message: 'Document metadata updated.',
                document: enrichDoc(updated.toJSON())
            });
        }

        const idx = fallbackDocs.findIndex(d => String(d.id) === String(id) && d.user_id === userId);
        if (idx === -1) {
            return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
        }
        fallbackDocs[idx] = {
            ...fallbackDocs[idx],
            ...updateFields,
            updated_at: new Date().toISOString()
        };
        saveFallbackMeta();
        const { disk_path, ...publicDoc } = fallbackDocs[idx];
        return res.json({
            success: true,
            message: 'Document metadata updated.',
            document: enrichDoc(publicDoc)
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ============================================================================
// 5. GET /cslocker/documents/:id/preview & /cslocker/documents/:id/download
// ============================================================================
async function streamDocumentFile(req, res, dispositionMode = 'inline') {
    try {
        const userId = req.lockerUserId;
        const { id } = req.params;

        let docRecord = null;
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            docRecord = await CSLockerDocument.findOne({ _id: id, user_id: userId });
        } else {
            docRecord = fallbackDocs.find(d => String(d.id) === String(id) && d.user_id === userId);
        }

        if (!docRecord) {
            return res.status(404).json({ success: false, error: 'Document not found or unauthorized.' });
        }

        const safeDownloadName = sanitizeFilename(docRecord.original_filename || `${docRecord.title}.${docRecord.file_extension}`);
        const contentType = docRecord.mime_type || EXTENSION_MIME_MAP[docRecord.file_extension] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        if (docRecord.file_size) {
            res.setHeader('Content-Length', String(docRecord.file_size));
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader(
            'Content-Disposition',
            `${dispositionMode}; filename="${encodeURIComponent(safeDownloadName)}"; filename*=UTF-8''${encodeURIComponent(safeDownloadName)}`
        );

        if (docRecord.storage_backend === 'gridfs' && docRecord.gridfs_file_id && isMongoConnected()) {
            const bucket = getGridFSBucket();
            const downloadStream = bucket.openDownloadStream(
                new mongoose.Types.ObjectId(docRecord.gridfs_file_id)
            );
            downloadStream.on('error', (err) => {
                console.error('GridFS stream error:', err.message);
                if (!res.headersSent) {
                    res.status(404).json({ success: false, error: 'Binary file not found in MongoDB GridFS.' });
                }
            });
            return downloadStream.pipe(res);
        }

        // Disk fallback stream
        const diskPath = docRecord.disk_path || path.join(FALLBACK_DIR, docRecord.stored_filename || '');
        const resolvedPath = path.resolve(diskPath);
        const resolvedBase = path.resolve(FALLBACK_DIR);
        if (!resolvedPath.startsWith(resolvedBase) || !fs.existsSync(resolvedPath)) {
            return res.status(404).json({ success: false, error: 'Stored file not found on server.' });
        }

        const fileStream = fs.createReadStream(resolvedPath);
        fileStream.on('error', () => {
            if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'Error reading stored file.' });
            }
        });
        return fileStream.pipe(res);
    } catch (err) {
        console.error('CSLocker file stream error:', err);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }
}

router.get(['/documents/:id/preview', '/preview/:id'], (req, res) => streamDocumentFile(req, res, 'inline'));
router.get(['/documents/:id/download', '/download/:id'], (req, res) => streamDocumentFile(req, res, 'attachment'));

// ============================================================================
// 6. DELETE /cslocker/documents/:id — Delete Metadata & GridFS Chunks
// ============================================================================
router.delete('/documents/:id', async (req, res) => {
    try {
        const userId = req.lockerUserId;
        const { id } = req.params;

        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const doc = await CSLockerDocument.findOne({ _id: id, user_id: userId });
            if (!doc) {
                return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
            }

            if (doc.storage_backend === 'gridfs' && doc.gridfs_file_id) {
                try {
                    const bucket = getGridFSBucket();
                    await bucket.delete(new mongoose.Types.ObjectId(doc.gridfs_file_id));
                } catch (gridErr) {
                    console.warn('GridFS delete warning:', gridErr.message);
                }
            }

            await CSLockerDocument.deleteOne({ _id: doc._id, user_id: userId });
            return res.json({ success: true, message: 'Document permanently deleted from CS Locker.' });
        }

        const idx = fallbackDocs.findIndex(d => String(d.id) === String(id) && d.user_id === userId);
        if (idx === -1) {
            return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
        }

        const removed = fallbackDocs.splice(idx, 1)[0];
        saveFallbackMeta();

        if (removed.disk_path) {
            const resolvedPath = path.resolve(removed.disk_path);
            const resolvedBase = path.resolve(FALLBACK_DIR);
            if (resolvedPath.startsWith(resolvedBase) && fs.existsSync(resolvedPath)) {
                try {
                    fs.unlinkSync(resolvedPath);
                } catch {}
            }
        }

        return res.json({ success: true, message: 'Document permanently deleted from CS Locker.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
