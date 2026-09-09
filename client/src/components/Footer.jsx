import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter, ChevronRight, Sparkles, ArrowUpRight, Copy, Check, Terminal, Shield } from 'lucide-react';
import Logo from './Logo';
import './Footer.css';

const Footer = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("admin@cscorp.in");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <footer className="cyber-footer">
            <div className="cyber-footer-container">
                
                {/* Brand Big Headline Strip */}
                <div className="footer-big-brand-strip">
                    <span className="brand-grand-text">CHAUDHARY &amp; SONS</span>
                </div>

                <div className="footer-columns-matrix">
                    
                    {/* Brand Info */}
                    <div className="footer-brand-info">
                        <Link to="/" className="footer-logo-link">
                            <Logo size={32} />
                        </Link>
                        <p className="footer-brand-desc">
                            CS Corporation (cscorp.in • Chaudhary &amp; Sons Corporation) is the foundational parent enterprise driving mission-critical IBM Maximo architecture, supply chain distribution, and technical knowledge platforms.
                        </p>
                        <div className="footer-social-cluster">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="GitHub">
                                <Github size={18} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="mailto:admin@cscorp.in" className="social-icon-btn" aria-label="Email">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="footer-nav-col">
                        <h4 className="footer-nav-title">Navigation</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Chaudhary &amp; Sons Home</Link></li>
                            <li><Link to="/ankit-chaudhary">Ankit Chaudhary (EAM)</Link></li>
                            <li><Link to="/anant-chaudhary">Anant Chaudhary (Supply Chain)</Link></li>
                            <li><Link to="/docs">ChaudharyDocs</Link></li>
                            <li><Link to="/courses">ChaudharyConnect</Link></li>
                        </ul>
                    </div>

                    {/* Platforms */}
                    <div className="footer-nav-col">
                        <h4 className="footer-nav-title">Chaudhary Ecosystem</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Parent Organization</Link></li>
                            <li><Link to="/docs">Knowledge Base &amp; Scripts</Link></li>
                            <li><Link to="/courses">Live Maximo Bootcamp</Link></li>
                            <li><Link to="/articles">Technical Publications</Link></li>
                            <li><Link to="/post">Publish an Article</Link></li>
                        </ul>
                    </div>

                    {/* Quick Contact Box */}
                    <div className="footer-nav-col contact-col">
                        <h4 className="footer-nav-title">Direct Inquiries</h4>
                        <p className="footer-contact-note">Available for high-impact enterprise consultations &amp; MAS migration advisory.</p>
                        <button onClick={handleCopyEmail} className="footer-copy-pill">
                            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            <span>{copied ? 'Copied to Clipboard!' : 'admin@cscorp.in'}</span>
                        </button>
                    </div>

                </div>

                {/* Bottom Copyright & Security Strip */}
                <div className="footer-copyright-strip">
                    <p>{`© ${new Date().getFullYear()} CS Corporation (Chaudhary & Sons Corporation) • cscorp.in. All rights reserved.`}</p>
                    <div className="footer-status-pill">
                        <span className="live-status-dot"></span>
                        <span>Enterprise Systems Operational</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
