import API_BASE_URL from '../config';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Clean up any legacy permanent localStorage tokens from previous version
    try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    } catch (e) {}

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return sessionStorage.getItem('auth_token') === 'true';
        } catch (e) {
            return false;
        }
    });
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem('auth_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                setIsAuthenticated(true);
                setUser(data.user);
                sessionStorage.setItem('auth_token', 'true');
                sessionStorage.setItem('auth_user', JSON.stringify(data.user));
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
                setIsAuthenticated(true);
                setUser(data.user);
                sessionStorage.setItem('auth_token', 'true');
                sessionStorage.setItem('auth_user', JSON.stringify(data.user));
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

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        try {
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        } catch (e) {}
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, signup, verifyOtp, resendOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
