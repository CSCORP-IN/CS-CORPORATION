import mongoose from 'mongoose';

const toJsonConfig = {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

const csLockerCategorySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#f97316',
        trim: true
    },
    icon: {
        type: String,
        default: 'folder',
        trim: true
    }
}, {
    collection: 'cslocker_categories',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: toJsonConfig
});

csLockerCategorySchema.index({ user_id: 1, name: 1 }, { unique: true });

export const DEFAULT_CSLOCKER_CATEGORIES = [
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

export const CSLockerCategory = mongoose.model('CSLockerCategory', csLockerCategorySchema);
export default CSLockerCategory;
