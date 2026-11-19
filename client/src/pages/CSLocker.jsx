import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    FolderLock, Upload, Search, FileText, Image as ImageIcon, FileSpreadsheet,
    FileArchive, FileCode, File, Download, Eye, Trash2, Edit3, Star,
    X, Calendar, ChevronLeft, ChevronRight, User, Settings, Plus, Tag
} from 'lucide-react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import './CSLocker.css';

const CATEGORIES = [
    'Identity & KYC',
    'Financial & Tax',
    'Academic & Certificates',
    'Property & Legal',
    'Medical & Insurance',
    'Work & Contracts',
    'Receipts & Invoices',
    'Personal',
    'General'
];

const FILE_TYPE_FILTERS = [
    { id: 'all', label: 'All Formats' },
    { id: 'pdf', label: 'PDF (.pdf)' },
    { id: 'image', label: 'Images (.jpg, .png)' },
    { id: 'word', label: 'Word (.doc, .docx)' },
    { id: 'excel', label: 'Excel / CSV' },
    { id: 'powerpoint', label: 'Slides (.ppt, .pptx)' },
    { id: 'text', label: 'Text / Notes' },
    { id: 'archive', label: 'ZIP / Archives' }
];

function formatBytes(bytes = 0) {
    const b = Number(bytes) || 0;
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(b) / Math.log(k)));
    const val = b / Math.pow(k, i);
    return `${val.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function formatDateDisplay(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d)) return String(isoStr).slice(0, 10);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function getLockerCandidates(subpath = '') {
    const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const bases = [];
    if (import.meta.env.VITE_API_URL) {
        bases.push(import.meta.env.VITE_API_URL.replace(/\/$/, ''));
    } else if (isLocal) {
        bases.push('http://localhost:5000');
        bases.push(API_BASE_URL);
    } else {
        bases.push(API_BASE_URL);
    }
    return [...new Set(bases)].map(b => `${b}/cslocker${subpath}`);
}

async function lockerFetchWithUser(userKey, subpath = '', options = {}) {
    const urls = getLockerCandidates(subpath);
    let lastError = null;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    for (const url of urls) {
        try {
            const headers = {
                Accept: 'application/json',
                'X-User-Id': userKey,
                ...(options.headers || {})
            };
            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(url, {
                ...options,
                headers
            });
            if (res.ok) {
                return await res.json();
            }
            const errData = await res.json().catch(() => ({}));
            lastError = new Error(errData.error || `HTTP ${res.status}`);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error('Unable to reach CS Locker service');
}

function getFileIconMeta(ext = '') {
    const e = (ext || '').toLowerCase();
    if (e === 'pdf') return { Icon: FileText, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'PDF' };
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(e)) {
        return { Icon: ImageIcon, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.1)', label: e.toUpperCase() };
    }
    if (['xls', 'xlsx', 'csv', 'ods'].includes(e)) {
        return { Icon: FileSpreadsheet, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: e.toUpperCase() };
    }
    if (['doc', 'docx', 'rtf', 'odt'].includes(e)) {
        return { Icon: FileText, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', label: e.toUpperCase() };
    }
    if (['ppt', 'pptx', 'odp'].includes(e)) {
        return { Icon: FileText, color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', label: e.toUpperCase() };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) {
        return { Icon: FileArchive, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', label: e.toUpperCase() };
    }
    if (['txt', 'md', 'json', 'xml'].includes(e)) {
        return { Icon: FileCode, color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', label: e.toUpperCase() };
    }
    return { Icon: File, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', label: (e || 'FILE').toUpperCase() };
}

const CSLocker = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const userKey = (user?.email || user?.id || user?._id || user?.username || '').toLowerCase().trim();
    const userDisplayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : (user?.name || user?.username || user?.email || 'Member');

    useEffect(() => {
        if (!isAuthenticated || !userKey) {
            navigate('/login?redirect=/cslocker', { replace: true });
        }
    }, [isAuthenticated, userKey, navigate]);

    const lockerFetch = useCallback((subpath = '', options = {}) => {
        return lockerFetchWithUser(userKey, subpath, options);
    }, [userKey]);

    const getDirectFileUrl = useCallback((docId, mode = 'preview') => {
        const candidates = getLockerCandidates(`/documents/${encodeURIComponent(docId)}/${mode}`);
        const base = candidates[0];
        return `${base}?user_id=${encodeURIComponent(userKey)}`;
    }, [userKey]);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFileType, setSelectedFileType] = useState('all');
    const [starredOnly, setStarredOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);

    // Data States
    const [documents, setDocuments] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, total_pages: 1 });
    const [stats, setStats] = useState({
        total_documents: 0,
        starred_count: 0,
        category_counts: {}
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modals State
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewTextContent, setPreviewTextContent] = useState('');
    const [previewTextLoading, setPreviewTextLoading] = useState(false);
    const [editDoc, setEditDoc] = useState(null);

    // Upload Form State
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadMeta, setUploadMeta] = useState({
        category: 'Identity & KYC',
        description: '',
        tags: '',
        is_starred: false
    });

    // Edit Form State
    const [editForm, setEditForm] = useState({
        id: '',
        title: '',
        category: 'General',
        description: '',
        tags: '',
        is_starred: false
    });
    const [savingEdit, setSavingEdit] = useState(false);

    // Custom Categories State
    const [categories, setCategories] = useState([]);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCat, setEditingCat] = useState(null);
    const [inlineNewCatOpen, setInlineNewCatOpen] = useState(false);
    const [inlineNewCatName, setInlineNewCatName] = useState('');

    const categoryList = categories.length > 0
        ? categories.map(c => c.name)
        : CATEGORIES;

    const anyModalOpen = uploadModalOpen || Boolean(previewDoc) || Boolean(editDoc) || categoryModalOpen;

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [anyModalOpen]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => {
            setToast(prev => (prev === msg ? null : prev));
        }, 3200);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadDocuments = useCallback(async () => {
        if (!isAuthenticated || !userKey) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQuery) params.set('q', debouncedQuery);
            if (selectedCategory !== 'all') params.set('category', selectedCategory);
            if (selectedFileType !== 'all') params.set('file_type', selectedFileType);
            if (starredOnly) params.set('starred', 'true');
            if (sortBy) params.set('sort_by', sortBy);
            params.set('page', String(page));
            params.set('limit', '12');

            const res = await lockerFetch(`/documents?${params.toString()}`);
            setDocuments(res.documents || []);
            setPagination(res.pagination || { total: 0, page: 1, limit: 12, total_pages: 1 });
            setStats(res.stats || {
                total_documents: 0,
                starred_count: 0,
                category_counts: {}
            });
        } catch (err) {
            console.error('CSLocker load error:', err);
            showToast('Error loading documents: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [
        isAuthenticated,
        userKey,
        debouncedQuery,
        selectedCategory,
        selectedFileType,
        starredOnly,
        sortBy,
        page,
        lockerFetch
    ]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const loadCategories = useCallback(async () => {
        if (!isAuthenticated || !userKey) return;
        try {
            const res = await lockerFetch('/categories');
            if (res.success && Array.isArray(res.categories)) {
                setCategories(res.categories);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    }, [isAuthenticated, userKey, lockerFetch]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleAddCategory = async (nameToAdd) => {
        const clean = (nameToAdd || newCategoryName || '').trim();
        if (!clean) {
            showToast('Please enter a category name');
            return null;
        }
        try {
            const res = await lockerFetch('/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clean })
            });
            if (res.success) {
                showToast(`Category "${clean}" created!`);
                setNewCategoryName('');
                setInlineNewCatName('');
                setInlineNewCatOpen(false);
                await loadCategories();
                return res.category?.name || clean;
            }
        } catch (err) {
            showToast(err.message || 'Failed to add category');
            return null;
        }
    };

    const handleUpdateCategory = async (id, newName) => {
        const clean = (newName || '').trim();
        if (!clean) {
            showToast('Category name cannot be empty');
            return;
        }
        try {
            const res = await lockerFetch(`/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clean })
            });
            if (res.success) {
                showToast('Category updated!');
                setEditingCat(null);
                await loadCategories();
                await loadDocuments();
            }
        } catch (err) {
            showToast(err.message || 'Failed to rename category');
        }
    };

    const handleDeleteCategory = async (cat) => {
        const count = stats.category_counts?.[cat.name] || 0;
        const confirmMsg = count > 0
            ? `Category "${cat.name}" has ${count} document(s). Deleting it will reassign these documents to "General". Continue?`
            : `Delete category "${cat.name}"?`;
        if (!window.confirm(confirmMsg)) return;
        try {
            const res = await lockerFetch(`/categories/${cat.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fallback: 'General' })
            });
            if (res.success) {
                showToast(`Category "${cat.name}" deleted`);
                if (selectedCategory === cat.name) {
                    setSelectedCategory('all');
                }
                await loadCategories();
                await loadDocuments();
            }
        } catch (err) {
            showToast(err.message || 'Failed to delete category');
        }
    };

    const handleResetCategories = async () => {
        if (!window.confirm('Restore standard default categories? Any documents in custom categories will be preserved.')) return;
        try {
            const res = await lockerFetch('/categories/reset', { method: 'POST' });
            if (res.success) {
                showToast('Categories restored to defaults');
                await loadCategories();
                await loadDocuments();
            }
        } catch (err) {
            showToast(err.message || 'Failed to reset categories');
        }
    };

    useEffect(() => {
        if (!previewDoc || previewDoc.preview_kind !== 'text') {
            setPreviewTextContent('');
            return;
        }
        let cancelled = false;
        setPreviewTextLoading(true);
        fetch(getDirectFileUrl(previewDoc.id, 'preview'))
            .then(r => r.text())
            .then(txt => {
                if (!cancelled) setPreviewTextContent(txt.slice(0, 100000));
            })
            .catch(() => {
                if (!cancelled) setPreviewTextContent('Unable to load text preview.');
            })
            .finally(() => {
                if (!cancelled) setPreviewTextLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [previewDoc, getDirectFileUrl]);

    const appendFilesToSelection = (fileList) => {
        const incoming = Array.from(fileList || []);
        if (!incoming.length) return;
        const mapped = incoming.map(f => {
            const dotIdx = f.name.lastIndexOf('.');
            const defaultTitle = dotIdx > 0 ? f.name.slice(0, dotIdx) : f.name;
            return {
                file: f,
                customTitle: defaultTitle
            };
        });
        setSelectedFiles(prev => [...prev, ...mapped].slice(0, 10));
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer?.files?.length) {
            appendFilesToSelection(e.dataTransfer.files);
        }
    };

    const removeSelectedFile = (idx) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const updateSelectedFileTitle = (idx, val) => {
        setSelectedFiles(prev => prev.map((item, i) => (i === idx ? { ...item, customTitle: val } : item)));
    };

    const openUploadModal = () => {
        setSelectedFiles([]);
        const defaultCat = categoryList[0] || 'Identity & KYC';
        setUploadMeta({
            category: selectedCategory !== 'all' ? selectedCategory : defaultCat,
            description: '',
            tags: '',
            is_starred: false
        });
        setInlineNewCatOpen(false);
        setInlineNewCatName('');
        setUploadModalOpen(true);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFiles.length) {
            showToast('Please select at least one document.');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            const titles = [];
            selectedFiles.forEach(item => {
                formData.append('files', item.file);
                titles.push(item.customTitle || item.file.name);
            });
            formData.append('titles', JSON.stringify(titles));
            formData.append('category', uploadMeta.category);
            formData.append('description', uploadMeta.description);
            formData.append('tags', uploadMeta.tags);
            formData.append('is_starred', String(uploadMeta.is_starred));
            formData.append('owner_name', userDisplayName);

            const res = await lockerFetch('/upload', {
                method: 'POST',
                body: formData
            });
            showToast(res.message || 'Document(s) uploaded!');
            setUploadModalOpen(false);
            setSelectedFiles([]);
            await loadDocuments();
        } catch (err) {
            showToast('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleToggleStar = async (doc, e) => {
        if (e) e.stopPropagation();
        try {
            await lockerFetch(`/documents/${doc.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_starred: !doc.is_starred })
            });
            showToast(!doc.is_starred ? 'Marked as Important ⭐' : 'Removed from Important');
            await loadDocuments();
            if (previewDoc && previewDoc.id === doc.id) {
                setPreviewDoc({ ...previewDoc, is_starred: !doc.is_starred });
            }
        } catch (err) {
            showToast('Update failed: ' + err.message);
        }
    };

    const openEditModal = (doc, e) => {
        if (e) e.stopPropagation();
        setEditForm({
            id: doc.id,
            title: doc.title || '',
            category: doc.category || 'General',
            description: doc.description || '',
            tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : '',
            is_starred: Boolean(doc.is_starred)
        });
        setInlineNewCatOpen(false);
        setInlineNewCatName('');
        setEditDoc(doc);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editForm.id) return;
        setSavingEdit(true);
        try {
            const res = await lockerFetch(`/documents/${editForm.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: editForm.title,
                    category: editForm.category,
                    description: editForm.description,
                    tags: editForm.tags,
                    is_starred: editForm.is_starred
                })
            });
            showToast('Document updated!');
            setEditDoc(null);
            if (previewDoc && previewDoc.id === editForm.id && res.document) {
                setPreviewDoc(res.document);
            }
            await loadDocuments();
        } catch (err) {
            showToast('Update failed: ' + err.message);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeleteDocument = async (doc, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm(`Delete "${doc.title}"?`)) {
            return;
        }
        try {
            await lockerFetch(`/documents/${doc.id}`, { method: 'DELETE' });
            showToast('Document deleted.');
            if (previewDoc && previewDoc.id === doc.id) {
                setPreviewDoc(null);
            }
            await loadDocuments();
        } catch (err) {
            showToast('Delete failed: ' + err.message);
        }
    };

    const resetAllFilters = () => {
        setSearchQuery('');
        setDebouncedQuery('');
        setSelectedCategory('all');
        setSelectedFileType('all');
        setStarredOnly(false);
        setSortBy('newest');
        setPage(1);
    };

    if (!isAuthenticated || !userKey) {
        return null;
    }

    const hasActiveFilters = Boolean(
        debouncedQuery ||
        selectedCategory !== 'all' ||
        selectedFileType !== 'all' ||
        starredOnly
    );

    return (
        <div className="csl-vertical-shell">
            {/* 1. Compact Vertical Header Card */}
            <header className="csl-header-card">
                <div className="csl-header-top">
                    <div className="csl-brand-icon">
                        <FolderLock size={22} />
                    </div>
                    <div className="csl-header-text">
                        <div className="csl-user-badge">
                            <User size={11} />
                            <span>{userDisplayName}&apos;s Locker</span>
                        </div>
                        <h1 className="csl-title">
                            Chaudhary <span className="csl-accent">CS Locker</span>
                        </h1>
                        <p className="csl-subtitle">Personal Digital Document Locker</p>
                    </div>
                </div>

                <button
                    type="button"
                    className="csl-btn csl-btn-primary csl-upload-cta"
                    onClick={openUploadModal}
                >
                    <Upload size={16} /> + Upload Document
                </button>

                {/* 2-Column Summary Strip */}
                <div className="csl-summary-strip">
                    <div
                        className={`csl-summary-box ${!starredOnly && selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => { setStarredOnly(false); setSelectedCategory('all'); setPage(1); }}
                    >
                        <span className="csl-sum-num">{stats.total_documents || 0}</span>
                        <span className="csl-sum-lbl">All Documents</span>
                    </div>
                    <div
                        className={`csl-summary-box ${starredOnly ? 'active' : ''}`}
                        onClick={() => { setStarredOnly(!starredOnly); setPage(1); }}
                    >
                        <span className="csl-sum-num">⭐ {stats.starred_count || 0}</span>
                        <span className="csl-sum-lbl">Important / Starred</span>
                    </div>
                </div>
            </header>

            {/* 2. Vertical Search & Filter Card */}
            <section className="csl-filter-card">
                <div className="csl-search-box">
                    <Search size={16} className="csl-search-icon" />
                    <input
                        type="text"
                        placeholder="Search documents by name, category, or file..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="csl-clear-btn"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="csl-filter-selects">
                    <div className="csl-cat-select-wrap">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                if (e.target.value === '__manage__') {
                                    setCategoryModalOpen(true);
                                } else {
                                    setSelectedCategory(e.target.value);
                                    setPage(1);
                                }
                            }}
                            aria-label="Category"
                        >
                            <option value="all">All Categories</option>
                            {categoryList.map(c => (
                                <option key={c} value={c}>
                                    {c} {stats.category_counts?.[c] ? `(${stats.category_counts[c]})` : ''}
                                </option>
                            ))}
                            <option value="__manage__">⚙️ + Custom Categories...</option>
                        </select>
                        <button
                            type="button"
                            className="csl-cat-gear-btn"
                            title="Manage & Create Custom Categories"
                            onClick={() => setCategoryModalOpen(true)}
                        >
                            <Settings size={15} />
                        </button>
                    </div>

                    <select
                        value={selectedFileType}
                        onChange={(e) => { setSelectedFileType(e.target.value); setPage(1); }}
                        aria-label="File Type"
                    >
                        {FILE_TYPE_FILTERS.map(ft => (
                            <option key={ft.id} value={ft.id}>{ft.label}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        aria-label="Sort By"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name_asc">Name (A–Z)</option>
                        <option value="size_desc">Size (Largest)</option>
                    </select>
                </div>
            </section>

            {/* 3. Vertical Document Stack */}
            {loading ? (
                <div className="csl-empty-card">
                    <div className="csl-spinner"></div>
                    <p>Loading your documents...</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="csl-empty-card">
                    <div className="csl-empty-icon">
                        <FolderLock size={34} />
                    </div>
                    <h3>{hasActiveFilters ? 'No Matching Documents' : 'No Documents Uploaded Yet'}</h3>
                    <p>
                        {hasActiveFilters
                            ? 'Try clearing your search or category filter.'
                            : 'Keep your ID cards, certificates, bills, PDFs, and photos safe in one place.'}
                    </p>
                    <div className="csl-empty-actions">
                        {hasActiveFilters && (
                            <button type="button" className="csl-btn csl-btn-secondary" onClick={resetAllFilters}>
                                Clear Filters
                            </button>
                        )}
                        <button type="button" className="csl-btn csl-btn-primary" onClick={openUploadModal}>
                            <Upload size={15} /> Upload Document
                        </button>
                    </div>
                </div>
            ) : (
                <section className="csl-vertical-list">
                    {documents.map(doc => {
                        const { Icon, color, bg, label } = getFileIconMeta(doc.file_extension);
                        return (
                            <article key={doc.id} className="csl-doc-item" onClick={() => setPreviewDoc(doc)}>
                                <div className="csl-doc-top">
                                    <div className="csl-doc-icon" style={{ color, background: bg }}>
                                        <Icon size={22} />
                                        <span>{label}</span>
                                    </div>
                                    <div className="csl-doc-info">
                                        <div className="csl-doc-badges">
                                            <span className="csl-badge">{doc.category}</span>
                                            <span className="csl-doc-meta">{formatBytes(doc.file_size)} • {formatDateDisplay(doc.created_at)}</span>
                                        </div>
                                        <h3 className="csl-doc-name">{doc.title}</h3>
                                        <div className="csl-doc-file">{doc.original_filename}</div>
                                        {doc.description && (
                                            <p className="csl-doc-notes">{doc.description}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className={`csl-star-btn ${doc.is_starred ? 'starred' : ''}`}
                                        onClick={(e) => handleToggleStar(doc, e)}
                                        title="Mark Important"
                                    >
                                        <Star size={18} fill={doc.is_starred ? '#f59e0b' : 'none'} />
                                    </button>
                                </div>

                                <div className="csl-doc-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className="csl-btn csl-btn-secondary csl-btn-sm"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        <Eye size={14} /> {doc.is_previewable ? 'View' : 'Open'}
                                    </button>
                                    <a
                                        href={getDirectFileUrl(doc.id, 'download')}
                                        download={doc.original_filename}
                                        className="csl-btn csl-btn-primary csl-btn-sm"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                    <button
                                        type="button"
                                        className="csl-icon-btn"
                                        onClick={(e) => openEditModal(doc, e)}
                                        title="Edit"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        className="csl-icon-btn danger"
                                        onClick={(e) => handleDeleteDocument(doc, e)}
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}

            {/* 4. Pagination */}
            {pagination.total_pages > 1 && (
                <div className="csl-pagination">
                    <button
                        type="button"
                        className="csl-btn csl-btn-secondary csl-btn-sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft size={15} /> Prev
                    </button>
                    <span>
                        Page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong>
                    </span>
                    <button
                        type="button"
                        className="csl-btn csl-btn-secondary csl-btn-sm"
                        disabled={page >= pagination.total_pages}
                        onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                    >
                        Next <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* PORTAL MODALS */}
            {typeof document !== 'undefined' && createPortal(
                <div>
                    {/* UPLOAD MODAL */}
                    {uploadModalOpen && (
                        <div className="csl-modal-backdrop" onClick={() => !uploading && setUploadModalOpen(false)}>
                            <div className="csl-modal-card" onClick={(e) => e.stopPropagation()}>
                                <div className="csl-modal-header">
                                    <h3>Upload Document</h3>
                                    <button
                                        type="button"
                                        className="csl-modal-close"
                                        onClick={() => !uploading && setUploadModalOpen(false)}
                                    >
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleUploadSubmit} className="csl-form-stack">
                                    <div
                                        className={`csl-dropzone ${isDragging ? 'dragging' : ''}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={(e) => {
                                                appendFilesToSelection(e.target.files);
                                                e.target.value = '';
                                            }}
                                        />
                                        <Upload size={24} style={{ color: '#f97316', marginBottom: 6 }} />
                                        <h4>Tap to Select Files</h4>
                                        <p>PDF, Word, Excel, Photos, TXT, CSV, ZIP</p>
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div className="csl-selected-list">
                                            {selectedFiles.map((item, idx) => (
                                                <div key={`${item.file.name}-${idx}`} className="csl-selected-row">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Document Name"
                                                            value={item.customTitle}
                                                            onChange={(e) => updateSelectedFileTitle(idx, e.target.value)}
                                                        />
                                                        <small>{item.file.name} ({formatBytes(item.file.size)})</small>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="csl-icon-btn danger"
                                                        onClick={() => removeSelectedFile(idx)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="csl-field">
                                        <div className="csl-field-header-row">
                                            <label>Category</label>
                                            <button
                                                type="button"
                                                className="csl-text-btn-accent"
                                                onClick={() => setInlineNewCatOpen(!inlineNewCatOpen)}
                                            >
                                                {inlineNewCatOpen ? 'Cancel' : '+ New Category'}
                                            </button>
                                        </div>
                                        {inlineNewCatOpen && (
                                            <div className="csl-inline-cat-box">
                                                <input
                                                    type="text"
                                                    placeholder="Category name (e.g. Car Papers)"
                                                    value={inlineNewCatName}
                                                    onChange={(e) => setInlineNewCatName(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const added = await handleAddCategory(inlineNewCatName);
                                                            if (added) {
                                                                setUploadMeta(prev => ({ ...prev, category: added }));
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="csl-btn csl-btn-primary csl-btn-sm"
                                                    onClick={async () => {
                                                        const added = await handleAddCategory(inlineNewCatName);
                                                        if (added) {
                                                            setUploadMeta(prev => ({ ...prev, category: added }));
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                        <select
                                            value={uploadMeta.category}
                                            onChange={(e) => {
                                                if (e.target.value === '__add__') {
                                                    setInlineNewCatOpen(true);
                                                } else {
                                                    setUploadMeta({ ...uploadMeta, category: e.target.value });
                                                }
                                            }}
                                        >
                                            {categoryList.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="__add__">+ Add Custom Category...</option>
                                        </select>
                                    </div>

                                    <div className="csl-field">
                                        <label>Notes / Description (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="Add a short note..."
                                            value={uploadMeta.description}
                                            onChange={(e) => setUploadMeta({ ...uploadMeta, description: e.target.value })}
                                        />
                                    </div>

                                    <label className="csl-check-row">
                                        <input
                                            type="checkbox"
                                            checked={uploadMeta.is_starred}
                                            onChange={(e) => setUploadMeta({ ...uploadMeta, is_starred: e.target.checked })}
                                        />
                                        <span>Mark as Important ⭐</span>
                                    </label>

                                    <div className="csl-modal-footer">
                                        <button
                                            type="button"
                                            className="csl-btn csl-btn-secondary"
                                            disabled={uploading}
                                            onClick={() => setUploadModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="csl-btn csl-btn-primary"
                                            disabled={uploading || selectedFiles.length === 0}
                                        >
                                            {uploading ? 'Uploading...' : 'Save Document'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* PREVIEW MODAL */}
                    {previewDoc && (
                        <div className="csl-modal-backdrop" onClick={() => setPreviewDoc(null)}>
                            <div className="csl-modal-card csl-modal-preview" onClick={(e) => e.stopPropagation()}>
                                <div className="csl-modal-header">
                                    <div style={{ minWidth: 0 }}>
                                        <span className="csl-badge">{previewDoc.category}</span>
                                        <h3 style={{ marginTop: 4, wordBreak: 'break-word' }}>{previewDoc.title}</h3>
                                    </div>
                                    <button type="button" className="csl-modal-close" onClick={() => setPreviewDoc(null)}>
                                        &times;
                                    </button>
                                </div>

                                <div className="csl-preview-box">
                                    {previewDoc.preview_kind === 'pdf' && (
                                        <iframe
                                            src={getDirectFileUrl(previewDoc.id, 'preview')}
                                            title={previewDoc.title}
                                            className="csl-pdf-frame"
                                        />
                                    )}

                                    {previewDoc.preview_kind === 'image' && (
                                        <img
                                            src={getDirectFileUrl(previewDoc.id, 'preview')}
                                            alt={previewDoc.title}
                                            className="csl-preview-img"
                                        />
                                    )}

                                    {previewDoc.preview_kind === 'text' && (
                                        <div className="csl-text-box">
                                            {previewTextLoading ? (
                                                <p>Loading preview...</p>
                                            ) : (
                                                <pre>{previewTextContent}</pre>
                                            )}
                                        </div>
                                    )}

                                    {!previewDoc.is_previewable && (
                                        <div className="csl-no-preview">
                                            <FileArchive size={34} style={{ color: '#f97316' }} />
                                            <h4>{previewDoc.original_filename}</h4>
                                            <p>{formatBytes(previewDoc.file_size)} • Uploaded {formatDateDisplay(previewDoc.created_at)}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="csl-modal-footer">
                                    <button
                                        type="button"
                                        className="csl-btn csl-btn-secondary"
                                        onClick={() => openEditModal(previewDoc)}
                                    >
                                        <Edit3 size={14} /> Edit Info
                                    </button>
                                    <a
                                        href={getDirectFileUrl(previewDoc.id, 'download')}
                                        download={previewDoc.original_filename}
                                        className="csl-btn csl-btn-primary"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Download size={14} /> Download File
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EDIT MODAL */}
                    {editDoc && (
                        <div className="csl-modal-backdrop" onClick={() => !savingEdit && setEditDoc(null)}>
                            <div className="csl-modal-card" onClick={(e) => e.stopPropagation()}>
                                <div className="csl-modal-header">
                                    <h3>Edit Document</h3>
                                    <button type="button" className="csl-modal-close" onClick={() => setEditDoc(null)}>
                                        &times;
                                    </button>
                                </div>
                                <form onSubmit={handleEditSubmit} className="csl-form-stack">
                                    <div className="csl-field">
                                        <label>Document Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="csl-field">
                                        <div className="csl-field-header-row">
                                            <label>Category</label>
                                            <button
                                                type="button"
                                                className="csl-text-btn-accent"
                                                onClick={() => setInlineNewCatOpen(!inlineNewCatOpen)}
                                            >
                                                {inlineNewCatOpen ? 'Cancel' : '+ New Category'}
                                            </button>
                                        </div>
                                        {inlineNewCatOpen && (
                                            <div className="csl-inline-cat-box">
                                                <input
                                                    type="text"
                                                    placeholder="Category name (e.g. Vehicle Docs)"
                                                    value={inlineNewCatName}
                                                    onChange={(e) => setInlineNewCatName(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const added = await handleAddCategory(inlineNewCatName);
                                                            if (added) {
                                                                setEditForm(prev => ({ ...prev, category: added }));
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="csl-btn csl-btn-primary csl-btn-sm"
                                                    onClick={async () => {
                                                        const added = await handleAddCategory(inlineNewCatName);
                                                        if (added) {
                                                            setEditForm(prev => ({ ...prev, category: added }));
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => {
                                                if (e.target.value === '__add__') {
                                                    setInlineNewCatOpen(true);
                                                } else {
                                                    setEditForm({ ...editForm, category: e.target.value });
                                                }
                                            }}
                                        >
                                            {categoryList.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="__add__">+ Add Custom Category...</option>
                                        </select>
                                    </div>
                                    <div className="csl-field">
                                        <label>Notes / Description</label>
                                        <input
                                            type="text"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>
                                    <label className="csl-check-row">
                                        <input
                                            type="checkbox"
                                            checked={editForm.is_starred}
                                            onChange={(e) => setEditForm({ ...editForm, is_starred: e.target.checked })}
                                        />
                                        <span>Mark as Important ⭐</span>
                                    </label>
                                    <div className="csl-modal-footer">
                                        <button type="button" className="csl-btn csl-btn-secondary" onClick={() => setEditDoc(null)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="csl-btn csl-btn-primary" disabled={savingEdit}>
                                            {savingEdit ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MANAGE CUSTOM CATEGORIES MODAL */}
                    {categoryModalOpen && (
                        <div className="csl-modal-backdrop" onClick={() => setCategoryModalOpen(false)}>
                            <div className="csl-modal-card" onClick={(e) => e.stopPropagation()}>
                                <div className="csl-modal-header">
                                    <div>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Tag size={18} color="#ea580c" />
                                            Custom Document Categories
                                        </h3>
                                        <p className="csl-subtitle" style={{ marginTop: 2 }}>
                                            Apne convenient ke hisab se categories create, rename ya delete karein.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="csl-modal-close"
                                        onClick={() => setCategoryModalOpen(false)}
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="csl-form-stack" style={{ marginTop: 12 }}>
                                    {/* Add New Category Form */}
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            await handleAddCategory();
                                        }}
                                        className="csl-cat-add-row"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Enter new category name (e.g. Vehicle Docs)..."
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            maxLength={50}
                                            required
                                        />
                                        <button type="submit" className="csl-btn csl-btn-primary">
                                            + Add
                                        </button>
                                    </form>

                                    {/* Category List */}
                                    <div className="csl-cat-list">
                                        {categories.length === 0 ? (
                                            <p style={{ textAlign: 'center', color: '#71717a', fontSize: '0.85rem', padding: '16px 0' }}>
                                                Loading categories...
                                            </p>
                                        ) : (
                                            categories.map(cat => (
                                                <div key={cat.id} className="csl-cat-item">
                                                    {editingCat?.id === cat.id ? (
                                                        <div className="csl-cat-edit-row">
                                                            <input
                                                                type="text"
                                                                value={editingCat.name}
                                                                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleUpdateCategory(cat.id, editingCat.name);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="csl-btn csl-btn-primary csl-btn-sm"
                                                                onClick={() => handleUpdateCategory(cat.id, editingCat.name)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="csl-btn csl-btn-secondary csl-btn-sm"
                                                                onClick={() => setEditingCat(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="csl-cat-info">
                                                                <span className="csl-cat-dot"></span>
                                                                <strong className="csl-cat-title">{cat.name}</strong>
                                                                <span className="csl-cat-count">
                                                                    {stats.category_counts?.[cat.name] || 0} docs
                                                                </span>
                                                            </div>
                                                            <div className="csl-cat-actions">
                                                                <button
                                                                    type="button"
                                                                    className="csl-icon-btn"
                                                                    title="Rename Category"
                                                                    onClick={() => setEditingCat({ id: cat.id, name: cat.name })}
                                                                >
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="csl-icon-btn danger"
                                                                    title="Delete Category"
                                                                    onClick={() => handleDeleteCategory(cat)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="csl-modal-footer" style={{ justifyContent: 'space-between' }}>
                                        <button
                                            type="button"
                                            className="csl-btn csl-btn-secondary csl-btn-sm"
                                            onClick={handleResetCategories}
                                            title="Restore default standard categories"
                                        >
                                            Restore Defaults
                                        </button>
                                        <button
                                            type="button"
                                            className="csl-btn csl-btn-primary csl-btn-sm"
                                            onClick={() => setCategoryModalOpen(false)}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {toast && (
                        <div className="csl-toast-wrap">
                            <div className="csl-toast">{toast}</div>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default CSLocker;
