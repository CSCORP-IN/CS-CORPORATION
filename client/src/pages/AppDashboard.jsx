import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { 
    Wallet, FolderLock, FileText, BookOpen, GraduationCap, 
    Layers, Plus, ArrowRight, ShieldCheck, TrendingUp, Sparkles,
    Calendar, CheckCircle2, AlertCircle, RefreshCw, Sliders, ChevronRight
} from 'lucide-react';
import WorkspacePreferencesModal, { AVAILABLE_MODULES } from '../components/WorkspacePreferencesModal';
import './AppDashboard.css';

const AppDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [khataSummary, setKhataSummary] = useState(null);
    const [lockerSummary, setLockerSummary] = useState(null);
    const [profileStats, setProfileStats] = useState(null);
    const [showPrefModal, setShowPrefModal] = useState(false);

    const userKey = user?.email || user?.username || 'user';
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Modules enabled for this user
    const userModules = Array.isArray(user?.enabledModules) ? user.enabledModules : [];
    const showAll = userModules.length === 0;
    const isModuleActive = (id) => showAll || userModules.includes(id);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch KhataKit summary if module active
            if (isModuleActive('khatakit')) {
                const khataRes = await fetch(`${API_BASE_URL}/khatakit?month=${currentMonth}`, {
                    headers: { 'X-User-Id': userKey }
                });
                if (khataRes.ok) {
                    const kData = await khataRes.json();
                    setKhataSummary(kData.summary || null);
                }
            }

            // 2. Fetch CS Locker summary if module active
            if (isModuleActive('cslocker')) {
                const lockRes = await fetch(`${API_BASE_URL}/cslocker/stats`, {
                    headers: { 'X-User-Id': userKey }
                });
                if (lockRes.ok) {
                    const lData = await lockRes.json();
                    setLockerSummary(lData.stats || null);
                }
            }

            // 3. Fetch User Profile Stats
            if (user?.email) {
                const profRes = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (profRes.ok) {
                    const pData = await profRes.json();
                    setProfileStats(pData.stats || null);
                }
            }
        } catch (e) {
            console.error('App Dashboard load error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [userKey, user?.enabledModules]);

    const formatCurrency = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

    const greetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="app-dash-container animate-fade-in">
            {/* Top Personalized Greeting Strip */}
            <div className="app-dash-user-head">
                <div className="app-dash-greeting">
                    <span className="app-dash-salute">{greetingTime()},</span>
                    <h1 className="app-dash-name">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.username || 'Member')}
                    </h1>
                    <span className="app-dash-email">{user?.email}</span>
                </div>
                <button
                    type="button"
                    className="app-dash-pref-pill"
                    onClick={() => setShowPrefModal(true)}
                    title="Customize Visible Cards & Navigation"
                >
                    <Sliders size={14} />
                    <span>Customize</span>
                </button>
            </div>

            {/* Quick Action Hub Carousel / Pill Bar */}
            <div className="app-dash-quick-actions">
                {isModuleActive('khatakit') && (
                    <Link to="/khatakit" className="quick-action-chip orange">
                        <Wallet size={15} />
                        <span>KhataKit</span>
                    </Link>
                )}
                {isModuleActive('cslocker') && (
                    <Link to="/cslocker" className="quick-action-chip amber">
                        <FolderLock size={15} />
                        <span>CS Locker</span>
                    </Link>
                )}
                {isModuleActive('articles') && (
                    <Link to="/post" className="quick-action-chip blue">
                        <FileText size={15} />
                        <span>Write Article</span>
                    </Link>
                )}
                {isModuleActive('csdocs') && (
                    <Link to="/docs" className="quick-action-chip emerald">
                        <BookOpen size={15} />
                        <span>CS Docs</span>
                    </Link>
                )}
                {isModuleActive('csconnect') && (
                    <Link to="/courses" className="quick-action-chip purple">
                        <GraduationCap size={15} />
                        <span>Courses</span>
                    </Link>
                )}
            </div>

            {/* SUMMARY CARDS STACK (Vertical Mobile-First Layout) */}
            <div className="app-dash-cards-stack">
                {/* 1. KHATAKIT EXPENSE, EMI & SIP SUMMARY */}
                {isModuleActive('khatakit') && (
                    <div className="app-dash-card card-khatakit">
                        <div className="app-dash-card-header">
                            <div className="app-dash-card-title-group">
                                <div className="app-dash-icon-circle orange">
                                    <Wallet size={18} />
                                </div>
                                <div>
                                    <h3>Chaudhary KhataKit</h3>
                                    <span className="card-sub-tag">Personal Finance • {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <Link to="/khatakit" className="card-action-arrow">
                                <span>Open</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="app-dash-card-loading">Loading KhataKit metrics...</div>
                        ) : khataSummary ? (
                            <div className="app-dash-metrics-grid">
                                <div className="dash-metric-item">
                                    <span className="metric-label">Month Outflow</span>
                                    <strong className="metric-val text-orange">
                                        {formatCurrency(khataSummary.total_monthly_outflow)}
                                    </strong>
                                    <small className="metric-sub">EMIs + Fixed + Spends</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Unpaid Dues</span>
                                    <strong className="metric-val text-rose">
                                        {formatCurrency(khataSummary.total_unpaid)}
                                    </strong>
                                    <small className="metric-sub">{khataSummary.paid_items_count}/{khataSummary.total_items_count} Bills Paid</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Monthly EMIs</span>
                                    <strong className="metric-val">
                                        {formatCurrency(khataSummary.total_emi_outflow)}
                                    </strong>
                                    <small className="metric-sub">{khataSummary.active_emis_count} Active EMIs</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Monthly SIP</span>
                                    <strong className="metric-val text-emerald">
                                        {formatCurrency(khataSummary.total_monthly_sip)}
                                    </strong>
                                    <small className="metric-sub">{khataSummary.active_investments_count || 0} Assets Deployed</small>
                                </div>
                            </div>
                        ) : (
                            <div className="dash-card-empty">
                                <p>No expense data added for this month.</p>
                                <Link to="/khatakit" className="dash-empty-btn">+ Add Card, EMI or Spend</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. CS LOCKER DOCUMENT VAULT SUMMARY */}
                {isModuleActive('cslocker') && (
                    <div className="app-dash-card card-cslocker">
                        <div className="app-dash-card-header">
                            <div className="app-dash-card-title-group">
                                <div className="app-dash-icon-circle amber">
                                    <FolderLock size={18} />
                                </div>
                                <div>
                                    <h3>Chaudhary CS Locker</h3>
                                    <span className="card-sub-tag">Secure Document Vault</span>
                                </div>
                            </div>
                            <Link to="/cslocker" className="card-action-arrow">
                                <span>Vault</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="app-dash-card-loading">Loading Locker vault status...</div>
                        ) : lockerSummary ? (
                            <div className="app-dash-metrics-grid">
                                <div className="dash-metric-item">
                                    <span className="metric-label">Stored Documents</span>
                                    <strong className="metric-val text-amber">{lockerSummary.total_documents || 0}</strong>
                                    <small className="metric-sub">Encrypted in Vault</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Vault Storage</span>
                                    <strong className="metric-val">{lockerSummary.total_storage_formatted || '0 B'}</strong>
                                    <small className="metric-sub">Permanent GridFS</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Starred / Priority</span>
                                    <strong className="metric-val text-orange">{lockerSummary.starred_documents || 0}</strong>
                                    <small className="metric-sub">Quick Access Docs</small>
                                </div>
                                <div className="dash-metric-item">
                                    <span className="metric-label">Categories</span>
                                    <strong className="metric-val">{lockerSummary.categories_count || 0}</strong>
                                    <small className="metric-sub">KYC, Tax, Property</small>
                                </div>
                            </div>
                        ) : (
                            <div className="dash-card-empty">
                                <p>Vault is empty. Upload your first document.</p>
                                <Link to="/cslocker" className="dash-empty-btn">+ Upload Documents</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. CHAUDHARY ARTICLES SUMMARY */}
                {isModuleActive('articles') && (
                    <div className="app-dash-card card-articles">
                        <div className="app-dash-card-header">
                            <div className="app-dash-card-title-group">
                                <div className="app-dash-icon-circle blue">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3>Chaudhary Articles</h3>
                                    <span className="card-sub-tag">Knowledge Contributions</span>
                                </div>
                            </div>
                            <Link to="/articles" className="card-action-arrow">
                                <span>Browse</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="app-dash-metrics-grid">
                            <div className="dash-metric-item">
                                <span className="metric-label">My Articles</span>
                                <strong className="metric-val text-blue">{profileStats?.totalArticles || 0}</strong>
                                <small className="metric-sub">{profileStats?.publishedArticles || 0} Published</small>
                            </div>
                            <div className="dash-metric-item">
                                <span className="metric-label">Pending Review</span>
                                <strong className="metric-val text-amber">{profileStats?.pendingArticles || 0}</strong>
                                <small className="metric-sub">In editorial review</small>
                            </div>
                        </div>

                        <div className="card-mini-action-row">
                            <Link to="/post" className="card-inline-link">
                                <Plus size={14} /> Write New Article
                            </Link>
                        </div>
                    </div>
                )}

                {/* 4. CS CONNECT & DOCS LEARNING CARDS */}
                {(isModuleActive('csconnect') || isModuleActive('csdocs')) && (
                    <div className="app-dash-card card-learning">
                        <div className="app-dash-card-header">
                            <div className="app-dash-card-title-group">
                                <div className="app-dash-icon-circle purple">
                                    <GraduationCap size={18} />
                                </div>
                                <div>
                                    <h3>Learning &amp; Architecture Hub</h3>
                                    <span className="card-sub-tag">Documentation &amp; Training</span>
                                </div>
                            </div>
                        </div>

                        <div className="learning-links-list">
                            {isModuleActive('csconnect') && (
                                <Link to="/courses" className="learning-chip-item">
                                    <div className="chip-left">
                                        <GraduationCap size={16} />
                                        <span>IBM Maximo Live Bootcamp Modules</span>
                                    </div>
                                    <ChevronRight size={15} />
                                </Link>
                            )}
                            {isModuleActive('csdocs') && (
                                <Link to="/docs" className="learning-chip-item">
                                    <div className="chip-left">
                                        <BookOpen size={16} />
                                        <span>ChaudharyDocs Script &amp; Config References</span>
                                    </div>
                                    <ChevronRight size={15} />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Floating Preferences Modal */}
            <WorkspacePreferencesModal
                isOpen={showPrefModal}
                onClose={() => setShowPrefModal(false)}
            />
        </div>
    );
};

export default AppDashboard;
