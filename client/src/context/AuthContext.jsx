import API_BASE_URL from '../config';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Check if running as Installed App (Native Android WebView or PWA Standalone)
export const isNativeAppEnvironment = () => {
    if (typeof window === 'undefined') return false;
    const isStandalonePWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    const isNativeAndroidApp =
        Boolean(window.AndroidAuthBridge) ||
        Boolean(window.AndroidBridge) ||
        navigator.userAgent.includes('CSCorpNativeApp') ||
        navigator.userAgent.includes('wv');
    return isStandalonePWA || isNativeAndroidApp;
};

// Helper to read Android Native SharedPreferences bridge
const getNativeAppStoredAuth = () => {
    try {
        if (typeof window !== 'undefined' && window.AndroidAuthBridge) {
            const token = window.AndroidAuthBridge.getSavedToken();
            const userStr = window.AndroidAuthBridge.getSavedUser();
            if (token === 'true' && userStr) {
                return { isAuthenticated: true, user: JSON.parse(userStr) };
            }
        }
    } catch (e) {}
    return null;
};

export const AuthProvider = ({ children }) => {
    const isApp = isNativeAppEnvironment();
    const nativeAuth = getNativeAppStoredAuth();

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            if (nativeAuth && nativeAuth.isAuthenticated) {
                return true;
            }
            if (isApp) {
                // In App: Remember login permanently via localStorage
                return (
                    localStorage.getItem('auth_token') === 'true' ||
                    sessionStorage.getItem('auth_token') === 'true'
                );
            }
            // In Normal Browser: Strict session-only (cleared when browser / tab is closed)
            return sessionStorage.getItem('auth_token') === 'true';
        } catch (e) {
            return false;
        }
    });

    const [user, setUser] = useState(() => {
        try {
            if (nativeAuth && nativeAuth.user) {
                return nativeAuth.user;
            }
            if (isApp) {
                const savedAppUser =
                    localStorage.getItem('auth_user') ||
                    sessionStorage.getItem('auth_user');
                if (savedAppUser) {
                    localStorage.setItem('auth_token', 'true');
                    localStorage.setItem('auth_user', savedAppUser);
                    return JSON.parse(savedAppUser);
                }
                return null;
            }
            // Browser: Session storage only
            const savedBrowserUser = sessionStorage.getItem('auth_user');
            return savedBrowserUser ? JSON.parse(savedBrowserUser) : null;
        } catch (e) {
            return null;
        }
    });

    const persistAuthSession = (userObj) => {
        setIsAuthenticated(true);
        setUser(userObj);
        try {
            const serialized = JSON.stringify(userObj);
            // Session storage
            sessionStorage.setItem('auth_token', 'true');
            sessionStorage.setItem('auth_user', serialized);

            if (isApp) {
                // 1. Android Native SharedPreferences (Guaranteed persistent across app kills)
                if (window.AndroidAuthBridge && window.AndroidAuthBridge.saveUserSession) {
                    window.AndroidAuthBridge.saveUserSession('true', serialized);
                }
                // 2. LocalStorage permanent storage
                localStorage.setItem('auth_token', 'true');
                localStorage.setItem('auth_user', serialized);
            } else {
                // If normal desktop / mobile browser: Do NOT keep permanent token
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        } catch (e) {}
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                persistAuthSession(data.user);
                return { success: true, role: data.user.role };
            }
            if (data.requireOtp) {
                return { success: false, requireOtp: true, email: data.email, message: data.message };
            }
            return { success: false, message: data.message || 'Invalid credentials' };
        } catch (error) {
            return { success: false, message: 'Server connection error' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    requireOtp: data.requireOtp,
                    email: data.email,
                    message: data.message
                };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'Server error during signup' };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            if (data.success) {
                persistAuthSession(data.user);
                return { success: true, role: data.user.role, message: data.message };
            }
            return { success: false, message: data.message || 'Invalid or expired OTP' };
        } catch (error) {
            return { success: false, message: 'Server error during OTP verification' };
        }
    };

    const resendOtp = async (email) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, message: 'Failed to resend OTP' };
        }
    };

    // Safe fetch + JSON parser with automatic retry for Render cold-start / deployment restarts
    const postAuthApi = async (endpoint, payload, fallbackErrorMsg) => {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    return await response.json();
                }

                // Non-JSON response (e.g., Render 502/503 waking up or Express HTML 404 while Render is deploying)
                const rawText = await response.text();
                if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt === 1) {
                    await new Promise(r => setTimeout(r, 2500));
                    continue;
                }
                if (response.status === 404 && rawText.includes('Cannot POST')) {
                    return {
                        success: false,
                        message: 'Production backend (Render) is still deploying the latest update. Please wait ~1 minute and try again.'
                    };
                }
                return {
                    success: false,
                    message: `${fallbackErrorMsg} (HTTP ${response.status})`
                };
            } catch (error) {
                if (attempt === 1) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                return { success: false, message: fallbackErrorMsg };
            }
        }
        return { success: false, message: fallbackErrorMsg };
    };

    const forgotPassword = async (email) => {
        return await postAuthApi('/api/forgot-password', { email }, 'Server connection error while sending OTP');
    };

    const verifyResetOtp = async (email, otp) => {
        return await postAuthApi('/api/verify-reset-otp', { email, otp }, 'Server connection error while verifying OTP');
    };

    const resetPassword = async (email, otp, newPassword) => {
        return await postAuthApi('/api/reset-password', { email, otp, newPassword }, 'Server connection error while resetting password');
    };

    const updatePreferences = async (enabledModules) => {
        if (!user || !user.email) return { success: false, message: 'User not authenticated' };
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, enabledModules })
            });
            const data = await response.json();
            if (data.success && data.user) {
                persistAuthSession({ ...user, ...data.user });
                return { success: true, message: data.message, user: data.user };
            }
            return { success: false, message: data.message || 'Failed to update preferences' };
        } catch (error) {
            return { success: false, message: 'Server error while updating preferences' };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        try {
            if (window.AndroidAuthBridge && window.AndroidAuthBridge.clearUserSession) {
                window.AndroidAuthBridge.clearUserSession();
            }
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        } catch (e) {}
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            signup,
            verifyOtp,
            resendOtp,
            forgotPassword,
            verifyResetOtp,
            resetPassword,
            updatePreferences,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
