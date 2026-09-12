import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    BookOpen, Search, X, ChevronRight, ChevronDown, CheckCircle2, 
    Copy, Check, ArrowLeft, ArrowRight, ExternalLink, Sparkles, 
    FileCode, Server, Terminal, Shield, Cpu, Layers, Menu, CornerDownRight,
    Languages, Globe, Lock, LogIn, UserPlus, Zap, ShieldCheck, Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { docsToc, docsPages } from '../data/docsData';
import './Docs.css';

/**
 * Fine-grained content-aware HTML truncation for exact preview ratios.
 * Measures block-level content elements (headings, code blocks, tables, lists, callouts, paragraphs)
 * and keeps exactly 60% of total content weight (locking the remaining 40%).
 */
function truncateHtmlToPreviewRatio(rawHtml, ratio = 0.6) {
    if (!rawHtml || typeof rawHtml !== 'string') return '';
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return rawHtml;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${rawHtml}</div>`, 'text/html');
        const root = doc.body.firstElementChild;
        if (!root) return rawHtml;

        // Content block elements that make up the reading substance
        const blockSelector = 'p, pre, .ibm-code-block, table, ul, ol, .ibm-callout, blockquote, div.portal-card, h2, h3, h4';
        const allBlocks = Array.from(root.querySelectorAll(blockSelector)).filter(el => {
            // Exclude main page titles/subtitles at root
            if (el.matches('h1, h2.page-title, p.page-subtitle')) return false;
            // Exclude blocks that are children of other content blocks (e.g. pre inside .ibm-code-block, p inside .ibm-callout)
            if (el.closest('.ibm-code-block') && el !== el.closest('.ibm-code-block')) return false;
            if (el.closest('.ibm-callout') && el !== el.closest('.ibm-callout')) return false;
            if (el.closest('table') && el !== el.closest('table')) return false;
            return true;
        });

        if (allBlocks.length <= 1) {
            return rawHtml;
        }

        // Calculate individual block weights
        const blockWeights = allBlocks.map(el => {
            const textLen = (el.textContent || '').trim().length;
            if (el.matches('.ibm-code-block, pre')) return Math.max(textLen, 160);
            if (el.matches('table')) return Math.max(textLen, 200);
            if (el.matches('.ibm-callout')) return Math.max(textLen, 90);
            if (el.matches('h2, h3, h4')) return 30;
            return Math.max(textLen, 25);
        });

        const totalWeight = blockWeights.reduce((sum, w) => sum + w, 0);
        const targetWeight = totalWeight * ratio;

        let accumulated = 0;
        let cutoffIndex = allBlocks.length - 1;

        for (let i = 0; i < allBlocks.length; i++) {
            accumulated += blockWeights[i];
            if (accumulated >= targetWeight) {
                cutoffIndex = i;
                break;
            }
        }

        // Ensure we keep at least 1 content block and at most allBlocks.length - 1
        cutoffIndex = Math.max(0, Math.min(cutoffIndex, allBlocks.length - 1));
        const cutoffElement = allBlocks[cutoffIndex];

        // For tables that are kept, if a table has many rows, trim its tbody rows proportionately
        const keptTables = allBlocks.slice(0, cutoffIndex + 1).filter(el => el.matches('table'));
        keptTables.forEach(tbl => {
            const tbody = tbl.querySelector('tbody');
            if (tbody && tbody.children.length > 3) {
                const keepRows = Math.max(2, Math.ceil(tbody.children.length * ratio));
                while (tbody.children.length > keepRows) {
                    tbody.removeChild(tbody.lastElementChild);
                }
            }
        });

        // Traverse upwards from cutoffElement and delete subsequent siblings at every level
        let curr = cutoffElement;
        while (curr && curr !== root) {
            let next = curr.nextElementSibling;
            while (next) {
                const toRemove = next;
                next = next.nextElementSibling;
                if (toRemove.parentNode) {
                    toRemove.parentNode.removeChild(toRemove);
                }
            }
            curr = curr.parentElement;
        }

        // Clean up empty section containers or dangling headings at the end
        const sections = Array.from(root.querySelectorAll('section'));
        sections.forEach(sec => {
            const hasContent = sec.querySelector('p, pre, .ibm-code-block, table, ul, ol, .ibm-callout');
            if (!hasContent && sec.parentNode) {
                sec.parentNode.removeChild(sec);
            }
        });

        return root.innerHTML;
    } catch (err) {
        console.error('Error truncating docs HTML:', err);
        return rawHtml;
    }
}

const sectionIcons = {
    'sectionPart1': Server,
    'sectionPart2': Terminal,
    'sectionPart3': Cpu,
    'sectionPart4': Sparkles,
    'sectionPart5': Layers,
    'sectionPart6': Shield,
    'sectionPart7': FileCode,
    'sectionPart8': Zap,
    'sectionPart9': Database,
    'default': BookOpen
};

const Docs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const { isAuthenticated, user } = useAuth();

    // Initial page based on URL hash or default to 'overview'
    const getInitialPage = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && docsPages[hash]) return hash;
        return 'overview';
    };

    const [activePageId, setActivePageId] = useState(getInitialPage);
    const [searchQuery, setSearchQuery] = useState('');
    const [language, setLanguage] = useState(() => {
        try {
            return localStorage.getItem('chaudharydocs_lang') || 'en';
        } catch (e) {
            return 'en';
        }
    });

    const [expandedSections, setExpandedSections] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        const initial = {
            'sectionPart1': false,
            'sectionPart2': false,
            'sectionPart3': false,
            'sectionPart4': false,
            'sectionPart5': false,
            'sectionPart6': false,
            'sectionPart7': false
        };
        if (hash) {
            docsToc.forEach(sec => {
                if (sec.items.some(item => item.id === hash)) {
                    initial[sec.id] = true;
                }
            });
        } else {
            initial['sectionPart1'] = true;
        }
        return initial;
    });

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Prevent background body scroll and allow ESC key to close mobile drawer
    useEffect(() => {
        if (mobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    setMobileDrawerOpen(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileDrawerOpen]);

    const [checklistStatus, setChecklistStatus] = useState(() => {
        try {
            const saved = localStorage.getItem('chaudharydocs_checklist');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const handleSetLanguage = (newLang) => {
        setLanguage(newLang);
        try {
            localStorage.setItem('chaudharydocs_lang', newLang);
        } catch (e) {}
    };

    // Listen to hash changes
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && docsPages[hash]) {
            setActivePageId(hash);
            // Auto expand the parent section and collapse all others
            const nextState = {};
            docsToc.forEach(sec => {
                nextState[sec.id] = sec.items.some(item => item.id === hash);
            });
            setExpandedSections(nextState);
            if (contentRef.current) {
                contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [location.hash]);

    const handleSelectPage = (pageId) => {
        setActivePageId(pageId);
        window.location.hash = pageId;
        setMobileDrawerOpen(false);
        // Expand active section and collapse other sections
        const nextState = {};
        docsToc.forEach(sec => {
            nextState[sec.id] = sec.items.some(item => item.id === pageId);
        });
        setExpandedSections(nextState);
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Single-expand Accordion: Opening one section collapses previously opened sections
    const toggleSection = (secId) => {
        setExpandedSections(prev => {
            const isCurrentlyExpanded = !!prev[secId];
            if (isCurrentlyExpanded) {
                // If user clicks the currently open section, collapse it
                return {
                    ...prev,
                    [secId]: false
                };
            } else {
                // Collapse all other sections and expand only this one
                const nextState = {};
                docsToc.forEach(sec => {
                    nextState[sec.id] = (sec.id === secId);
                });
                return nextState;
            }
        });
    };

    const handleToggleAllSections = () => {
        const allExpanded = Object.values(expandedSections).every(Boolean);
        const newState = {};
        docsToc.forEach(sec => {
            newState[sec.id] = !allExpanded;
        });
        setExpandedSections(newState);
    };

    const handleToggleChecklist = (checkId) => {
        setChecklistStatus(prev => {
            const updated = { ...prev, [checkId]: !prev[checkId] };
            try {
                localStorage.setItem('chaudharydocs_checklist', JSON.stringify(updated));
            } catch (e) {}
            return updated;
        });
    };

    // Calculate flat list of pages for Next / Prev navigation
    const flatPageList = useMemo(() => {
        const list = [];
        docsToc.forEach(sec => {
            sec.items.forEach(item => {
                list.push({ 
                    ...item, 
                    sectionTitle: sec.title,
                    sectionTitle_hi: sec.title_hi
                });
            });
        });
        return list;
    }, []);

    const currentIndex = flatPageList.findIndex(p => p.id === activePageId);
    const prevPage = currentIndex > 0 ? flatPageList[currentIndex - 1] : null;
    const nextPage = currentIndex >= 0 && currentIndex < flatPageList.length - 1 ? flatPageList[currentIndex + 1] : null;

    // Search results across all pages (bilingual search)
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results = [];
        Object.values(docsPages).forEach(p => {
            const inTitle = p.title?.toLowerCase().includes(q) || p.title_hi?.toLowerCase().includes(q);
            const inSubtitle = p.subtitle?.toLowerCase().includes(q) || p.subtitle_hi?.toLowerCase().includes(q);
            const inHtml = p.html?.toLowerCase().includes(q) || p.html_hi?.toLowerCase().includes(q);
            if (inTitle || inSubtitle || inHtml) {
                const displayTitle = (language === 'hi' && p.title_hi) ? p.title_hi : p.title;
                const displaySub = (language === 'hi' && p.subtitle_hi) ? p.subtitle_hi : p.subtitle;
                results.push({
                    id: p.id,
                    title: displayTitle,
                    subtitle: displaySub,
                    score: inTitle ? 3 : (inSubtitle ? 2 : 1)
                });
            }
        });
        return results.sort((a, b) => b.score - a.score);
    }, [searchQuery, language]);

    // Active Page Data with bilingual resolution
    const rawPageData = docsPages[activePageId] || docsPages['overview'] || {
        title: 'Enterprise Documentation',
        subtitle: 'Enterprise Architecture, Automation & OSLC Guides',
        html: '<p>Select a guide from the sidebar.</p>'
    };

    const hasTranslation = Boolean(rawPageData.html_hi || rawPageData.title_hi);
    const isHinglishActive = language === 'hi' && hasTranslation;

    const currentPageData = {
        id: rawPageData.id,
        title: isHinglishActive ? (rawPageData.title_hi || rawPageData.title) : rawPageData.title,
        subtitle: isHinglishActive ? (rawPageData.subtitle_hi || rawPageData.subtitle) : rawPageData.subtitle,
        html: isHinglishActive ? (rawPageData.html_hi || rawPageData.html) : rawPageData.html,
        hasTranslation,
        isHinglish: isHinglishActive
    };

    const isOverviewPage = activePageId === 'overview' || currentPageData.id === 'overview';

    // Safe 60% Preview truncation for unauthenticated guests (overview landing page is 100% free)
    const displayHtml = useMemo(() => {
        if (isAuthenticated || isOverviewPage) {
            return currentPageData.html;
        }
        return truncateHtmlToPreviewRatio(currentPageData.html, 0.6);
    }, [currentPageData.html, isAuthenticated, isOverviewPage]);

    // Expose helper functions on window for inline HTML onclick handlers
    useEffect(() => {
        window.navigateToHash = (hash) => {
            handleSelectPage(hash);
        };
        window.copyText = (text, btnElement) => {
            if (text && navigator.clipboard) {
                navigator.clipboard.writeText(text);
                if (btnElement) {
                    const originalHtml = btnElement.innerHTML;
                    btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    btnElement.style.color = '#10b981';
                    setTimeout(() => {
                        btnElement.innerHTML = originalHtml;
                        btnElement.style.color = '';
                    }, 2000);
                }
            }
        };
        window.switchTab = (tabId, btnElement) => {
            if (!btnElement) return;
            const tabsContainer = btnElement.closest('.ibm-tabs') || btnElement.parentElement;
            if (tabsContainer) {
                tabsContainer.querySelectorAll('.ibm-tab-btn').forEach(btn => btn.classList.remove('active'));
                btnElement.classList.add('active');
            }
            const container = btnElement.closest('section') || btnElement.closest('.docs-article-body') || document;
            container.querySelectorAll('.ibm-tab-pane').forEach(pane => {
                if (pane.id === `tab-${tabId}` || pane.id === tabId) {
                    pane.classList.add('active');
                } else if (pane.id.startsWith('tab-') || pane.classList.contains('ibm-tab-pane')) {
                    pane.classList.remove('active');
                }
            });
        };
        return () => {
            delete window.navigateToHash;
            delete window.copyText;
            delete window.switchTab;
        };
    }, []);

    // Handle code copying and card clicks inside rendered HTML
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Handle portal card clicks
            const card = e.target.closest('.portal-card');
            if (card) {
                const onclickAttr = card.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/navigateToHash\(['"]([^'"]+)['"]\)/);
                    if (match && match[1]) {
                        e.preventDefault();
                        handleSelectPage(match[1]);
                        return;
                    }
                }
            }

            // Handle code copy button
            const btn = e.target.closest('.btn-copy');
            if (btn) {
                const codeBlock = btn.closest('.ibm-code-block');
                if (codeBlock) {
                    const pre = codeBlock.querySelector('pre');
                    if (pre) {
                        const text = pre.innerText || pre.textContent;
                        navigator.clipboard.writeText(text);
                        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                        btn.style.color = '#10b981';
                        setTimeout(() => {
                            btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                            btn.style.color = '';
                        }, 2000);
                    }
                }
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, [activePageId]);

    // Current category name
    const currentSection = docsToc.find(sec => sec.items.some(item => item.id === activePageId));

    const isAllExpanded = Object.values(expandedSections).every(Boolean);

    // Render TOC Sidebar Content (Shared between desktop aside and mobile modal dialog)
    const renderSidebarTreeContent = (isMobile = false) => (
        <>
            <div className="sidebar-tree-header">
                <span className="sidebar-tree-title">TABLE OF CONTENTS</span>
                <div className="sidebar-header-actions">
                    <button 
                        type="button" 
                        className="sidebar-expand-all-btn"
                        onClick={handleToggleAllSections}
                    >
                        {isAllExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                    <span className="sidebar-tree-count">{flatPageList.length}</span>
                    {isMobile && (
                        <button 
                            type="button" 
                            className="sidebar-mobile-close-btn"
                            onClick={() => setMobileDrawerOpen(false)}
                            aria-label="Close Navigation"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="sidebar-tree-scroll">
                {docsToc.map((sec, sIdx) => {
                    const IconComp = sectionIcons[sec.id] || sectionIcons['default'];
                    const isExpanded = expandedSections[sec.id];
                    const hasActive = sec.items.some(it => it.id === activePageId);
                    const sectionDisplayTitle = (language === 'hi' && sec.title_hi) ? sec.title_hi : sec.title;

                    return (
                        <div key={sec.id || sIdx} className={`toc-accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            <button 
                                type="button"
                                className={`toc-accordion-header ${hasActive ? 'has-active' : ''}`}
                                onClick={() => toggleSection(sec.id)}
                            >
                                <div className="accordion-title-left">
                                    <IconComp size={16} className="accordion-icon" />
                                    <span>{sectionDisplayTitle}</span>
                                </div>
                                <ChevronRight size={16} className={`accordion-arrow ${isExpanded ? 'rotated' : ''}`} />
                            </button>

                            {isExpanded && (
                                <ul className="toc-accordion-items">
                                    {sec.items.map(item => {
                                        const isActive = item.id === activePageId;
                                        const itemDisplayLabel = (language === 'hi' && item.label_hi) ? item.label_hi : item.label;

                                        return (
                                            <li key={item.id}>
                                                <button 
                                                    className={`toc-page-link ${isActive ? 'active' : ''}`}
                                                    onClick={() => handleSelectPage(item.id)}
                                                >
                                                    <div className="link-indicator-dot"></div>
                                                    <span className="link-label">{itemDisplayLabel}</span>
                                                    {item.label_hi && (
                                                        <span className="bilingual-indicator" title="Available in English & Hinglish">HI</span>
                                                    )}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );

    return (
        <div className="docs-master-container animate-fade-in">
            {/* Top Hub Banner: Ultra-Compact Responsive Architecture Header */}
            <div className="docs-brand-topbar">
                <div className="docs-brand-header-row">
                    <div className="docs-brand-title-wrap">
                        <div className="docs-badge-icon">
                            <BookOpen size={20} color="#f97316" />
                        </div>
                        <div>
                            <h1 className="docs-brand-name">
                                Knowledge <span>Base</span>
                            </h1>
                        </div>
                    </div>

                    {/* Language Switcher Toggle Pill */}
                    <div className="docs-lang-selector-wrap">
                        <div className="docs-lang-toggle-pill" role="radiogroup" aria-label="Documentation Language">
                            <button 
                                type="button"
                                className={`docs-lang-btn ${language === 'en' ? 'active' : ''}`}
                                onClick={() => handleSetLanguage('en')}
                                title="English Edition (Default)"
                            >
                                <span className="lang-flag">🇬🇧</span>
                                <span className="lang-text-desktop">English</span>
                                <span className="lang-text-mobile">EN</span>
                            </button>
                            <button 
                                type="button"
                                className={`docs-lang-btn ${language === 'hi' ? 'active' : ''}`}
                                onClick={() => handleSetLanguage('hi')}
                                title="Hinglish Edition (Hindi/English mix)"
                            >
                                <span className="lang-flag">🇮🇳</span>
                                <span className="lang-text-desktop">Hinglish</span>
                                <span className="lang-text-mobile">HI</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar & Mobile Topics Trigger Action Row */}
                <div className="docs-brand-action-row">
                    <div className="docs-search-shell">
                        <Search size={16} className="docs-search-icon" />
                        <input 
                            type="text" 
                            placeholder={language === 'hi' ? "Guides me search karein..." : "Search documentation guides..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="docs-clear-btn" onClick={() => setSearchQuery('')}>
                                <X size={14} />
                            </button>
                        )}

                        {/* Quick Search Results Dropdown */}
                        {searchQuery && (
                            <div className="docs-search-results-dropdown">
                                <div className="search-results-head">
                                    <span>Found {searchResults.length} {searchResults.length === 1 ? 'Guide' : 'Guides'}</span>
                                </div>
                                <div className="search-results-list">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(res => (
                                            <button 
                                                key={res.id} 
                                                className="search-res-item"
                                                onClick={() => {
                                                    handleSelectPage(res.id);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <div className="search-res-title">{res.title}</div>
                                                {res.subtitle && <div className="search-res-sub">{res.subtitle}</div>}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="search-res-empty">No documentation guides match "{searchQuery}"</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Sidebar Drawer Toggle */}
                    <button 
                        type="button"
                        className="docs-mobile-toc-toggle"
                        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                        aria-label="Open Topics"
                    >
                        <Menu size={16} />
                        <span>Topics ({flatPageList.length})</span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Rendered with createPortal at Body Level to ensure it is above Navbar & Stacking Contexts */}
            {mobileDrawerOpen && typeof document !== 'undefined' && createPortal(
                <div className="docs-mobile-drawer-portal">
                    <div 
                        className="docs-drawer-backdrop" 
                        onClick={() => setMobileDrawerOpen(false)} 
                        aria-hidden="true"
                    />
                    <aside 
                        className="docs-sidebar-tree mobile-open mobile-drawer-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Table of Contents"
                    >
                        {renderSidebarTreeContent(true)}
                    </aside>
                </div>,
                document.body
            )}

            {/* Layout: Left Dynamic-Height Sticky TOC Tree + Right Documentation Content Canvas */}
            <div className="docs-layout-grid">
                
                {/* Left Sticky Sidebar Tree (Desktop View) */}
                <aside className="docs-sidebar-tree desktop-tree" aria-label="Table of Contents">
                    {renderSidebarTreeContent(false)}
                </aside>

                {/* Right Main Documentation Reader Canvas */}
                <main className="docs-reader-main" ref={contentRef}>
                    <div className="docs-reader-inner docs-page-anim" key={`${activePageId}-${language}`}>
                        {/* Meta & Breadcrumbs Navigation Bar */}
                        <div className="docs-article-meta-row">
                            <div className="docs-breadcrumbs">
                                <span>ChaudharyDocs</span>
                                <span className="breadcrumb-sep">/</span>
                                <span>{(language === 'hi' && currentSection?.title_hi) ? currentSection.title_hi : (currentSection?.title || 'Knowledge Base')}</span>
                                <span className="breadcrumb-sep">/</span>
                                <span className="breadcrumb-active">{currentPageData.title}</span>
                            </div>
                        </div>

                        {/* Page Header */}
                        <div className="docs-article-header">
                            <h1 className="docs-article-title">{currentPageData.title}</h1>
                            {currentPageData.subtitle && (
                                <p className="docs-article-subtitle">{currentPageData.subtitle}</p>
                            )}
                        </div>

                        {/* Rendered HTML Guide Content & 60% Preview Barrier (40% Locked, bypassed on Overview landing) */}
                        <div className={`docs-article-body-wrapper ${!isAuthenticated && !isOverviewPage ? 'has-preview-lock' : ''}`}>
                            <div 
                                className={`docs-article-body ${!isAuthenticated && !isOverviewPage ? 'docs-preview-truncated' : ''}`}
                                dangerouslySetInnerHTML={{ __html: displayHtml }}
                            />

                            {/* 60% Free / 40% Lock Barrier / Paywall Card for Non-Logged-In Users (Not shown on overview landing) */}
                            {!isAuthenticated && !isOverviewPage && (
                                <div className="docs-paywall-barrier">
                                    <div className="docs-paywall-gradient-fade" />
                                    
                                    <div className="docs-paywall-card">
                                        <div className="docs-paywall-badge">
                                            <Lock size={14} />
                                            <span>{language === 'hi' ? '60% FREE PREVIEW LIMIT' : '60% FREE PREVIEW LIMIT'}</span>
                                        </div>

                                        <div className="docs-paywall-progress-wrap">
                                            <div className="docs-paywall-progress-info">
                                                <span className="progress-label">
                                                    {language === 'hi' ? '📖 60% Preview Read' : '📖 60% Preview Read'}
                                                </span>
                                                <span className="progress-lock-label">
                                                    {language === 'hi' ? '🔒 Baki 40% Locked' : '🔒 Remaining 40% Locked'}
                                                </span>
                                            </div>
                                            <div className="docs-paywall-progress-bar">
                                                <div className="docs-paywall-progress-fill" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>

                                        <h3 className="docs-paywall-title">
                                            {language === 'hi' 
                                                ? 'Baki 40% Guide & Scripts Padhne Ke Liye Login Karein' 
                                                : 'Sign In to Unlock the Remaining 40% Documentation'}
                                        </h3>

                                        <p className="docs-paywall-desc">
                                            {language === 'hi'
                                                ? 'Ye enterprise documentation hamare registered members ke liye completely free hai. Apne free CS Corporation / Chaudhary & Sons account se login karke complete blueprints, Maximo automation scripts aur OSLC REST APIs access karein.'
                                                : 'This comprehensive technical blueprint is completely free for registered community members. Log in or create a free account to unlock full architecture guides, copy-paste automation scripts, and OSLC REST API specs.'}
                                        </p>

                                        <div className="docs-paywall-perks-grid">
                                            <div className="paywall-perk-item">
                                                <CheckCircle2 size={16} className="perk-icon" />
                                                <span>{language === 'hi' ? '43+ Complete Architecture Guides' : '43+ Complete Technical Blueprints'}</span>
                                            </div>
                                            <div className="paywall-perk-item">
                                                <CheckCircle2 size={16} className="perk-icon" />
                                                <span>{language === 'hi' ? 'Maximo & OSLC Automation Scripts' : 'Ready-to-use Automation Scripts'}</span>
                                            </div>
                                            <div className="paywall-perk-item">
                                                <CheckCircle2 size={16} className="perk-icon" />
                                                <span>{language === 'hi' ? 'English & Hinglish Dual Editions' : 'English & Hinglish Dual Editions'}</span>
                                            </div>
                                            <div className="paywall-perk-item">
                                                <CheckCircle2 size={16} className="perk-icon" />
                                                <span>{language === 'hi' ? 'Interactive Diagnostic Trackers' : 'Interactive Diagnostic Checklists'}</span>
                                            </div>
                                        </div>

                                        <div className="docs-paywall-cta-row">
                                            <button 
                                                type="button"
                                                className="docs-paywall-btn-primary"
                                                onClick={() => navigate(`/login?redirect=${encodeURIComponent('/docs#' + activePageId)}`)}
                                            >
                                                <LogIn size={18} />
                                                <span>{language === 'hi' ? 'Login Karke Full Docs Unlock Karein' : 'Login to Unlock Full Guide'}</span>
                                                <ArrowRight size={16} />
                                            </button>
                                            
                                            <button 
                                                type="button"
                                                className="docs-paywall-btn-secondary"
                                                onClick={() => navigate(`/login?mode=signup&redirect=${encodeURIComponent('/docs#' + activePageId)}`)}
                                            >
                                                <UserPlus size={18} />
                                                <span>{language === 'hi' ? 'Naya Free Account Banayein' : 'Create Free Account'}</span>
                                            </button>
                                        </div>

                                        <div className="docs-paywall-guarantee">
                                            <Zap size={14} />
                                            <span>{language === 'hi' ? '100% Free Access • No Credit Card Required • Instant Unlock' : '100% Free Access • Instant Unlock • No Credit Card Required'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Smart Next / Previous Footer Navigation */}
                        <div className="docs-footer-pagination">
                            {prevPage ? (
                                <button 
                                    className="docs-nav-page-btn prev"
                                    onClick={() => handleSelectPage(prevPage.id)}
                                >
                                    <ArrowLeft size={18} />
                                    <div>
                                        <small>{language === 'hi' ? 'PICHHLA TOPIC' : 'PREVIOUS TOPIC'}</small>
                                        <span>{(language === 'hi' && prevPage.label_hi) ? prevPage.label_hi : prevPage.label}</span>
                                    </div>
                                </button>
                            ) : <div></div>}

                            {nextPage ? (
                                <button 
                                    className="docs-nav-page-btn next"
                                    onClick={() => handleSelectPage(nextPage.id)}
                                >
                                    <div>
                                        <small>{language === 'hi' ? 'AGLA TOPIC' : 'NEXT TOPIC'}</small>
                                        <span>{(language === 'hi' && nextPage.label_hi) ? nextPage.label_hi : nextPage.label}</span>
                                    </div>
                                    <ArrowRight size={18} />
                                </button>
                            ) : <div></div>}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Docs;
