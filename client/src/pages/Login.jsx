import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Lock, User, AlertCircle, Mail, Phone, UserPlus, 
    ArrowRight, ShieldCheck, CheckCircle2, RotateCw, ArrowLeft, KeyRound
} from 'lucide-react';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect') || location.state?.from || '';
    const initialMode = searchParams.get('mode');

    const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });

    // OTP States
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpEmail, setOtpEmail] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [infoMessage, setInfoMessage] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, verifyOtp, resendOtp } = useAuth();

    // Countdown timer for Resend OTP
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await login(formData.username, formData.password);
                if (res.success) {
                    const target = res.role === 'admin' 
                        ? '/admin' 
                        : (redirectUrl ? (redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`) : '/');
                    navigate(target);
                } else if (res.requireOtp) {
                    // Account exists but unverified
                    setOtpEmail(res.email || formData.username);
                    setIsOtpSent(true);
                    setResendTimer(30);
                    setInfoMessage(res.message || 'Please enter the 6-digit OTP sent to your email.');
                } else {
                    setError(res.message || 'Invalid username or password');
                }
            } else {
                if (!validateEmail(formData.username)) {
                    setLoading(false);
                    return setError('Please enter a valid email address');
                }
                if (formData.password.length < 6) {
                    setLoading(false);
                    return setError('Password must be at least 6 characters long');
                }

                const res = await signup({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.username,
                    password: formData.password,
                    phone: formData.phone
                });

                if (res.success) {
                    setOtpEmail(res.email || formData.username);
                    setIsOtpSent(true);
                    setResendTimer(30);
                    setInfoMessage(res.message || 'A 6-digit OTP has been sent to your email.');
                } else {
                    setError(res.message || 'Registration failed');
                }
            }
        } catch (err) {
            setError('Connection error. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP Handler
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');

        if (!otp || otp.length !== 6) {
            return setError('Please enter the full 6-digit OTP code');
        }

        setLoading(true);
        try {
            const res = await verifyOtp(otpEmail, otp);
            if (res.success) {
                const target = res.role === 'admin' 
                    ? '/admin' 
                    : (redirectUrl ? (redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`) : '/');
                navigate(target);
            } else {
                setError(res.message || 'Invalid or expired OTP');
            }
        } catch (err) {
            setError('Error verifying OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP Handler
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError('');
        setInfoMessage('');
        setLoading(true);

        try {
            const res = await resendOtp(otpEmail);
            if (res.success) {
                setResendTimer(45);
                setInfoMessage(res.message || 'A new 6-digit OTP has been sent to your email.');
            } else {
                setError(res.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Error resending OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrap animate-fade-in">
            {/* Background Glow Orb */}
            <div className="auth-ambient-glow"></div>

            <div className="login-card-container glass-card">
                <div className="auth-brand-head">
                    <Logo />
                </div>

                {/* If OTP screen is NOT active, show regular Login/Signup */}
                {!isOtpSent ? (
                    <>
                        {/* Mode Segmented Toggle */}
                        <div className="auth-segmented-nav glass">
                            <button
                                type="button"
                                className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                                onClick={() => { setIsLogin(true); setError(''); setInfoMessage(''); }}
                            >
                                <Lock size={15} /> Sign In
                            </button>
                            <button
                                type="button"
                                className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                                onClick={() => { setIsLogin(false); setError(''); setInfoMessage(''); }}
                            >
                                <UserPlus size={15} /> Create Account
                            </button>
                        </div>

                        <div className="auth-intro">
                            <h2>{isLogin ? 'Welcome back' : 'Join Knowledge Hub'}</h2>
                            <p>{isLogin ? 'Sign in to submit and manage engineering articles.' : 'Create an account to join our technical contributor network.'}</p>
                        </div>

                        {error && (
                            <div className="auth-error-banner animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-actual-form" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="auth-form-row">
                                    <div className="auth-input-group">
                                        <label>First Name</label>
                                        <div className="auth-field-box">
                                            <User className="field-icon" size={17} />
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="First name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="auth-input-group">
                                        <label>Last Name</label>
                                        <div className="auth-field-box">
                                            <User className="field-icon" size={17} />
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label>{isLogin ? 'Username / Email' : 'Email Address'}</label>
                                <div className="auth-field-box">
                                    <Mail className="field-icon" size={17} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder={isLogin ? 'admin or name@example.com' : 'name@example.com'}
                                        required
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="auth-input-group">
                                    <label>Phone (Optional)</label>
                                    <div className="auth-field-box">
                                        <Phone className="field-icon" size={17} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label>Password</label>
                                <div className="auth-field-box">
                                    <Lock className="field-icon" size={17} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                                {loading ? 'Processing...' : (
                                    <>
                                        <span>{isLogin ? 'Sign In to Account' : 'Send Verification OTP'}</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-card-footer">
                            <p>
                                {isLogin ? "Don't have an account yet?" : "Already registered?"}
                                <button
                                    type="button"
                                    className="switch-link-btn"
                                    onClick={() => { setIsLogin(!isLogin); setError(''); setInfoMessage(''); }}
                                >
                                    {isLogin ? 'Create one now' : 'Sign in here'}
                                </button>
                            </p>
                        </div>
                    </>
                ) : (
                    /* OTP Verification Screen */
                    <div className="auth-otp-screen animate-fade-in">
                        <div className="otp-icon-badge">
                            <ShieldCheck size={28} />
                        </div>

                        <div className="auth-intro">
                            <h2>Verify Your Email</h2>
                            <p>
                                We've sent a 6-digit OTP code to <br />
                                <strong className="otp-target-email">{otpEmail}</strong>
                            </p>
                        </div>

                        {infoMessage && (
                            <div className="auth-info-banner animate-fade-in">
                                <CheckCircle2 size={18} />
                                <span>{infoMessage}</span>
                            </div>
                        )}

                        {error && (
                            <div className="auth-error-banner animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-actual-form" onSubmit={handleVerifyOtp}>
                            <div className="auth-input-group">
                                <label className="otp-input-label">Enter 6-Digit OTP</label>
                                <div className="auth-field-box otp-box">
                                    <KeyRound className="field-icon" size={18} />
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="123456"
                                        className="otp-digit-input"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading || otp.length !== 6}>
                                {loading ? 'Verifying...' : (
                                    <>
                                        <span>Verify & Activate Account</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Resend & Back Controls */}
                        <div className="otp-bottom-controls">
                            <p className="otp-resend-prompt">
                                Didn't receive the OTP code?{' '}
                                <button
                                    type="button"
                                    className="otp-resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || loading}
                                >
                                    {resendTimer > 0 ? (
                                        `Resend in ${resendTimer}s`
                                    ) : (
                                        <>
                                            <RotateCw size={13} />
                                            <span>Resend OTP</span>
                                        </>
                                    )}
                                </button>
                            </p>

                            <button
                                type="button"
                                className="otp-back-btn"
                                onClick={() => { setIsOtpSent(false); setError(''); setOtp(''); }}
                            >
                                <ArrowLeft size={14} />
                                <span>Change Email / Back</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
