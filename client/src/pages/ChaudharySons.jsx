import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Layers, Shield, Sparkles, BookOpen, GraduationCap, 
    FileText, ArrowRight, ExternalLink, Mail, Phone, 
    CheckCircle2, Users, Award, Briefcase, ChevronRight, 
    Terminal, Database, Send, Copy, Check, Star, HeartHandshake, Landmark
} from 'lucide-react';
import API_BASE_URL from '../config';
import './ChaudharySons.css';

const ChaudharySons = () => {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactStatus, setContactStatus] = useState(null);

    // Typewriter Rotating Tagline
    const roles = [
        "CS Corporation • Foundational Parent Organization",
        "Generational Heritage & Public Service",
        "Enterprise Advisory & Strategic Platforms",
        "Open Knowledge Repositories & Academies"
    ];
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(80);

    useEffect(() => {
        const fullText = roles[currentRoleIndex];
        const handleTyping = () => {
            if (!isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                setTypingSpeed(70);
                if (currentText === fullText) {
                    setTimeout(() => setIsDeleting(true), 2200);
                }
            } else {
                setCurrentText(fullText.substring(0, currentText.length - 1));
                setTypingSpeed(40);
                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentRoleIndex, typingSpeed]);

    const copyEmail = () => {
        navigator.clipboard.writeText("admin@cscorp.in");
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setContactStatus('submitting');
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...contactForm,
                    subject: `[Chaudhary & Sons Parent Portal] ${contactForm.subject}`
                })
            });
            if (response.ok) {
                setContactStatus('success');
                setContactForm({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setContactStatus(null), 3000);
            } else {
                setContactStatus('error');
            }
        } catch (err) {
            setContactStatus('error');
        }
    };

    // 4 Flagship Digital Platforms & Ecosystems
    const platforms = [
        {
            id: 'enterprise',
            badge: 'PARENT ORGANIZATION',
            badgeColor: '#f97316',
            title: 'Chaudhary & Sons',
            tagline: 'Strategic Enterprise Solutions & Family Foundation',
            desc: 'The foundational organization uniting family heritage, public service, enterprise advisory, and strategic digital platforms across verticals.',
            stats: ['Enterprise Advisory', 'Public Service', 'Global Reach'],
            tags: ['Enterprise Solutions', 'Strategic Planning', 'Family Heritage', 'Platforms'],
            link: '#contact',
            actionText: 'Visit'
        },
        {
            id: 'docs',
            badge: 'KNOWLEDGE BASE',
            badgeColor: '#f97316',
            title: 'ChaudharyDocs',
            tagline: 'Technical Blueprints & Architecture Knowledge Base',
            desc: 'Comprehensive technical documentation and open knowledge repository featuring architecture guides, script launch points, and system blueprints.',
            stats: ['31+ In-Depth Guides', 'REST / OSLC Blueprints', 'Automation Scripts'],
            tags: ['Architecture Guides', 'Automation', 'Integration Frameworks', 'Knowledge Base'],
            link: '/docs',
            actionText: 'Visit'
        },
        {
            id: 'articles',
            badge: 'PUBLICATIONS',
            badgeColor: '#10b981',
            title: 'ChaudharyArticles',
            tagline: 'Technical Insights, Articles & Case Studies',
            desc: 'Curated technical publication platform featuring in-depth domain articles, case studies, engineering analysis, and technology insights.',
            stats: ['Peer-Reviewed Articles', 'Case Studies', 'Domain Insights'],
            tags: ['Technical Writing', 'Case Studies', 'System Design', 'Technology Insights'],
            link: '/articles',
            actionText: 'Visit'
        },
        {
            id: 'connect',
            badge: 'TRAINING ACADEMY',
            badgeColor: '#ea580c',
            title: 'ChaudharyConnect',
            tagline: 'Live Professional Training & Mentorship Academy',
            desc: 'Interactive live mentorship platform empowering professionals through structured modular training, hands-on labs, and real-world domain masterclasses.',
            stats: ['10 Modular Tracks', 'From ₹1,999 / module', '100% Live Mentorship'],
            tags: ['Live Masterclasses', 'Hands-On Labs', 'Modular Learning', 'Mentorship'],
            link: '/courses',
            actionText: 'Visit'
        }
    ];

    // Family Leadership & Pillars
    const leadership = [
        {
            id: 'shyamdev',
            name: 'Shyamdev Chaudhary',
            role: 'Former Assistant Development Officer (ADO - Agriculture)',
            roleBadge: 'GOVERNMENT SERVICE • FOUNDING PILLAR',
            badgeColor: '#f97316',
            icon: Landmark,
            desc: 'Distinguished public servant who served as Assistant Development Officer (ADO) in the Agriculture Department, dedicated to grassroots agrarian development, farmers\' welfare, and public administration. The patriarchal pillar and moral anchor of the family, establishing enduring values of integrity, discipline, and generational wisdom.',
            expertise: ['Public Administration', 'Agriculture & Agrarian Development', 'Public Service & Governance', 'Ethical Leadership', 'Family Heritage'],
            quote: '“Integrity in public service and devotion to one’s duty are the truest foundations of enduring respect and success.”'
        },
        {
            id: 'ankit',
            name: 'Ankit Chaudhary',
            role: 'Enterprise Asset Management (EAM) Architect',
            roleBadge: 'EAM ARCHITECT & TECHNICAL FOUNDER',
            badgeColor: '#f97316',
            icon: Sparkles,
            desc: 'Lead Enterprise Asset Management Architect with 4+ years of specialized engineering mastery across IBM Maximo, Java EE development, MIF enterprise integrations, Jython automation scripts, MAS 8.x digital transformation, and modern AI copilot tools.',
            expertise: ['IBM Maximo EAM', 'Java EE & Jython Automation', 'MIF Integration Architecture', 'Generative AI Developer Tools'],
            quote: '“Engineering resilient, high-performance enterprise systems with precision, scalability, and automated intelligence.”',
            portfolioLink: '/ankit-chaudhary',
            portfolioText: 'View Ankit Chaudhary EAM Portfolio'
        },
        {
            id: 'anant',
            name: 'Anant Chaudhary',
            role: 'Senior Manager — Supply Chain & Logistics',
            roleBadge: 'SUPPLY CHAIN & LOGISTICS LEADER',
            badgeColor: '#10b981',
            icon: Briefcase,
            desc: 'Senior Manager at Delhivery Limited (PGDM in Supply Chain from IMT Ghaziabad) with 8+ years of comprehensive supply chain, 3PL warehousing, and e-commerce distribution mastery across 80,000+ sq. ft. fulfillment centers and marquee enterprise clients.',
            expertise: ['Supply Chain Strategy', 'Logistics Optimization', '3PL Warehousing & Fulfillment', 'WMS / TMS Systems', 'Lean 5S & Inventory Audits'],
            quote: '“Driving operational excellence, cost optimization, and zero-defect SLA logistics across large-scale distribution ecosystems.”',
            portfolioLink: '/anant-chaudhary',
            portfolioText: 'View Anant Chaudhary Supply Chain Portfolio'
        },
        {
            id: 'arun',
            name: 'Arun Chaudhary',
            role: 'Government Teacher — Department of Education',
            roleBadge: 'GOVERNMENT TEACHER • EDUCATION',
            badgeColor: '#06b6d4',
            icon: GraduationCap,
            desc: 'Dedicated Government Teacher in the Department of Education, committed to academic excellence, student mentorship, pedagogy, and shaping young minds to build a stronger educational foundation for society.',
            expertise: ['Public Education', 'Academic Mentorship', 'Pedagogy & Teaching', 'Youth Empowerment', 'Community Development'],
            quote: '“Education is the greatest catalyst for societal progress, empowering minds and shaping the character of future generations.”'
        }
    ];

    return (
        <div className="cs-master-container animate-fade-in">
            {/* Ambient Background Glow Mesh */}
            <div className="cs-ambient-mesh">
                <div className="cs-orb cs-orb-orange"></div>
                <div className="cs-orb cs-orb-amber"></div>
                <div className="cs-grid-overlay"></div>
            </div>

            {/* =========================================================================
                HERO SECTION
                ========================================================================= */}
            <section className="cs-hero-section">
                <div className="cs-hero-shell">
                    {/* Status Pill */}
                    <div className="cs-status-pill">
                        <span className="cs-live-dot"></span>
                        <span>CS CORPORATION • CHAUDHARY &amp; SONS • cscorp.in</span>
                        <span className="cs-status-sep">•</span>
                        <span>EST. 2020</span>
                    </div>

                    {/* Giant Headline */}
                    <h1 className="cs-hero-title">
                        CHAUDHARY <span className="cs-ampersand">&amp;</span> SONS
                    </h1>

                    {/* Dynamic Typewriter Badge */}
                    <div className="cs-dynamic-typewriter">
                        <span className="cs-typewriter-prefix">&gt; </span>
                        <span className="cs-typewriter-text">{currentText}</span>
                        <span className="cs-cursor-blink">|</span>
                    </div>

                    {/* Clean Dignified Parent Subtitle */}
                    <p className="cs-hero-subtitle">
                        The foundational parent enterprise (<strong>cscorp.in</strong>) uniting family heritage, public service, enterprise EAM architecture, supply chain distribution, and next-generation technical knowledge platforms.
                    </p>

                    {/* Action CTA Cluster */}
                    <div className="cs-hero-cta-cluster">
                        <a href="#platforms" className="cs-btn cs-btn-primary">
                            <Layers size={18} />
                            <span>Explore Platforms</span>
                            <ArrowRight size={16} />
                        </a>
                        <a href="#leadership" className="cs-btn cs-btn-secondary">
                            <Users size={18} />
                            <span>Family &amp; Leadership</span>
                        </a>
                        <a href="#contact" className="cs-btn cs-btn-glass">
                            <Mail size={18} />
                            <span>Direct Inquiries</span>
                        </a>
                    </div>

                    {/* Trust Badges Strip */}
                    <div className="cs-trust-strip">
                        <span className="cs-trust-item"><CheckCircle2 size={16} color="#f97316" /> Generational Values &amp; Public Service</span>
                        <span className="cs-trust-item"><CheckCircle2 size={16} color="#f97316" /> Multi-Domain Professional Mastery</span>
                        <span className="cs-trust-item"><CheckCircle2 size={16} color="#f97316" /> 4 Flagship Digital Ecosystems</span>
                        <span className="cs-trust-item"><CheckCircle2 size={16} color="#f97316" /> Family Heritage &amp; Integrity</span>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 1: 4 FLAGSHIP DIGITAL PLATFORMS
                ========================================================================= */}
            <section id="platforms" className="cs-section-spacer">
                <div className="cs-section-head">
                    <div className="cs-badge-pill orange">DIGITAL ECOSYSTEM</div>
                    <h2 className="cs-section-heading">Flagship Chaudhary Platforms</h2>
                    <p className="cs-section-subheading">
                        Independent, purpose-built platforms providing enterprise consulting, knowledge bases, technical publications, and professional training.
                    </p>
                </div>

                <div className="cs-platforms-grid">
                    {platforms.map((p) => (
                        <div key={p.id} className="cs-platform-card">
                            <div className="cs-card-top-row">
                                <span className="cs-platform-badge" style={{ color: p.badgeColor, borderColor: p.badgeColor }}>
                                    {p.badge}
                                </span>
                                {p.link.startsWith('#') ? (
                                    <a href={p.link} className="cs-visit-btn">
                                        <span>{p.actionText}</span>
                                        <ArrowRight size={14} />
                                    </a>
                                ) : (
                                    <Link to={p.link} className="cs-visit-btn">
                                        <span>{p.actionText}</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>

                            <h3 className="cs-platform-title">{p.title}</h3>
                            <p className="cs-platform-tagline">{p.tagline}</p>
                            <p className="cs-platform-desc">{p.desc}</p>

                            <div className="cs-platform-stats-row">
                                {p.stats.map((st, sIdx) => (
                                    <span key={sIdx} className="cs-stat-chip">
                                        <Star size={12} color="#f97316" /> {st}
                                    </span>
                                ))}
                            </div>

                            <div className="cs-platform-tags">
                                {p.tags.map((t, tIdx) => (
                                    <span key={tIdx} className="cs-tag-pill">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================================
                SECTION 2: FAMILY LEADERSHIP & PILLARS
                ========================================================================= */}
            <section id="leadership" className="cs-section-spacer">
                <div className="cs-section-head">
                    <div className="cs-badge-pill orange">HERITAGE &amp; LEADERSHIP</div>
                    <h2 className="cs-section-heading">Shyamdev Chaudhary &amp; His Sons</h2>
                    <p className="cs-section-subheading">
                        Founded on public service, integrity, and generational dedication, spanning enterprise technology, supply chain leadership, and education.
                    </p>
                </div>

                <div className="cs-leadership-grid">
                    {leadership.map((member) => {
                        const IconComp = member.icon || Users;
                        return (
                            <div key={member.id} className={`cs-leader-card ${member.id === 'shyamdev' ? 'patriarch-card' : ''}`}>
                                <div className="cs-leader-header">
                                    <div className="cs-leader-avatar-box">
                                        <IconComp size={26} color="#f97316" />
                                    </div>
                                    <div>
                                        <span className="cs-leader-badge" style={{ color: member.badgeColor }}>
                                            {member.roleBadge}
                                        </span>
                                        <h3 className="cs-leader-name">{member.name}</h3>
                                        <span className="cs-leader-role">{member.role}</span>
                                    </div>
                                </div>

                                <p className="cs-leader-desc">{member.desc}</p>

                                <blockquote className="cs-leader-quote">
                                    {member.quote}
                                </blockquote>

                                <div className="cs-expertise-cluster">
                                    <span className="cs-expertise-head">PILLARS &amp; DOMAINS:</span>
                                    <div className="cs-expertise-tags">
                                        {member.expertise.map((exp, eIdx) => (
                                            <span key={eIdx} className="cs-exp-pill">{exp}</span>
                                        ))}
                                    </div>
                                </div>

                                {member.portfolioLink && (
                                    <Link to={member.portfolioLink} className="cs-portfolio-link">
                                        <span>{member.portfolioText}</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* =========================================================================
                SECTION 3: GUIDING FAMILY VALUES
                ========================================================================= */}
            <section className="cs-section-spacer">
                <div className="cs-section-head">
                    <div className="cs-badge-pill orange">FOUNDATIONAL PRINCIPLES</div>
                    <h2 className="cs-section-heading">Our Guiding Values</h2>
                </div>

                <div className="cs-values-grid">
                    <div className="cs-val-card">
                        <div className="cs-val-icon"><Shield size={24} color="#f97316" /></div>
                        <h3>Integrity &amp; Public Trust</h3>
                        <p>Upholding the highest standards of honesty, ethical governance, and dedication across all public service and professional endeavors.</p>
                    </div>
                    <div className="cs-val-card">
                        <div className="cs-val-icon"><BookOpen size={24} color="#f97316" /></div>
                        <h3>Knowledge &amp; Education</h3>
                        <p>Committed to knowledge sharing, academic enablement, and professional mentorship that uplifts communities and empowers learners.</p>
                    </div>
                    <div className="cs-val-card">
                        <div className="cs-val-icon"><Award size={24} color="#f97316" /></div>
                        <h3>Generational Heritage</h3>
                        <p>Rooted in the wisdom and discipline established by Shyamdev Chaudhary, inspiring ongoing excellence and dedication across generations.</p>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 4: CONTACT & INQUIRIES
                ========================================================================= */}
            <section id="contact" className="cs-section-spacer">
                <div className="cs-contact-card">
                    <div className="cs-contact-left">
                        <div className="cs-badge-pill orange">CONNECT WITH US</div>
                        <h2>Get in Touch with Chaudhary &amp; Sons</h2>
                        <p>For general inquiries, strategic collaborations, educational initiatives, or platform partnerships, reach out directly.</p>

                        <div className="cs-contact-methods">
                            <div className="cs-contact-item">
                                <Mail size={20} color="#f97316" />
                                <div>
                                    <small>PRIMARY CONTACT EMAIL</small>
                                    <strong>admin@cscorp.in</strong>
                                </div>
                                <button className="cs-copy-btn" onClick={copyEmail}>
                                    {copiedEmail ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="cs-contact-item">
                                <Phone size={20} color="#f97316" />
                                <div>
                                    <small>LOCATION &amp; PRESENCE</small>
                                    <strong>India • Open to Global &amp; Institutional Collaborations</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="cs-contact-form" onSubmit={handleFormSubmit}>
                        <div className="cs-form-row">
                            <div className="cs-form-field">
                                <label>Your Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Rahul Sharma"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                />
                            </div>
                            <div className="cs-form-field">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="you@company.com"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="cs-form-field">
                            <label>Inquiry Subject</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. Collaboration / Platform Inquiry / General Connect"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            />
                        </div>
                        <div className="cs-form-field">
                            <label>Message</label>
                            <textarea 
                                rows={4} 
                                required 
                                placeholder="Write your message or inquiry here..."
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="cs-submit-btn" disabled={contactStatus === 'submitting'}>
                            <Send size={16} />
                            <span>{contactStatus === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                        </button>
                        {contactStatus === 'success' && (
                            <p className="cs-form-success">Thank you! Your message has been sent successfully.</p>
                        )}
                    </form>
                </div>
            </section>
        </div>
    );
};

export default ChaudharySons;
