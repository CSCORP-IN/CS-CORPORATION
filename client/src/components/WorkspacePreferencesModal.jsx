import React, { useState } from 'react';
import { 
    Wallet, FolderLock, FileText, BookOpen, GraduationCap, 
    Layers, Check, Sparkles, ArrowRight, Eye, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './WorkspacePreferencesModal.css';

export const AVAILABLE_MODULES = [
    {
        id: 'khatakit',
        title: 'Chaudhary KhataKit',
        tag: 'Personal Finance',
        desc: 'Card-wise EMIs, Monthly Fixed Expenses, UPI/Cash Spends & SIP Portfolio Manager.',
        icon: Wallet,
        color: '#f97316',
        route: '/khatakit'
    },
    {
        id: 'cslocker',
        title: 'Chaudhary CS Locker',
        tag: 'Document Vault',
        desc: 'Encrypted document management system backed by MongoDB GridFS & in-app preview.',
        icon: FolderLock,
        color: '#ea580c',
        route: '/cslocker'
    },
    {
        id: 'articles',
        title: 'Chaudhary Articles',
        tag: 'Technical Publications',
        desc: 'Read, write, and manage technical engineering articles & contributor insights.',
        icon: FileText,
        color: '#0284c7',
        route: '/articles'
    },
    {
        id: 'csdocs',
        title: 'CS Docs (ChaudharyDocs)',
        tag: 'Architecture & Scripts',
        desc: 'Enterprise architecture documentation, automation scripts & developer references.',
        icon: BookOpen,
        color: '#10b981',
        route: '/docs'
    },
    {
        id: 'csconnect',
        title: 'CS Connect (Courses)',
        tag: 'Live Bootcamps',
        desc: 'Interactive training programs, IBM Maximo bootcamps & certification modules.',
        icon: GraduationCap,
        color: '#8b5cf6',
        route: '/courses'
    },
    {
        id: 'hub',
        title: 'Foundational Hub (CS Corp)',
        tag: 'Enterprise Holding',
        desc: 'Chaudhary & Sons parent enterprise overview, family portfolios & strategic advisory.',
        icon: Layers,
        color: '#f59e0b',
        route: '/'
    }
];

const WorkspacePreferencesModal = ({ isOpen, onClose, isFirstTime = false }) => {
    const { user, updatePreferences } = useAuth();
    
    // Initial state: If user has saved modules, use them; if empty, user sees everything
    const [selected, setSelected] = useState(() => {
        const existing = user?.enabledModules;
        return Array.isArray(existing) && existing.length > 0 ? existing : [];
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const toggleModule = (id) => {
        setSelected(prev => {
            if (prev.includes(id)) {
                return prev.filter(m => m !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        setSelected([]); // Empty array represents "Show Everything"
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await updatePreferences(selected);
            if (res.success) {
                setMessage('Preferences saved!');
                setTimeout(() => {
                    if (onClose) onClose();
                }, 600);
            } else {
                setMessage(res.message || 'Failed to save');
            }
        } catch (err) {
            setMessage('Error saving preferences');
        } finally {
            setSaving(false);
        }
    };

    const isAllSelected = selected.length === 0;

    return (
        <div className="wsp-backdrop animate-fade-in" onClick={onClose}>
            <div className="wsp-card glass-card" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="wsp-header">
                    <div className="wsp-icon-badge">
                        <Sparkles size={24} />
                    </div>
                    <h2>{isFirstTime ? 'Customize Your Workspace' : 'Workspace & Menu Preferences'}</h2>
                    <p>
                        Choose what you want to see in your account menu and navigation.
                        {isFirstTime && ' You can change this anytime from your Profile.'}
                    </p>
                </div>

                {/* Preset Fast Switch */}
                <div className="wsp-presets-row">
                    <button
                        type="button"
                        className={`wsp-preset-btn ${isAllSelected ? 'active' : ''}`}
                        onClick={handleSelectAll}
                    >
                        <Eye size={14} />
                        <span>Show Everything (Full Portal)</span>
                    </button>
                    <span className="wsp-presets-hint">
                        {isAllSelected 
                            ? '✓ All 6 sections will be visible' 
                            : `✓ Custom (${selected.length} selected)`}
                    </span>
                </div>

                {/* Modules Grid */}
                <div className="wsp-modules-grid">
                    {AVAILABLE_MODULES.map(mod => {
                        const Icon = mod.icon;
                        const isChecked = isAllSelected || selected.includes(mod.id);
                        return (
                            <div
                                key={mod.id}
                                className={`wsp-module-card ${isChecked ? 'is-selected' : ''}`}
                                onClick={() => toggleModule(mod.id)}
                            >
                                <div className="wsp-module-checkbox">
                                    {isChecked && <Check size={14} />}
                                </div>
                                <div className="wsp-module-main">
                                    <div className="wsp-module-top">
                                        <div className="wsp-module-icon" style={{ color: mod.color, background: `${mod.color}15` }}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="wsp-module-titles">
                                            <h4>{mod.title}</h4>
                                            <span className="wsp-module-tag">{mod.tag}</span>
                                        </div>
                                    </div>
                                    <p className="wsp-module-desc">{mod.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {message && <div className="wsp-status-msg">{message}</div>}

                {/* Footer Controls */}
                <div className="wsp-footer">
                    {!isFirstTime && (
                        <button type="button" className="btn-secondary wsp-cancel-btn" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                    )}
                    <button type="button" className="btn-primary wsp-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (
                            <>
                                <span>Save &amp; Apply Workspace</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePreferencesModal;
