import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    X, BookOpen, PenTool, LayoutDashboard, Home, GraduationCap, 
    FileText, ArrowUpRight, Truck, Layers, LogIn, LogOut, User, ShieldCheck
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Close dropdown on outside click (Desktop)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <header className={`zain-exact-header ${scrolled ? 'header-scrolled' : ''}`} ref={menuRef}>
            <div className="zain-header-content">
                {/* Left: Brand Logo */}
                <NavLink to="/" className="zain-logo-link">
                    <Logo />
                </NavLink>

                {/* Right: User / Guest Status Pill + Hamburger Menu Button (Rightmost) */}
                <div className="zain-right-group">
                    {/* User Profile Avatar Circle (if logged in) or Guest Pill (if logged off) */}
                    {isAuthenticated ? (
                        <NavLink 
                            to="/profile" 
                            className="nav-user-avatar-circle" 
                            title={`My Profile (${user?.firstName || user?.name || user?.username || 'User'})`}
                            aria-label="My Profile"
                        >
                            {(user?.firstName?.[0] || user?.name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                        </NavLink>
                    ) : (
                        <NavLink to="/login" className="nav-user-pill is-guest" title="Sign In / Register">
                            <span className="user-dot-guest"></span>
                            <span className="user-pill-name">Guest</span>
                        </NavLink>
                    )}

                    {/* Two-Bar Hamburger Menu Button (Rightmost) */}
                    <button
                        className={`zain-hamburger-two-bars ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Navigation Menu"
                    >
                        {isOpen ? (
                            <X size={22} className="close-x-icon" />
                        ) : (
                            <div className="two-lines-icon">
                                <span className="line line-top"></span>
                                <span className="line line-bottom"></span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Menu (Dropdown on Desktop, Full Overlay on Mobile) */}
            {isOpen && (
                <div className="zain-nav-dropdown-menu animate-dropdown-pop">
                    {/* Mobile Only: Top Bar with Logo & Close Button */}
                    <div className="dropdown-mobile-topbar mobile-only">
                        <NavLink to="/" onClick={() => setIsOpen(false)}>
                            <Logo />
                        </NavLink>
                        <button
                            className="mobile-close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close Navigation"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="dropdown-menu-content">
                        <ul className="dropdown-links-list">
                            <li>
                                <NavLink to="/" end onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><Layers size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">Chaudhary & Sons</span>
                                        <span className="dropdown-item-desc">Enterprise & Holdings Hub</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/ankit-chaudhary" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><Home size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">Ankit Chaudhary</span>
                                        <span className="dropdown-item-desc">Maximo EAM & Architecture</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/anant-chaudhary" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><Truck size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">Anant Chaudhary</span>
                                        <span className="dropdown-item-desc">Supply Chain & Logistics Leader</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><GraduationCap size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <div className="dropdown-title-row">
                                            <span className="dropdown-item-title">ChaudharyConnect</span>
                                            <span className="live-pill-tag">Live</span>
                                        </div>
                                        <span className="dropdown-item-desc">Live IBM Maximo Bootcamp</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/docs" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><BookOpen size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">ChaudharyDocs</span>
                                        <span className="dropdown-item-desc">Architecture & Script Guides</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/articles" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><FileText size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">ChaudharyArticles</span>
                                        <span className="dropdown-item-desc">Technical Publications</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/post" onClick={() => setIsOpen(false)} className="dropdown-item-link">
                                    <div className="dropdown-item-icon"><PenTool size={18} /></div>
                                    <div className="dropdown-item-info">
                                        <span className="dropdown-item-title">Write Article</span>
                                        <span className="dropdown-item-desc">Submit to Knowledge Base</span>
                                    </div>
                                </NavLink>
                            </li>
                        </ul>

                        {/* Authentication & User Session Management */}
                        <div className="dropdown-auth-card">
                            {isAuthenticated ? (
                                <div className="auth-profile-wrap">
                                    <NavLink to="/profile" onClick={() => setIsOpen(false)} className="auth-user-header auth-user-header-link" title="Open My Profile">
                                        <div className="auth-user-avatar">
                                            <User size={18} />
                                        </div>
                                        <div className="auth-user-meta">
                                            <div className="auth-user-name-line">
                                                <span className="auth-user-name">
                                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.username || 'Member')}
                                                </span>
                                                <span className={`auth-badge-tag ${user?.role === 'admin' ? 'admin' : 'member'}`}>
                                                    {user?.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                                                </span>
                                            </div>
                                            <span className="auth-user-email">{user?.email || user?.username || ''}</span>
                                        </div>
                                    </NavLink>

                                    <div className="auth-actions-row">
                                        <NavLink to="/profile" onClick={() => setIsOpen(false)} className="auth-profile-nav-btn">
                                            <User size={14} />
                                            <span>My Profile & Purchases</span>
                                        </NavLink>
                                        {user?.role === 'admin' && (
                                            <NavLink to="/admin" onClick={() => setIsOpen(false)} className="auth-admin-btn">
                                                <LayoutDashboard size={14} />
                                                <span>Admin Panel</span>
                                            </NavLink>
                                        )}
                                        <button onClick={handleLogout} className="auth-logout-btn">
                                            <LogOut size={14} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="auth-guest-wrap">
                                    <NavLink to="/login" onClick={() => setIsOpen(false)} className="auth-signin-link">
                                        <div className="auth-signin-icon">
                                            <LogIn size={18} />
                                        </div>
                                        <div className="auth-signin-text">
                                            <span className="auth-signin-title">Sign In / Register</span>
                                            <span className="auth-signin-sub">Write articles & manage account</span>
                                        </div>
                                        <ArrowUpRight size={16} className="auth-signin-arrow" />
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
