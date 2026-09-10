import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    BookOpen, Search, X, ChevronRight, ChevronDown, CheckCircle2, 
    Copy, Check, ArrowLeft, ArrowRight, ExternalLink, Sparkles, 
    FileCode, Server, Terminal, Shield, Cpu, Layers, Menu, CornerDownRight,
    Languages, Globe
} from 'lucide-react';
import { docsToc, docsPages } from '../data/docsData';
import './Docs.css';

const sectionIcons = {
    'sectionPart1': Server,
    'sectionPart2': Terminal,
    'sectionPart3': Cpu,
    'sectionPart4': Sparkles,
    'sectionPart5': Layers,
    'sectionPart6': Shield,
    'sectionPart7': FileCode,
    'default': BookOpen
};

const Docs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);

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
            initial['sectionPart7'] = true;
        }
        return initial;
    });

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
            // Auto expand the parent section if not expanded
            docsToc.forEach(sec => {
                if (sec.items.some(item => item.id === hash)) {
                    setExpandedSections(prev => ({ ...prev, [sec.id]: true }));
                }
            });
            if (contentRef.current) {
                contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [location.hash]);

    const handleSelectPage = (pageId) => {
        setActivePageId(pageId);
        window.location.hash = pageId;
        setMobileDrawerOpen(false);
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleSection = (secId) => {
        setExpandedSections(prev => ({
            ...prev,
            [secId]: !prev[secId]
        }));
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

    // Expose navigateToHash on window for inline HTML onclick handlers
    useEffect(() => {
        window.navigateToHash = (hash) => {
            handleSelectPage(hash);
        };
        return () => {
            delete window.navigateToHash;
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

    return (
        <div className="docs-master-container animate-fade-in">
            {/* Top Hub Banner: Focus on Architecture & Knowledge */}
            <div className="docs-brand-topbar">
                <div className="docs-brand-title-wrap">
                    <div className="docs-badge-icon">
                        <BookOpen size={24} color="#f97316" />
                    </div>
                    <div>
                        <h1 className="docs-brand-name">
                            Architecture &amp; Automation <span>Knowledge Base</span>
                        </h1>
                        <span className="docs-brand-sub">Curated Technical Blueprints, OSLC REST APIs &amp; Maximo Scripts</span>
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
                            <span>English</span>
                        </button>
                        <button 
                            type="button"
                            className={`docs-lang-btn ${language === 'hi' ? 'active' : ''}`}
                            onClick={() => handleSetLanguage('hi')}
                            title="Hinglish Edition (Hindi/English mix)"
                        >
                            <span className="lang-flag">🇮🇳</span>
                            <span>Hinglish</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar Input */}
                <div className="docs-search-shell">
                    <Search size={18} className="docs-search-icon" />
                    <input 
                        type="text" 
                        placeholder={language === 'hi' ? "31+ guides, scripts, APIs me search karein..." : "Search 43+ architecture guides, scripts, APIs..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="docs-clear-btn" onClick={() => setSearchQuery('')}>
                            <X size={16} />
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
                    className="docs-mobile-toc-toggle"
                    onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                >
                    <Menu size={20} />
                    <span>Topics ({flatPageList.length})</span>
                </button>
            </div>

            {/* Mobile Drawer Backdrop */}
            {mobileDrawerOpen && (
                <div 
                    className="docs-drawer-backdrop" 
                    onClick={() => setMobileDrawerOpen(false)} 
                    aria-hidden="true"
                />
            )}

            {/* Layout: Left Dynamic-Height Sticky TOC Tree + Right Documentation Content Canvas */}
            <div className="docs-layout-grid">
                
                {/* Left Sticky Sidebar Tree */}
                <aside className={`docs-sidebar-tree ${mobileDrawerOpen ? 'mobile-open' : ''}`}>
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
                            <button 
                                type="button" 
                                className="sidebar-mobile-close-btn"
                                onClick={() => setMobileDrawerOpen(false)}
                                aria-label="Close Navigation"
                            >
                                <X size={18} />
                            </button>
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

                            {/* Live Language Active Status Badge */}
                            {hasTranslation ? (
                                <button 
                                    type="button"
                                    className="docs-lang-badge-pill dual-active" 
                                    onClick={() => handleSetLanguage(language === 'en' ? 'hi' : 'en')}
                                    title="Click to toggle language"
                                >
                                    <Languages size={14} />
                                    <span>{language === 'hi' ? '🇮🇳 Hinglish Version' : '🇬🇧 English Version'}</span>
                                    <span className="lang-badge-switch-action">Switch to {language === 'hi' ? 'English' : 'Hinglish'}</span>
                                </button>
                            ) : (
                                <div className="docs-lang-badge-pill mono-active" title="This chapter is available in standard English">
                                    <Globe size={14} />
                                    <span>English Edition</span>
                                </div>
                            )}
                        </div>

                        {/* Page Header */}
                        <div className="docs-article-header">
                            <h1 className="docs-article-title">{currentPageData.title}</h1>
                            {currentPageData.subtitle && (
                                <p className="docs-article-subtitle">{currentPageData.subtitle}</p>
                            )}
                        </div>

                        {/* Rendered HTML Guide Content */}
                        <div 
                            className="docs-article-body"
                            dangerouslySetInnerHTML={{ __html: currentPageData.html }}
                        />

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
