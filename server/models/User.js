import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        trim: true,
        default: '' 
    },
    lastName: { 
        type: String, 
        trim: true,
        default: '' 
    },
    email: { 
        type: String, 
        required: [true, 'Email address is required'], 
        unique: true, 
        lowercase: true, 
        trim: true,
        index: true
    },
    username: { 
        type: String, 
        unique: true, 
        sparse: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'] 
    },
    phone: { 
        type: String, 
        trim: true,
        default: '' 
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    designation: { 
        type: String, 
        default: 'Technical Contributor' 
    },
    bio: { 
        type: String, 
        default: '' 
    },
    role: { 
        type: String, 
        default: 'user', 
        enum: ['user', 'contributor', 'moderator', 'admin'],
        index: true 
    },
    status: { 
        type: String, 
        default: 'active', 
        enum: ['active', 'pending', 'suspended', 'inactive'],
        index: true 
    },
    // Personalized Workspace Preferences:
    // [] or ['all'] = Full Ecosystem (Everything)
    // ['khatakit'] = Only KhataKit
    // ['cslocker'] = Only CS Locker
    // ['khatakit', 'cslocker'] = Both tools
    enabledModules: {
        type: [String],
        default: []
    },
    hasChosenPreferences: {
        type: Boolean,
        default: false
    },
    isVerified: { 
        type: Boolean, 
        default: false,
        index: true 
    },
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    },
    lastLogin: { 
        type: Date,
        default: Date.now 
    },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        twitter: { type: String, default: '' },
        website: { type: String, default: '' }
    }
}, { 
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret.password;
            delete ret.otp;
            delete ret.otpExpiry;
            return ret;
        }
    }
});

// Virtual for Full Name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username || this.email;
});

// Pre-save hook: Encrypt/Hash password before saving to MongoDB
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    // If legacy plaintext password in DB, support backward compatibility
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        return enteredPassword === this.password;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
