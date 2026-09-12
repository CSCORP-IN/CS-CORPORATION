import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { 
    User, Mail, Phone, Lock, FileText, ShoppingBag, 
    ShieldCheck, CheckCircle2, Clock, AlertCircle, Save, 
    ExternalLink, Plus, BookOpen, Layers, Sparkles, KeyRound,
    Globe, Linkedin, Github, Twitter, ArrowRight, Check, Shield
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'purchases' | 'info' | 'security'
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [articles, setArticles] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [stats, setStats] = useState({ totalArticles: 0, publishedArticles: 0, pendingArticles: 0, totalPurchases: 0 });

    // Profile Edit Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        designation: '',
        bio: '',
        linkedin: '',
        github: '',
        twitter: '',
        website: ''
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
    }, [isAuthenticated, user?.email]);

    const fetchUserProfile = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`);
            const data = await response.json();
            if (data.success) {
                setProfileData(data.user);
                setArticles(data.articles || []);
                setPurchases(data.purchases || []);
                setStats(data.stats || { totalArticles: 0, publishedArticles: 0, pendingArticles: 0, totalPurchases: 0 });

                // Fill Edit Form
                setFormData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    phone: data.user.phone || '',
                    designation: data.user.designation || '',
                    bio: data.user.bio || '',
                    linkedin: data.user.socialLinks?.linkedin || '',
                    github: data.user.socialLinks?.github || '',
                    twitter: data.user.socialLinks?.twitter || '',
                    website: data.user.socialLinks?.website || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback({ type: '', message: '' });

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    designation: formData.designation,
                    bio: formData.bio,
                    socialLinks: {
                        linkedin: formData.linkedin,
                        github: formData.github,
                        twitter: formData.twitter,
                        website: formData.website
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                setFeedback({ type: 'success', message: 'Profile updated successfully!' });
                setProfileData(data.user);
            } else {
                setFeedback({ type: 'error', message: data.message || 'Error updating profile' });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Connection error while saving profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        if (passwordData.newPassword.length < 6) {
            return setFeedback({ type: 'error', message: 'New password must be at least 6 characters long' });
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setFeedback({ type: 'error', message: 'New passwords do not match' });
        }

        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();
            if (data.success) {
                setFeedback({ type: 'success', message: 'Password changed successfully! Keep it safe.' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setFeedback({ type: 'error', message: data.message || 'Error changing password' });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Connection error while changing password' });
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) return null;

    const userInitial = (profileData?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

    return (
        <div className="profile-page-wrap animate-fade-in">
            {/* Ambient Lighting Mesh (Matching Anant Portfolio) */}
            <div className="profile-ambient-mesh">
                <div className="profile-orb profile-orb-orange"></div>
                <div className="profile-orb profile-orb-emerald"></div>
                <div className="profile-grid-overlay"></div>
            </div>

            <div className="profile-container">
                {/* Profile Top Hero Card */}
                <div className="profile-header-card glass-card">
                    <div className="profile-hero-top">
                        <div className="profile-avatar-box">
                            <div className="avatar-ring">
                                <span className="avatar-letter">{userInitial}</span>
                            </div>
                        </div>

                        <div className="profile-intro-col">
                            <div className="profile-name-row">
                                <h1 className="profile-full-name">
                                    {profileData?.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : user?.email?.split('@')[0]}
                                </h1>
                                <div className="profile-badges-cluster">
                                    <span className={`profile-role-pill ${profileData?.role === 'admin' ? 'admin' : 'member'}`}>
                                        <ShieldCheck size={12} />
                                        <span>{profileData?.role?.toUpperCase() || 'MEMBER'}</span>
                                    </span>
                                    <span className="profile-verified-pill">
                                        <CheckCircle2 size={12} />
                                        <span>Verified</span>
                                    </span>
                                </div>
                            </div>

                            <p className="profile-designation-text">
                                {profileData?.designation || 'Technical Contributor & Engineering Member'}
                            </p>

                            <p className="profile-email-text">
                                <Mail size={13} />
                                <span>{user?.email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats Metric Strip */}
                    <div className="profile-stats-strip">
                        <div className="profile-stat-item">
                            <span className="stat-value">{stats.publishedArticles}</span>
                            <span className="stat-label">Published Articles</span>
                        </div>
                        <div className="profile-stat-divider"></div>
                        <div className="profile-stat-item">
                            <span className="stat-value">{stats.pendingArticles}</span>
                            <span className="stat-label">Pending Review</span>
                        </div>
                        <div className="profile-stat-divider"></div>
                        <div className="profile-stat-item">
                            <span className="stat-value">{purchases.length}</span>
                            <span className="stat-label">Enrolled Courses</span>
                        </div>
                    </div>
                </div>

                {/* Segmented Tab Navigation with Horizontal Swipe */}
                <div className="profile-segmented-nav-wrap">
                    <div className="profile-segmented-nav glass">
                        <button
                            className={`profile-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('articles'); setFeedback({ type: '', message: '' }); }}
                        >
                            <FileText size={16} />
                            <span className="tab-text-full">My Articles ({articles.length})</span>
                            <span className="tab-text-short">Articles ({articles.length})</span>
                        </button>
                        <button
                            className={`profile-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('purchases'); setFeedback({ type: '', message: '' }); }}
                        >
                            <ShoppingBag size={16} />
                            <span className="tab-text-full">My Purchases ({purchases.length})</span>
                            <span className="tab-text-short">Purchases ({purchases.length})</span>
                        </button>
                        <button
                            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('info'); setFeedback({ type: '', message: '' }); }}
                        >
                            <User size={16} />
                            <span>Edit Profile</span>
                        </button>
                        <button
                            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('security'); setFeedback({ type: '', message: '' }); }}
                        >
                            <Lock size={16} />
                            <span className="tab-text-full">Security & Password</span>
                            <span className="tab-text-short">Security</span>
                        </button>
                    </div>
                </div>

                {/* Feedback Notification Alert */}
                {feedback.message && (
                    <div className={`profile-alert-banner ${feedback.type} animate-fade-in`}>
                        {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{feedback.message}</span>
                    </div>
                )}

                {/* TAB 1: MY ARTICLES */}
                {activeTab === 'articles' && (
                    <div className="profile-tab-content animate-fade-in">
                        <div className="tab-section-header">
                            <div>
                                <h2>Authored Articles ({articles.length})</h2>
                                <p>Articles and blueprints submitted by you to Chaudhary Articles.</p>
                            </div>
                            <Link to="/post" className="btn-primary post-new-btn">
                                <Plus size={16} />
                                <span>Write New Article</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="empty-tab-box glass-card">
                                <Sparkles className="animate-spin" size={32} color="#ea580c" />
                                <p>Loading your articles...</p>
                            </div>
                        ) : articles.length > 0 ? (
                            <div className="profile-articles-list">
                                {articles.map((art) => (
                                    <div key={art.id || art._id} className="profile-item-card glass-card">
                                        <div className="item-info-col">
                                            <div className="item-badge-row">
                                                <span className={`status-pill ${art.status}`}>
                                                    {art.status === 'approved' ? (
                                                        <><CheckCircle2 size={12} /> Live / Published</>
                                                    ) : art.status === 'rejected' ? (
                                                        <><AlertCircle size={12} /> Rejected</>
                                                    ) : (
                                                        <><Clock size={12} /> Pending Review</>
                                                    )}
                                                </span>
                                                <span className="category-tag">{art.category}</span>
                                                <span className="date-tag">{art.date || 'Recent'}</span>
                                            </div>

                                            <h3 className="item-card-title">{art.title}</h3>
                                            {art.excerpt && <p className="item-card-excerpt">{art.excerpt}</p>}
                                        </div>

                                        <div className="item-actions-col">
                                            {art.status === 'approved' ? (
                                                <Link to={`/articles/${art.id || art._id}`} className="view-article-btn">
                                                    <span>View Live</span>
                                                    <ExternalLink size={14} />
                                                </Link>
                                            ) : (
                                                <span className="under-review-tag">
                                                    <Clock size={13} /> Awaiting Admin Approval
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-tab-box glass-card">
                                <FileText size={44} className="empty-icon-amber" />
                                <h3>No articles published yet</h3>
                                <p>Share your architectural insights, technical tutorials, and IBM Maximo blueprints with the community.</p>
                                <Link to="/post" className="btn-primary mt-2">
                                    <Plus size={16} />
                                    <span>Submit Your First Article</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: MY PURCHASES & ENROLLED COURSES */}
                {activeTab === 'purchases' && (
                    <div className="profile-tab-content animate-fade-in">
                        <div className="tab-section-header">
                            <div>
                                <h2>Purchased Modules & Enrolled Courses ({purchases.length})</h2>
                                <p>Modules, training bundles, and advisory sessions associated with your account.</p>
                            </div>
                            <Link to="/courses" className="btn-primary post-new-btn">
                                <Layers size={16} />
                                <span>Browse Courses</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="empty-tab-box glass-card">
                                <Sparkles className="animate-spin" size={32} color="#ea580c" />
                                <p>Loading your purchases...</p>
                            </div>
                        ) : purchases.length > 0 ? (
                            <div className="profile-purchases-list">
                                {purchases.map((purchase) => (
                                    <div key={purchase.id || purchase._id} className="profile-item-card glass-card">
                                        <div className="item-info-col">
                                            <div className="item-badge-row">
                                                <span className="purchase-type-badge">{purchase.itemType?.toUpperCase() || 'MODULE'}</span>
                                                <span className="purchase-status-badge">
                                                    <Check size={12} /> {purchase.status?.toUpperCase() || 'CONFIRMED'}
                                                </span>
                                            </div>

                                            <h3 className="item-card-title">{purchase.selectedItem}</h3>
                                            <p className="item-card-sub">
                                                Enrolled on {new Date(purchase.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="item-actions-col">
                                            <Link to="/courses" className="access-course-btn">
                                                <span>Access Materials</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-tab-box glass-card">
                                <ShoppingBag size={44} className="empty-icon-cyan" />
                                <h3>No purchased courses found</h3>
                                <p>You have not enrolled in any training modules or architectural bundles yet.</p>
                                <Link to="/courses" className="btn-primary mt-2">
                                    <BookOpen size={16} />
                                    <span>Explore ChaudharyConnect Modules</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: EDIT PROFILE INFORMATION */}
                {activeTab === 'info' && (
                    <div className="profile-tab-content animate-fade-in">
                        <div className="tab-section-header">
                            <div>
                                <h2>Profile & Author Information</h2>
                                <p>Update your technical credentials, public designation, and community social links.</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="profile-form-wrap glass-card">
                            <div className="profile-form-grid">
                                <div className="form-input-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="e.g. Ankit"
                                        required
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="e.g. Chaudhary"
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label>Email Address (Account ID)</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="disabled-field"
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="form-input-group full-width">
                                    <label>Professional Designation / Role</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        placeholder="e.g. Enterprise Asset Management Architect | Full-Stack Engineer"
                                    />
                                </div>
                                <div className="form-input-group full-width">
                                    <label>Bio & Technical Background</label>
                                    <textarea
                                        rows="3"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Write a brief intro about your engineering experience and areas of expertise..."
                                    />
                                </div>

                                <div className="form-input-group">
                                    <label><Linkedin size={14} /> LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                <div className="form-input-group">
                                    <label><Github size={14} /> GitHub Profile</label>
                                    <input
                                        type="url"
                                        value={formData.github}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                            </div>

                            <div className="form-actions-foot">
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    <Save size={16} />
                                    <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 4: SECURITY & CHANGE PASSWORD */}
                {activeTab === 'security' && (
                    <div className="profile-tab-content animate-fade-in">
                        <div className="tab-section-header">
                            <div>
                                <h2>Security & Password Management</h2>
                                <p>Ensure your account is protected with a strong, unique password.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="profile-form-wrap glass-card security-card">
                            <div className="form-input-group full-width">
                                <label>Current Password</label>
                                <div className="password-field-box">
                                    <KeyRound className="field-icon" size={17} />
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        placeholder="Enter your current password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-input-group full-width">
                                <label>New Password (Min. 6 characters)</label>
                                <div className="password-field-box">
                                    <Lock className="field-icon" size={17} />
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Enter new strong password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-input-group full-width">
                                <label>Confirm New Password</label>
                                <div className="password-field-box">
                                    <Lock className="field-icon" size={17} />
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Re-type new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions-foot">
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    <Lock size={16} />
                                    <span>{saving ? 'Updating Password...' : 'Update Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
