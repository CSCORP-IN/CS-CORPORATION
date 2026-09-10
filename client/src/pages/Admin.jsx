import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useArticles } from '../context/ArticleContext';
import { useAuth } from '../context/AuthContext';
import { 
    Check, Trash2, Clock, ShieldCheck, Edit, ExternalLink, Users, 
    FileText, Mail, Phone, Calendar, Plus, X, Save, Sparkles, 
    LayoutDashboard, CheckCircle2, AlertTriangle, Shield, UserCheck,
    GraduationCap, MessageSquare, ArrowRight, BookOpen, Layers, RefreshCw
} from 'lucide-react';
import './Admin.css';

const Admin = () => {
    const { articles, approveArticle, deleteArticle } = useArticles();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'enquiries' | 'users'
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Enquiries State
    const [enquiries, setEnquiries] = useState([]);
    const [loadingEnquiries, setLoadingEnquiries] = useState(false);

    // User Form State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        role: 'user'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user?.role !== 'admin') {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'enquiries') {
            fetchEnquiries();
        }
    }, [activeTab]);

    // Initial load for top metrics
    useEffect(() => {
        fetchEnquiries();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`);
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchEnquiries = async () => {
        setLoadingEnquiries(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/enquiries`);
            const data = await response.json();
            setEnquiries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
        } finally {
            setLoadingEnquiries(false);
        }
    };

    const handleUpdateEnquiryStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setEnquiries(enquiries.map(enq => (enq.id === id || enq._id === id ? { ...enq, status: newStatus } : enq)));
            }
        } catch (error) {
            console.error('Error updating enquiry status:', error);
        }
    };

    const handleDeleteEnquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setEnquiries(enquiries.filter(enq => (enq.id || enq._id) !== id));
            }
        } catch (error) {
            console.error('Error deleting enquiry:', error);
        }
    };

    const handleOpenModal = (userToEdit = null) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setUserFormData({
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                email: userToEdit.email || '',
                username: userToEdit.username || '',
                password: '',
                phone: userToEdit.phone || '',
                role: userToEdit.role || 'user'
            });
        } else {
            setEditingUser(null);
            setUserFormData({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                phone: '',
                role: 'user'
            });
        }
        setShowUserModal(true);
    };

    const handleCloseModal = () => {
        setShowUserModal(false);
        setEditingUser(null);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        const url = editingUser
            ? `${API_BASE_URL}/api/users/${editingUser._id}`
            : `${API_BASE_URL}/api/users`;
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFormData)
            });

            if (response.ok) {
                fetchUsers();
                handleCloseModal();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error saving user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Server error while saving user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (!isAuthenticated || user?.role !== 'admin') return null;

    const pendingArticles = articles.filter(art => art.status === 'pending');
    const approvedArticles = articles.filter(art => art.status === 'approved');
    const newEnquiries = enquiries.filter(e => e.status === 'new' || !e.status);

    return (
        <div className="admin-container animate-fade-in">
            {/* Ambient Lighting Mesh (Consistent with Anant Portfolio) */}
            <div className="admin-ambient-mesh">
                <div className="admin-orb admin-orb-orange"></div>
                <div className="admin-orb admin-orb-emerald"></div>
                <div className="admin-grid-overlay"></div>
            </div>

            {/* Page Header */}
            <header className="admin-page-header">
                <div className="admin-status-pill">
                    <span className="admin-live-dot"></span>
                    <Shield size={13} />
                    <span>CHAUDHARY &amp; SONS ADMIN HUB</span>
                </div>
                <h1 className="admin-hero-title">
                    Manage <span className="text-gradient-primary">Dashboard</span>
                </h1>
                <p className="admin-hero-sub">
                    Oversee technical publications, manage live course enquiries, and administer user privileges.
                </p>
            </header>

            {/* Top Metrics Cards */}
            <div className="admin-analytics-grid">
                <div className="analytics-stat-card glass-card">
                    <div className="stat-icon-wrap amber">
                        <Clock size={20} />
                    </div>
                    <div className="stat-text">
                        <span className="stat-number">{pendingArticles.length}</span>
                        <span className="stat-title">Pending Articles</span>
                    </div>
                </div>

                <div className="analytics-stat-card glass-card">
                    <div className="stat-icon-wrap emerald">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="stat-text">
                        <span className="stat-number">{approvedArticles.length}</span>
                        <span className="stat-title">Published Articles</span>
                    </div>
                </div>

                <div className="analytics-stat-card glass-card">
                    <div className="stat-icon-wrap sunset">
                        <GraduationCap size={20} />
                    </div>
                    <div className="stat-text">
                        <span className="stat-number">{enquiries.length}</span>
                        <span className="stat-title">Leads ({newEnquiries.length} New)</span>
                    </div>
                </div>

                <div className="analytics-stat-card glass-card">
                    <div className="stat-icon-wrap cyan">
                        <Users size={20} />
                    </div>
                    <div className="stat-text">
                        <span className="stat-number">{users.length > 0 ? users.length : 'Active'}</span>
                        <span className="stat-title">Registered Users</span>
                    </div>
                </div>
            </div>

            {/* Segmented Tab Navigation with Horizontal Swipe Support */}
            <div className="admin-segmented-tabs-wrap">
                <div className="admin-segmented-tabs glass">
                    <button
                        className={`seg-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('articles')}
                    >
                        <FileText size={16} />
                        <span className="tab-label-full">Articles Moderation</span>
                        <span className="tab-label-short">Articles</span>
                        <span className="tab-count-pill">{pendingArticles.length + approvedArticles.length}</span>
                    </button>
                    <button
                        className={`seg-tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('enquiries')}
                    >
                        <GraduationCap size={16} />
                        <span className="tab-label-full">Course Enquiries</span>
                        <span className="tab-label-short">Enquiries</span>
                        <span className="tab-count-pill">{enquiries.length}</span>
                        {newEnquiries.length > 0 && <span className="tab-bubble-badge">{newEnquiries.length} new</span>}
                    </button>
                    <button
                        className={`seg-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={16} />
                        <span className="tab-label-full">User Directory</span>
                        <span className="tab-label-short">Users</span>
                        <span className="tab-count-pill">{users.length}</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: ARTICLES MANAGEMENT */}
            {activeTab === 'articles' && (
                <div className="admin-tab-content animate-fade-in">
                    {/* Pending Section */}
                    <div className="admin-mod-section">
                        <div className="mod-section-header">
                            <div className="section-title-wrap">
                                <Clock size={18} className="section-icon-amber" />
                                <h2>Pending Approvals ({pendingArticles.length})</h2>
                            </div>
                        </div>

                        <div className="mod-cards-list">
                            {pendingArticles.length === 0 ? (
                                <div className="empty-panel glass-card">
                                    <CheckCircle2 size={36} color="#10b981" />
                                    <p>All caught up! No articles currently waiting for approval.</p>
                                </div>
                            ) : (
                                pendingArticles.map(article => (
                                    <div key={article.id || article._id} className="mod-item-card glass-card pending-card">
                                        <div className="mod-info-col">
                                            <div className="mod-meta-badges">
                                                <span className="badge-pill amber">
                                                    <Clock size={11} /> Pending
                                                </span>
                                                <span className="badge-pill cyan">{article.category}</span>
                                                <span className="mod-date-pill">
                                                    <Calendar size={11} /> {article.date || 'Recent'}
                                                </span>
                                            </div>
                                            <h3 className="mod-item-title">{article.title}</h3>
                                            <p className="mod-item-sub">
                                                By <strong>{article.author}</strong>
                                            </p>
                                            {article.excerpt && (
                                                <p className="mod-item-excerpt">{article.excerpt}</p>
                                            )}
                                        </div>

                                        <div className="mod-actions-col">
                                            <button
                                                className="action-icon-btn approve"
                                                onClick={() => approveArticle(article.id || article._id)}
                                                title="Approve & Publish"
                                            >
                                                <Check size={16} />
                                                <span>Approve</span>
                                            </button>
                                            <div className="action-sub-buttons">
                                                <Link
                                                    to={`/admin/edit/${article.id || article._id}`}
                                                    className="action-icon-btn edit"
                                                    title="Edit Content"
                                                >
                                                    <Edit size={16} />
                                                    <span className="btn-text-mobile">Edit</span>
                                                </Link>
                                                <button
                                                    className="action-icon-btn delete"
                                                    onClick={() => deleteArticle(article.id || article._id)}
                                                    title="Reject / Delete"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="btn-text-mobile">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Published Section */}
                    <div className="admin-mod-section published-section-wrap">
                        <div className="mod-section-header">
                            <div className="section-title-wrap">
                                <ShieldCheck size={18} className="section-icon-emerald" />
                                <h2>Published &amp; Live Articles ({approvedArticles.length})</h2>
                            </div>
                        </div>

                        <div className="mod-cards-list">
                            {approvedArticles.length === 0 ? (
                                <div className="empty-panel glass-card">
                                    <p>No published articles yet.</p>
                                </div>
                            ) : (
                                approvedArticles.map(article => (
                                    <div key={article.id || article._id} className="mod-item-card glass-card">
                                        <div className="mod-info-col">
                                            <div className="mod-meta-badges">
                                                <span className="badge-pill emerald">
                                                    <CheckCircle2 size={11} /> Published
                                                </span>
                                                <span className="badge-pill cyan">{article.category}</span>
                                                <span className="mod-date-pill">
                                                    <Calendar size={11} /> {article.date || 'Recent'}
                                                </span>
                                            </div>
                                            <h3 className="mod-item-title">{article.title}</h3>
                                            <p className="mod-item-sub">
                                                By <strong>{article.author}</strong>
                                            </p>
                                        </div>

                                        <div className="mod-actions-col">
                                            <Link
                                                to={`/articles/${article.id || article._id}`}
                                                className="action-icon-btn view"
                                                title="View Live Article"
                                            >
                                                <ExternalLink size={16} />
                                                <span>View Live</span>
                                            </Link>
                                            <div className="action-sub-buttons">
                                                <Link
                                                    to={`/admin/edit/${article.id || article._id}`}
                                                    className="action-icon-btn edit"
                                                    title="Edit Content"
                                                >
                                                    <Edit size={16} />
                                                    <span className="btn-text-mobile">Edit</span>
                                                </Link>
                                                <button
                                                    className="action-icon-btn delete"
                                                    onClick={() => deleteArticle(article.id || article._id)}
                                                    title="Delete Article"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="btn-text-mobile">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: COURSE ENQUIRIES & LEADS */}
            {activeTab === 'enquiries' && (
                <div className="admin-tab-content animate-fade-in">
                    <div className="mod-section-header enquiry-head-flex">
                        <div className="section-title-wrap">
                            <GraduationCap size={18} className="section-icon-sunset" />
                            <h2>ChaudharyConnect Leads ({enquiries.length})</h2>
                        </div>
                        <button className="btn-secondary refresh-btn-mobile" onClick={fetchEnquiries} disabled={loadingEnquiries}>
                            <RefreshCw size={14} className={loadingEnquiries ? 'animate-spin' : ''} />
                            <span>{loadingEnquiries ? 'Refreshing...' : 'Refresh Leads'}</span>
                        </button>
                    </div>

                    <div className="mod-cards-list">
                        {loadingEnquiries ? (
                            <div className="empty-panel glass-card">
                                <Sparkles className="animate-spin" size={28} color="#ea580c" />
                                <p>Loading enquiries...</p>
                            </div>
                        ) : enquiries.length === 0 ? (
                            <div className="empty-panel glass-card">
                                <GraduationCap size={36} color="#ea580c" />
                                <p>No course enquiries received yet.</p>
                            </div>
                        ) : (
                            enquiries.map((enq) => {
                                const enqId = enq.id || enq._id;
                                return (
                                    <div key={enqId} className="mod-item-card glass-card enquiry-item-card">
                                        <div className="mod-info-col">
                                            <div className="mod-meta-badges">
                                                <span className={`status-badge-pill ${enq.status || 'new'}`}>
                                                    {enq.status ? enq.status.toUpperCase() : 'NEW LEAD'}
                                                </span>
                                                <span className="badge-pill cyan">{enq.itemType?.toUpperCase() || 'MODULE'}</span>
                                                <span className="enquiry-date-pill">
                                                    <Calendar size={11} />
                                                    {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                                </span>
                                            </div>

                                            <h3 className="mod-item-title enquiry-course-name">{enq.selectedItem}</h3>
                                            
                                            <div className="enquiry-lead-info">
                                                <span className="lead-name"><strong>{enq.name}</strong></span>
                                                <a href={`mailto:${enq.email}`} className="lead-contact-link">
                                                    <Mail size={13} /> {enq.email}
                                                </a>
                                                {enq.phone && (
                                                    <a href={`tel:${enq.phone}`} className="lead-contact-link">
                                                        <Phone size={13} /> {enq.phone}
                                                    </a>
                                                )}
                                            </div>

                                            {enq.message && (
                                                <div className="enquiry-message-box">
                                                    <MessageSquare size={14} className="msg-quote-icon" />
                                                    <p>{enq.message}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="enquiry-actions-col">
                                            <div className="status-select-wrap">
                                                <label>Lead Status</label>
                                                <select
                                                    value={enq.status || 'new'}
                                                    onChange={(e) => handleUpdateEnquiryStatus(enqId, e.target.value)}
                                                    className={`enquiry-status-select ${enq.status || 'new'}`}
                                                >
                                                    <option value="new">🟡 New Lead</option>
                                                    <option value="contacted">🔵 Contacted</option>
                                                    <option value="enrolled">🟢 Enrolled</option>
                                                    <option value="closed">⚪ Closed</option>
                                                </select>
                                            </div>

                                            <div className="enquiry-direct-buttons">
                                                <a href={`mailto:${enq.email}?subject=ChaudharyConnect%20Course%20Details`} className="action-icon-btn email-btn" title="Email Student">
                                                    <Mail size={15} />
                                                    <span className="btn-text-mobile">Email</span>
                                                </a>
                                                <button
                                                    className="action-icon-btn delete"
                                                    onClick={() => handleDeleteEnquiry(enqId)}
                                                    title="Delete Enquiry"
                                                >
                                                    <Trash2 size={15} />
                                                    <span className="btn-text-mobile">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: USERS MANAGEMENT */}
            {activeTab === 'users' && (
                <div className="admin-tab-content animate-fade-in">
                    <div className="mod-section-header user-header-flex">
                        <div className="section-title-wrap">
                            <Users size={18} className="section-icon-cyan" />
                            <h2>User Directory ({users.length})</h2>
                        </div>
                        <button className="btn-primary add-user-trigger" onClick={() => handleOpenModal()}>
                            <Plus size={16} />
                            <span>Add New User</span>
                        </button>
                    </div>

                    <div className="mod-cards-list">
                        {loadingUsers ? (
                            <div className="empty-panel glass-card">
                                <Sparkles className="animate-spin" size={28} color="var(--primary)" />
                                <p>Loading user accounts...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="empty-panel glass-card">
                                <p>No registered users found.</p>
                            </div>
                        ) : (
                            users.map(u => (
                                <div key={u._id} className="mod-item-card glass-card user-item-card">
                                    <div className="mod-info-col">
                                        <div className="user-primary-row">
                                            <div className="user-avatar-mini">
                                                {(u.firstName?.[0] || u.username?.[0] || 'U').toUpperCase()}
                                            </div>
                                            <div className="user-title-wrap">
                                                <h3 className="user-card-name">{u.firstName} {u.lastName}</h3>
                                                <div className="user-chips-row">
                                                    <span className={`role-chip ${u.role === 'admin' ? 'admin' : 'user'}`}>
                                                        {u.role === 'admin' ? <Shield size={11} /> : <UserCheck size={11} />}
                                                        {u.role}
                                                    </span>
                                                    {u.isVerified && (
                                                        <span className="badge-pill emerald">
                                                            <CheckCircle2 size={11} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="user-meta-details">
                                            <span className="user-detail-item">
                                                <Mail size={13} /> {u.email || u.username}
                                            </span>
                                            {u.phone && (
                                                <span className="user-detail-item">
                                                    <Phone size={13} /> {u.phone}
                                                </span>
                                            )}
                                            {u.createdAt && (
                                                <span className="user-detail-item">
                                                    <Calendar size={13} /> Joined {new Date(u.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mod-actions-col">
                                        <button
                                            className="action-icon-btn edit user-edit-btn"
                                            onClick={() => handleOpenModal(u)}
                                            title="Edit User"
                                        >
                                            <Edit size={16} />
                                            <span>Edit</span>
                                        </button>
                                        {u.role !== 'admin' && (
                                            <button
                                                className="action-icon-btn delete user-delete-btn"
                                                onClick={() => handleDeleteUser(u._id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit User Modal Dialog */}
            {showUserModal && typeof document !== 'undefined' && createPortal(
                <div className="modal-backdrop-blur animate-fade-in" onClick={handleCloseModal}>
                    <div className="modal-glass-card glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h2>{editingUser ? 'Edit User Credentials' : 'Create Team Member'}</h2>
                            <button className="modal-close-icon" onClick={handleCloseModal} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUserSubmit} className="modal-user-form">
                            <div className="modal-form-grid">
                                <div className="modal-field">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={userFormData.firstName}
                                        onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                                        required
                                        placeholder="First name"
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={userFormData.lastName}
                                        onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                                        required
                                        placeholder="Last name"
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                        required
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Username (Optional)</label>
                                    <input
                                        type="text"
                                        value={userFormData.username}
                                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                        placeholder="username"
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={userFormData.phone}
                                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Account Role</label>
                                    <select
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                    >
                                        <option value="user">User (Contributor)</option>
                                        <option value="admin">Admin (Full Control)</option>
                                    </select>
                                </div>
                                <div className="modal-field full-width">
                                    <label>{editingUser ? 'New Password (leave blank to keep unchanged)' : 'Account Password'}</label>
                                    <input
                                        type="password"
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                        required={!editingUser}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions-foot">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Save size={16} />
                                    <span>{editingUser ? 'Update User' : 'Create User'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Admin;
