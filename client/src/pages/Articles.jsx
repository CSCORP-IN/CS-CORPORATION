import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../context/ArticleContext';
import { 
    Calendar, User, ArrowRight, Search, X, Clock, Sparkles, 
    BookOpen, Layers, GraduationCap, Building2, PenSquare, ArrowUpRight
} from 'lucide-react';
import './Articles.css';

const Articles = () => {
    const { articles, loading } = useArticles();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const approvedArticles = useMemo(() => {
        return articles.filter(art => art.status === 'approved');
    }, [articles]);

    // Extract all unique categories from approved articles
    const categories = useMemo(() => {
        const set = new Set(approvedArticles.map(a => a.category).filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [approvedArticles]);

    // Filter by both search query and selected category
    const filteredArticles = useMemo(() => {
        return approvedArticles.filter(article => {
            const matchesCategory = selectedCategory === 'All' || article.category?.toLowerCase() === selectedCategory.toLowerCase();
            if (!matchesCategory) return false;

            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                article.title?.toLowerCase().includes(query) ||
                article.author?.toLowerCase().includes(query) ||
                article.category?.toLowerCase().includes(query) ||
                article.excerpt?.toLowerCase().includes(query)
            );
        });
    }, [approvedArticles, searchQuery, selectedCategory]);

    // Calculate approximate read time
    const getReadTime = (content = '') => {
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200) || 1;
        return `${minutes} min read`;
    };

    return (
        <div className="articles-container animate-fade-in">
            {/* Ambient Background Glow */}
            <div className="articles-hero-glow"></div>

            {/* Header Hero */}
            <header className="articles-page-header">
                <div className="badge-pill articles-top-badge">
                    <Sparkles size={14} className="badge-sparkle-icon" />
                    <span>TECHNICAL ARTICLES</span>
                </div>

                <h1 className="page-title articles-shine-title">
                    Read &amp; <span className="shine-gradient-text">Publish Article</span>
                </h1>

                <p className="page-subtitle">
                    Explore community guides, architectural blueprints, or publish your own insights.
                </p>

                {/* Ecosystem Cross-Links Navigation */}
                <div className="articles-ecosystem-nav">
                    <Link to="/docs" className="eco-nav-chip">
                        <Layers size={14} />
                        <span>ChaudharyDocs</span>
                        <ArrowUpRight size={12} className="eco-arrow" />
                    </Link>
                    <Link to="/courses" className="eco-nav-chip">
                        <GraduationCap size={14} />
                        <span>ChaudharyConnect</span>
                        <ArrowUpRight size={12} className="eco-arrow" />
                    </Link>
                    <Link to="/" className="eco-nav-chip">
                        <Building2 size={14} />
                        <span>Chaudhary &amp; Sons</span>
                        <ArrowUpRight size={12} className="eco-arrow" />
                    </Link>
                    <Link to="/post" className="eco-nav-chip highlight">
                        <PenSquare size={14} />
                        <span>Write an Article</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="search-and-filters">
                    <div className="search-bar-glass glass">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles by title, topic, keyword, or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="category-filter-strip">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                                {cat === 'All' ? ` (${approvedArticles.length})` : ''}
                            </button>
                        ))}
                    </div>

                    {searchQuery && (
                        <p className="search-feedback">
                            Found <strong>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'article' : 'articles'} matching "{searchQuery}"
                        </p>
                    )}
                </div>
            </header>

            {/* Articles Grid */}
            <div className="articles-grid-layout">
                {loading ? (
                    <div className="loading-state glass-card">
                        <Sparkles className="animate-spin" size={32} color="#ea580c" />
                        <p>Loading published articles...</p>
                    </div>
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                        <article key={article.id || article._id} className="article-modern-card glass-card">
                            {/* Card Top: Category & Read Time */}
                            <div className="card-top-meta">
                                <span className="article-category-badge">{article.category || 'Engineering'}</span>
                                <div className="read-time-pill">
                                    <Clock size={13} />
                                    <span>{getReadTime(article.content || article.excerpt)}</span>
                                </div>
                            </div>

                            {/* Card Body: Title & Excerpt */}
                            <div className="card-body-wrap">
                                <h2 className="article-card-title">
                                    <Link to={`/articles/${article.id || article._id}`}>{article.title}</Link>
                                </h2>
                                <p className="article-card-excerpt">{article.excerpt || 'Explore this technical article to learn architectural insights and best practices.'}</p>
                            </div>

                            {/* Card Footer: Author, Date & Read Link */}
                            <div className="article-card-footer">
                                <div className="author-meta-box">
                                    <div className="author-avatar-glyph">
                                        <User size={13} />
                                    </div>
                                    <div className="author-details-col">
                                        <span className="author-name-text">{article.author || 'Ankit Chaudhary'}</span>
                                        <span className="publish-date-text">
                                            <Calendar size={11} /> {article.date || 'Recent'}
                                        </span>
                                    </div>
                                </div>

                                <Link to={`/articles/${article.id || article._id}`} className="read-article-link">
                                    <span>Read</span>
                                    <ArrowRight size={14} className="read-arrow-icon" />
                                </Link>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="no-articles-state glass-card">
                        <BookOpen size={48} className="no-icon" />
                        <h3>No articles found</h3>
                        <p>We couldn't find any articles matching your current search or category filter.</p>
                        <button
                            className="btn-primary reset-filter-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Articles;
