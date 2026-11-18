import mongoose from 'mongoose';

const toJsonConfig = {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.disk_path;
        return ret;
    }
};

const csLockerDocumentSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    owner_name: {
        type: String,
        default: '',
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    category: {
        type: String,
        default: 'General',
        index: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    is_starred: {
        type: Boolean,
        default: false,
        index: true
    },
    original_filename: {
        type: String,
        required: true,
        trim: true
    },
    stored_filename: {
        type: String,
        required: true,
        trim: true
    },
    file_extension: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    mime_type: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    file_size: {
        type: Number,
        required: true,
        default: 0
    },
    storage_backend: {
        type: String,
        enum: ['gridfs', 'disk'],
        default: 'gridfs'
    },
    gridfs_file_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
    },
    disk_path: {
        type: String,
        default: ''
    },
    checksum_sha256: {
        type: String,
        default: ''
    }
}, {
    collection: 'cslocker_documents',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

csLockerDocumentSchema.index({ user_id: 1, created_at: -1 });
csLockerDocumentSchema.index({ user_id: 1, category: 1, created_at: -1 });
csLockerDocumentSchema.index({ user_id: 1, file_extension: 1, created_at: -1 });

export const CSLockerDocument = mongoose.model('CSLockerDocument', csLockerDocumentSchema);
export default CSLockerDocument;
