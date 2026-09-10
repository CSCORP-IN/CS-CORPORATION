import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import Article from './models/Article.js';
import User from './models/User.js';
import Enquiry from './models/Enquiry.js';
import { sendOTPEmail, sendContactEmail, sendEnquiryEmail } from './utils/emailService.js';

dotenv.config();

// Ensure reliable Atlas DNS resolution
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Dynamic CORS configuration supporting Netlify, custom domains, and local dev
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : [];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow localhost development origins
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }

        // Allow any *.netlify.app origin, explicitly configured FRONTEND_URL, or fallback
        if (
            origin.endsWith('.netlify.app') ||
            allowedOrigins.includes(origin) ||
            allowedOrigins.includes('*') ||
            allowedOrigins.length === 0
        ) {
            return callback(null, true);
        }

        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check and status endpoints for Render deployment & uptime monitoring
app.get(['/', '/health', '/api/health'], (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Chaudhary & Sons API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} [${res.statusCode}] - ${duration}ms`);
        if (req.method === 'POST' || req.method === 'PUT') {
            const safeBody = { ...req.body };
            if (safeBody.password) safeBody.password = '****';
            console.log('Body:', safeBody);
        }
    });
    next();
});

// MongoDB Connection
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err.message);
            console.error('Make sure you have replaced <db_password> in the .env file and your IP is whitelisted in Atlas.');
        });
} else {
    console.warn('⚠️ MONGODB_URI is not set in environment. Running in mock/stateless mode.');
}

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const CV_DIR = path.join(UPLOADS_DIR, 'CV');

if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
}
if (!existsSync(CV_DIR)) {
    mkdirSync(CV_DIR, { recursive: true });
}

// Serve static files from uploads folder
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes

// Signup (Initiates OTP Verification)
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
            } else {
                // If user registered earlier but never verified OTP, generate a fresh OTP and resend
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                existingUser.otp = otp;
                existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
                if (firstName) existingUser.firstName = firstName;
                if (lastName) existingUser.lastName = lastName;
                if (password) existingUser.password = password;
                if (phone) existingUser.phone = phone;
                await existingUser.save();

                await sendOTPEmail(email, otp, firstName || existingUser.firstName);

                return res.status(200).json({
                    success: true,
                    requireOtp: true,
                    email: existingUser.email,
                    message: 'Account exists but is unverified. A fresh 6-digit OTP has been sent to your email.'
                });
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'user',
            isVerified: false,
            otp,
            otpExpiry
        });

        await sendOTPEmail(email, otp, firstName);

        res.status(201).json({
            success: true,
            requireOtp: true,
            email: newUser.email,
            message: 'Registration initiated! Please enter the 6-digit OTP sent to your email.'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Server error during signup', error: error.message });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Account is already verified. Please sign in.' });
        }

        if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < Date.now())) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please try again or resend OTP.' });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email successfully verified! Welcome aboard.',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP verification', error: error.message });
    }
});

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Account is already verified.' });
        }

        // Generate a new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTPEmail(email, otp, user.firstName);

        res.json({ success: true, message: 'A fresh 6-digit OTP has been sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP resend', error: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: username },
                { username: username }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            // Check if user account is verified (admin accounts or verified users)
            if (user.role !== 'admin' && user.isVerified === false) {
                // Generate and send new OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
                await user.save();
                await sendOTPEmail(user.email, otp, user.firstName);

                return res.status(401).json({
                    success: false,
                    requireOtp: true,
                    email: user.email,
                    message: 'Your account is not verified yet. A new OTP has been sent to your email.'
                });
            }

            return res.json({
                success: true,
                user: {
                    firstName: user.firstName || 'Admin',
                    lastName: user.lastName || 'User',
                    email: user.email,
                    role: user.role
                }
            });
        }

        res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Get Articles
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.json(articles); // Schema toJSON handles mapping _id to id
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles' });
    }
});

// Create Article
app.post('/api/articles', async (req, res) => {
    try {
        const newArticle = await Article.create({
            ...req.body,
            status: 'pending'
        });
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating article' });
    }
});

// Update Article
app.put('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if id is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid article ID' });
        }
        await Article.findByIdAndUpdate(id, req.body);
        res.json({ message: 'Article updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating article' });
    }
});

// Approve Article (Admin Action)
app.patch('/api/articles/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid article ID' });
        }
        const updatedArticle = await Article.findByIdAndUpdate(
            id, 
            { status: 'approved' }, 
            { new: true }
        );
        if (!updatedArticle) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        res.json({ success: true, message: 'Article successfully approved and published!', article: updatedArticle });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error approving article', error: error.message });
    }
});

// Update Article Status (Admin Action: approve / reject / pending)
app.patch('/api/articles/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, approved, or rejected.' });
    }
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid article ID' });
        }
        const updatedArticle = await Article.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, message: `Article status updated to ${status}`, article: updatedArticle });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating article status', error: error.message });
    }
});

// Delete Article
app.delete('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid article ID' });
        }
        await Article.findByIdAndDelete(id);
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article' });
    }
});

// User Management Routes

// Get all users (Admin only role check could be here, but using basic route for now)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Create User (Admin)
app.post('/api/users', async (req, res) => {
    const { firstName, lastName, email, username, password, phone, role } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email or username' });
        }
        const newUser = await User.create({
            firstName, lastName, email, username, password, phone, role: role || 'user'
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Update User (Admin)
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (updateData.password && updateData.password.trim()) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// ==========================================
// USER SELF-SERVICE PROFILE & ACTIVITY ROUTES
// ==========================================

// Get Current User Profile, Submitted Articles, and Purchases
app.get('/api/user/profile', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'User email is required' });
    }

    try {
        const user = await User.findOne({ email }).select('-password -otp -otpExpiry');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch articles submitted by this user (by authorEmail or author name)
        const userArticles = await Article.find({
            $or: [
                { authorEmail: user.email },
                { author: `${user.firstName || ''} ${user.lastName || ''}`.trim() }
            ]
        }).sort({ createdAt: -1 });

        // Fetch purchases / enrolled courses (from Enquiries collection)
        const userPurchases = await Enquiry.find({ email: user.email }).sort({ createdAt: -1 });

        res.json({
            success: true,
            user,
            articles: userArticles,
            purchases: userPurchases,
            stats: {
                totalArticles: userArticles.length,
                publishedArticles: userArticles.filter(a => a.status === 'approved').length,
                pendingArticles: userArticles.filter(a => a.status === 'pending').length,
                totalPurchases: userPurchases.length
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Error loading user profile', error: error.message });
    }
});

// Update User Profile Information
app.put('/api/user/profile', async (req, res) => {
    const { email, firstName, lastName, phone, designation, bio, socialLinks } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'User email is required' });
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { 
                firstName, 
                lastName, 
                phone, 
                designation, 
                bio, 
                socialLinks: socialLinks || {} 
            },
            { new: true }
        ).select('-password -otp -otpExpiry');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
});

// Change User Password
app.put('/api/user/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save(); // Pre-save hook hashes with bcrypt automatically

        res.json({ success: true, message: 'Password changed successfully! Please use your new password next time.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Error changing password', error: error.message });
    }
});

// Contact Form Route (Connect with us & general inquiries)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and message are required.' 
            });
        }

        const formattedSubject = subject || 'General Portal Connect';
        let savedId = null;

        // Persist message in MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const savedEnquiry = await Enquiry.create({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone ? phone.trim() : undefined,
                    selectedItem: formattedSubject,
                    itemType: 'contact',
                    message: message.trim()
                });
                savedId = savedEnquiry._id;
            } catch (dbErr) {
                console.error('Database write error (Enquiry.create):', dbErr.message);
            }
        }

        // Trigger email dispatch to admin@cscorp.in and auto-confirmation to user
        sendContactEmail({
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : undefined,
            subject: formattedSubject,
            message: message.trim()
        }).catch(err => console.error('Background contact email error:', err));

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! Our team will contact you soon.',
            id: savedId
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while sending message. Please try again later.' 
        });
    }
});

// Course Enquiry Routes
app.post('/api/enquiries', async (req, res) => {
    try {
        const { name, email, phone, selectedItem, itemType, message } = req.body;
        if (!name || !email || !selectedItem) {
            return res.status(400).json({ success: false, message: 'Name, email, and course selection are required.' });
        }

        let newEnquiry = null;
        if (mongoose.connection.readyState === 1) {
            try {
                newEnquiry = await Enquiry.create({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone ? phone.trim() : undefined,
                    selectedItem,
                    itemType: itemType || 'module',
                    message: message ? message.trim() : undefined
                });
            } catch (dbErr) {
                console.error('Database write error (Enquiry.create):', dbErr.message);
            }
        }

        // Send email notification to admin & student
        sendEnquiryEmail({
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : undefined,
            selectedItem,
            itemType: itemType || 'module',
            message: message ? message.trim() : undefined
        }).catch(err => console.error('Background enquiry email error:', err));

        res.status(201).json({ 
            success: true, 
            enquiry: newEnquiry, 
            message: 'Enquiry submitted successfully!' 
        });
    } catch (error) {
        console.error('Enquiry submission error:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting enquiry.' });
    }
});

app.get('/api/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enquiries' });
    }
});

app.put('/api/enquiries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid enquiry ID' });
        }
        const updated = await Enquiry.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating enquiry' });
    }
});

app.delete('/api/enquiries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid enquiry ID' });
        }
        await Enquiry.findByIdAndDelete(id);
        res.json({ message: 'Enquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting enquiry' });
    }
});

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Respect explicit SERVER_URL or construct from request proxy headers
    const serverBase = process.env.SERVER_URL
        ? process.env.SERVER_URL.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${serverBase}/uploads/images/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
});

app.listen(PORT, () => {
    console.log(`✅ Server successfully started and running on port ${PORT}`);
    if (process.env.SERVER_URL) {
        console.log(`🌐 Public API URL: ${process.env.SERVER_URL}`);
    }
});

