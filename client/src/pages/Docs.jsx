import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    BookOpen, Search, X, ChevronRight, ChevronDown, CheckCircle2, 
    Copy, Check, ArrowLeft, ArrowRight, ExternalLink, Sparkles, 
    FileCode, Server, Terminal, Shield, Cpu, Layers, Menu, CornerDownRight
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
    const [expandedSections, setExpandedSections] = useState({
        'sectionPart1': true,
        'sectionPart2': false,
        'sectionPart3': false,
        'sectionPart4': false,
        'sectionPart5': false,
        'sectionPart6': false
    });
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [checklistStatus, setChecklistStatus] = useState(() => {
        try {
            const saved = localStorage.getItem('chaudharydocs_checklist');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

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
                list.push({ ...item, sectionTitle: sec.title });
            });
        });
        return list;
    }, []);

    const currentIndex = flatPageList.findIndex(p => p.id === activePageId);
    const prevPage = currentIndex > 0 ? flatPageList[currentIndex - 1] : null;
    const nextPage = currentIndex >= 0 && currentIndex < flatPageList.length - 1 ? flatPageList[currentIndex + 1] : null;

    // Search results across all pages
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results = [];
        Object.values(docsPages).forEach(p => {
            const inTitle = p.title?.toLowerCase().includes(q);
            const inSubtitle = p.subtitle?.toLowerCase().includes(q);
            const inHtml = p.html?.toLowerCase().includes(q);
            if (inTitle || inSubtitle || inHtml) {
                results.push({
                    id: p.id,
                    title: p.title,
                    subtitle: p.subtitle,
                    score: inTitle ? 3 : (inSubtitle ? 2 : 1)
                });
            }
        });
        return results.sort((a, b) => b.score - a.score);
    }, [searchQuery]);

    // Active Page Data
    const currentPageData = docsPages[activePageId] || docsPages['overview'] || {
        title: 'Enterprise Documentation',
        subtitle: 'Enterprise Architecture, Automation & OSLC Guides',
        html: '<p>Select a guide from the sidebar.</p>'
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
            {/* Top Hub Banner: Focus on Architecture & Knowledge without repeating logo */}
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

                {/* Search Bar Input */}
                <div className="docs-search-shell">
                    <Search size={18} className="docs-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search 31+ architecture guides, scripts, APIs..."
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

                            return (
                                <div key={sec.id || sIdx} className={`toc-accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                    <button 
                                        type="button"
                                        className={`toc-accordion-header ${hasActive ? 'has-active' : ''}`}
                                        onClick={() => toggleSection(sec.id)}
                                    >
                                        <div className="accordion-title-left">
                                            <IconComp size={16} className="accordion-icon" />
                                            <span>{sec.title}</span>
                                        </div>
                                        <ChevronRight size={16} className={`accordion-arrow ${isExpanded ? 'rotated' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <ul className="toc-accordion-items">
                                            {sec.items.map(item => {
                                                const isActive = item.id === activePageId;
                                                return (
                                                    <li key={item.id}>
                                                        <button 
                                                            className={`toc-page-link ${isActive ? 'active' : ''}`}
                                                            onClick={() => handleSelectPage(item.id)}
                                                        >
                                                            <div className="link-indicator-dot"></div>
                                                            <span className="link-label">{item.label}</span>
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
                    <div className="docs-reader-inner docs-page-anim" key={activePageId}>
                        
                        {/* Breadcrumbs Navigation */}
                        <div className="docs-breadcrumbs">
                            <span>ChaudharyDocs</span>
                            <span className="breadcrumb-sep">/</span>
                            <span>{currentSection?.title || 'Knowledge Base'}</span>
                            <span className="breadcrumb-sep">/</span>
                            <span className="breadcrumb-active">{currentPageData.title}</span>
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
                                        <small>PREVIOUS TOPIC</small>
                                        <span>{prevPage.label}</span>
                                    </div>
                                </button>
                            ) : <div></div>}

                            {nextPage ? (
                                <button 
                                    className="docs-nav-page-btn next"
                                    onClick={() => handleSelectPage(nextPage.id)}
                                >
                                    <div>
                                        <small>NEXT TOPIC</small>
                                        <span>{nextPage.label}</span>
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
