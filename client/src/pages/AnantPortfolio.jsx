import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Truck, Package, Layers, ShieldCheck, Award, GraduationCap, 
    Briefcase, Mail, Phone, MapPin, CheckCircle2, ChevronRight, 
    TrendingUp, BarChart3, Users, Clock, ArrowRight, ExternalLink, 
    Copy, Check, FileText, Download, Building, Star
} from 'lucide-react';
import API_BASE_URL from '../config';
import './AnantPortfolio.css';

const AnantPortfolio = () => {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [activeTab, setActiveTab] = useState('delhivery');
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactStatus, setContactStatus] = useState(null);

    // Typewriter Rotating Roles for Anant
    const roles = [
        "Senior Manager @ Delhivery Limited",
        "Supply Chain & 3PL Logistics Leader",
        "PGDM in Supply Chain • IMT Ghaziabad",
        "80k+ Sq. Ft. Multi-FC Operations Specialist",
        "E-Commerce Fulfillment & WMS Systems"
    ];
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(75);

    useEffect(() => {
        const fullText = roles[currentRoleIndex];
        const handleTyping = () => {
            if (!isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                setTypingSpeed(65);
                if (currentText === fullText) {
                    setTimeout(() => setIsDeleting(true), 2200);
                }
            } else {
                setCurrentText(fullText.substring(0, currentText.length - 1));
                setTypingSpeed(35);
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
        navigator.clipboard.writeText("Bkanant5@gmail.com");
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    const copyPhone = () => {
        navigator.clipboard.writeText("+918851179617");
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
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
                    subject: `[Anant Supply Chain Portfolio] ${contactForm.subject}`
                })
            });
            if (response.ok) {
                setContactStatus('success');
                setContactForm({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setContactStatus(null), 3500);
            } else {
                setContactStatus('error');
            }
        } catch (err) {
            setContactStatus('error');
        }
    };

    // Metric Stats
    const metrics = [
        { label: 'Supply Chain Mastery', value: '8+ Years', sub: '3PL, Retail & E-Commerce' },
        { label: 'Fulfillment Center Scale', value: '80,000+ sq.ft', sub: 'Multiple FCs Managed' },
        { label: 'Inventory SKU Depth', value: '20,000+ SKUs', sub: 'High-Density Catalog' },
        { label: 'Performance Rating', value: 'A+ Rated', sub: 'Consecutive 2018–2023' }
    ];

    // Core Competencies
    const competencies = [
        'Supply Chain Strategy', 'Logistics Optimization', 'Inventory Control & Audits',
        '3PL Operations', 'WMS / TMS Software', 'Process Improvement (CIP / 5S)',
        'E-Commerce Fulfillment (JIT/PPMP)', 'Vendor & Fleet Management',
        'Cost Reduction & RCA', 'Team Leadership & Safety'
    ];

    // Enterprise Clients Managed
    const enterpriseClients = [
        'Volvo Eicher', 'Voltas', 'Hitachi', 'Mahindra & Mahindra (M&M)',
        'Jubilant FoodWorks (JFL)', 'Marks & Spencer', 'Reliance Retail',
        'Myntra', 'Amazon Marketplace', 'AJIO', 'Nykaa', 'TIRA', 'Discover Pilgrim', 'Mylo'
    ];

    return (
        <div className="ap-master-container animate-fade-in">
            {/* Ambient Lighting Mesh */}
            <div className="ap-ambient-mesh">
                <div className="ap-orb ap-orb-orange"></div>
                <div className="ap-orb ap-orb-emerald"></div>
                <div className="ap-grid-overlay"></div>
            </div>

            {/* =========================================================================
                HERO SECTION
                ========================================================================= */}
            <section className="ap-hero-section">
                <div className="ap-hero-shell">
                    {/* Status Pill */}
                    <div className="ap-status-pill">
                        <span className="ap-live-dot"></span>
                        <span>SENIOR MANAGER • SUPPLY CHAIN &amp; LOGISTICS</span>
                        <span className="ap-status-sep">•</span>
                        <span>DELHIVERY LIMITED</span>
                    </div>

                    {/* Brand Subtitle & Family Signature (Above ANANT CHAUDHARY) */}
                    <div className="ap-brand-subtitle">
                        <span className="ap-brand-flank-line left"></span>
                        <div className="ap-brand-title-badge">
                            <span className="ap-brand-title-text">
                                CHAUDHARY <span className="ap-brand-ampersand">&amp;</span> SONS
                            </span>
                        </div>
                        <span className="ap-brand-flank-line right"></span>
                    </div>

                    {/* Headline with Dual-Tone Continuous Shining */}
                    <h1 className="ap-hero-title">
                        <span className="ap-firstname">ANANT</span>
                        <span className="ap-surname">CHAUDHARY</span>
                    </h1>

                    {/* Dynamic Typewriter Role */}
                    <div className="ap-dynamic-typewriter">
                        <span className="ap-typewriter-prefix">&gt;&nbsp;</span>
                        <span className="ap-typewriter-text">{currentText}</span>
                        <span className="ap-cursor-blink">|</span>
                    </div>

                    {/* Role & Tagline */}
                    <p className="ap-hero-lead">
                        Results-driven <strong>Supply Chain &amp; 3PL Warehousing Leader</strong> with <strong>8+ years</strong> of comprehensive operational mastery across large-scale fulfillment centers, multi-client logistics, and e-commerce distribution.
                    </p>

                    {/* Hero Direct Action CTA Cluster */}
                    <div className="ap-hero-cta-cluster">
                        <a href="#experience" className="ap-cta-btn ap-cta-primary">
                            <Briefcase size={18} />
                            <span>Explore Experience</span>
                            <ArrowRight size={16} />
                        </a>
                        <a href="#contact" className="ap-cta-btn ap-cta-secondary">
                            <Mail size={18} color="#ea580c" />
                            <span>Connect &amp; Inquire</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* Quick Contact & Info Strip */}
                    <div className="ap-contact-pills-row">
                        <div className="ap-info-chip">
                            <MapPin size={14} color="#ea580c" />
                            <span>Lucknow / NCR, India</span>
                        </div>
                        <button className="ap-info-chip interactive" onClick={copyEmail} type="button" aria-label="Copy Email">
                            <Mail size={14} color="#ea580c" />
                            <span>Bkanant5@gmail.com</span>
                            {copiedEmail ? <Check size={14} color="#10b981" /> : <Copy size={13} />}
                        </button>
                        <button className="ap-info-chip interactive" onClick={copyPhone} type="button" aria-label="Copy Phone">
                            <Phone size={14} color="#ea580c" />
                            <span>+91 8851179617</span>
                            {copiedPhone ? <Check size={14} color="#10b981" /> : <Copy size={13} />}
                        </button>
                    </div>

                    {/* 4 Quantitative Metric Cards in 2x2 (Mobile) / 4-Col (Desktop) */}
                    <div className="ap-metrics-grid">
                        {metrics.map((m, idx) => (
                            <div key={idx} className="ap-metric-card">
                                <span className="ap-metric-val">{m.value}</span>
                                <strong className="ap-metric-lbl">{m.label}</strong>
                                <small className="ap-metric-sub">{m.sub}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 1: CLIENTS & ECOSYSTEM SERVED
                ========================================================================= */}
            <section className="ap-section-spacer">
                <div className="ap-section-head">
                    <div className="ap-badge-pill">ENTERPRISE CLIENT PORTFOLIO</div>
                    <h2 className="ap-section-heading">Trusted by Industry Titans</h2>
                    <p className="ap-section-sub">Orchestrating logistics, warehouse distribution, and supply chain operations for marquee enterprise brands.</p>
                </div>

                <div className="ap-clients-marquee">
                    {enterpriseClients.map((client, cIdx) => (
                        <div key={cIdx} className="ap-client-pill">
                            <CheckCircle2 size={14} color="#ea580c" />
                            <span>{client}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================================================
                SECTION 2: CAREER TIMELINE & PROGRESSIVE LEADERSHIP
                ========================================================================= */}
            <section id="experience" className="ap-section-spacer">
                <div className="ap-section-head">
                    <div className="ap-badge-pill">8+ YEARS PROFESSIONAL JOURNEY</div>
                    <h2 className="ap-section-heading">Career Timeline &amp; Experience</h2>
                    <p className="ap-section-sub">Proven track record of high-impact leadership across Tier-1 logistics organizations.</p>
                </div>

                {/* Company Tabs (3-Column Equal Grid on Mobile & Desktop) */}
                <div className="ap-exp-tabs-nav">
                    <button 
                        type="button"
                        className={`ap-exp-tab-btn ${activeTab === 'delhivery' ? 'active' : ''}`}
                        onClick={() => setActiveTab('delhivery')}
                        aria-label="View Delhivery Limited experience"
                    >
                        <Building size={16} className="ap-tab-icon" />
                        <span className="ap-tab-label-full">Delhivery Limited</span>
                        <span className="ap-tab-label-short">Delhivery</span>
                        <small className="ap-tab-period">2025–Pres</small>
                    </button>
                    <button 
                        type="button"
                        className={`ap-exp-tab-btn ${activeTab === 'citykart' ? 'active' : ''}`}
                        onClick={() => setActiveTab('citykart')}
                        aria-label="View Citykart Venture experience"
                    >
                        <Truck size={16} className="ap-tab-icon" />
                        <span className="ap-tab-label-full">Citykart Venture</span>
                        <span className="ap-tab-label-short">Citykart</span>
                        <small className="ap-tab-period">2024–2025</small>
                    </button>
                    <button 
                        type="button"
                        className={`ap-exp-tab-btn ${activeTab === 'reliance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reliance')}
                        aria-label="View Reliance Retail experience"
                    >
                        <Package size={16} className="ap-tab-icon" />
                        <span className="ap-tab-label-full">Reliance Retail (6.5 Yrs)</span>
                        <span className="ap-tab-label-short">Reliance</span>
                        <small className="ap-tab-period">2017–2024</small>
                    </button>
                </div>

                {/* Tab Content Canvas */}
                <div className="ap-exp-content-stage">
                    {activeTab === 'delhivery' && (
                        <div className="ap-exp-card animate-fade-in">
                            <div className="ap-exp-header">
                                <div className="ap-exp-head-main">
                                    <span className="ap-role-badge">CURRENT LEADERSHIP ROLE</span>
                                    <h3 className="ap-exp-title">Senior Manager</h3>
                                    <span className="ap-exp-company">Delhivery Limited • Supply Chain &amp; 3PL Operations</span>
                                </div>
                                <span className="ap-exp-dates">Apr 2025 – Present</span>
                            </div>

                            <ul className="ap-exp-bullets">
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Multi-Fulfillment Center Oversight:</strong> Managing multiple FCs averaging 80,000+ sq. ft. each with over 20,000+ SKUs across marquee accounts including Volvo Eicher, Voltas, Hitachi, Mahindra &amp; Mahindra (M&M), Jubilant FoodWorks (JFL), Discover Pilgrim, and Mylo.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Transportation &amp; Logistics Planning:</strong> Leading comprehensive logistics routing, multi-stakeholder synchronization, and carrier capacity planning.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Metric &amp; KPI Adherence (100% SLA):</strong> Tracking end-to-end performance metrics with comprehensive Root Cause Analysis (RCA) on deviations.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Cost Optimization &amp; Lean Productivity:</strong> Monitoring Load vs. Resource modeling, eliminating waste time &amp; motion, controlling overtime (OT), daily operating expenses, and R&amp;M budgets.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Inventory Accuracy &amp; Zero-Debit Audits:</strong> Spearheading rigorous inventory control using Cycle Counts, Daily FTP fail &amp; Put audits, Quarterly Wall-to-Wall (W2W) Audits, and 5S Bin Hygiene.</div>
                                </li>
                            </ul>
                        </div>
                    )}

                    {activeTab === 'citykart' && (
                        <div className="ap-exp-card animate-fade-in">
                            <div className="ap-exp-header">
                                <div className="ap-exp-head-main">
                                    <span className="ap-role-badge">WAREHOUSE LEADERSHIP</span>
                                    <h3 className="ap-exp-title">Warehouse Manager</h3>
                                    <span className="ap-exp-company">Citykart Venture Private Limited • Logistics Division</span>
                                </div>
                                <span className="ap-exp-dates">Feb 2024 – Apr 2025</span>
                            </div>

                            <ul className="ap-exp-bullets">
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>End-to-End Logistics Governance:</strong> Directed freight payment clearances, onboarding premier transport partners, vehicle regulatory compliance, and dispute resolution.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Loss Prevention &amp; Safety Compliance:</strong> Spearheaded scrap management, administrative oversight for the Loss Prevention team, and fire, health &amp; safety inspections.</div>
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="ap-bullet-icon" />
                                    <div><strong>Strategic MIS &amp; Performance Reporting:</strong> Crafted executive KPI dashboards capturing productivity, workflow velocity, and operational SLA tracking.</div>
                                </li>
                            </ul>
                        </div>
                    )}

                    {activeTab === 'reliance' && (
                        <div className="ap-exp-card animate-fade-in">
                            <div className="ap-exp-header">
                                <div className="ap-exp-head-main">
                                    <span className="ap-role-badge">RAPID 6.5-YEAR PROMOTION TRACK</span>
                                    <h3 className="ap-exp-title">Manager ➔ Deputy Manager ➔ Assistant Manager</h3>
                                    <span className="ap-exp-company">Reliance Retail Limited • Supply Chain &amp; E-Commerce</span>
                                </div>
                                <span className="ap-exp-dates">Sep 2017 – Feb 2024</span>
                            </div>

                            <div className="ap-progression-tree">
                                <div className="ap-prog-step">
                                    <div className="ap-prog-badge">1</div>
                                    <div className="ap-prog-content">
                                        <div className="ap-step-head">
                                            <h4>Manager (Apr 2023 – Feb 2024)</h4>
                                            <span className="ap-step-tag">Outbound, Transport &amp; E-Commerce</span>
                                        </div>
                                        <p>Directed warehouse operations, cost control, 5S practices, damage mitigation, and led the PPMP module for Myntra, Nykaa, Zivame, TIRA, and Amazon JIT marketplace.</p>
                                    </div>
                                </div>

                                <div className="ap-prog-step">
                                    <div className="ap-prog-badge">2</div>
                                    <div className="ap-prog-content">
                                        <div className="ap-step-head">
                                            <h4>Deputy Manager (Oct 2021 – Mar 2023)</h4>
                                            <span className="ap-step-tag">Marketplace Returns &amp; Lean CIP</span>
                                        </div>
                                        <p>Orchestrated end-to-end returns across Myntra, Amazon, Flipkart, B2C M&amp;S, and Retail. Pioneered Continuous Improvement Projects (CIP) for space optimization, FIFO, and physical inventory reconciliations.</p>
                                    </div>
                                </div>

                                <div className="ap-prog-step">
                                    <div className="ap-prog-badge">3</div>
                                    <div className="ap-prog-content">
                                        <div className="ap-step-head">
                                            <h4>E-Commerce Assistant Manager (Mar 2020 – Sep 2021)</h4>
                                            <span className="ap-step-tag">Marksandspencer.in Launch</span>
                                        </div>
                                        <p>Forefronted B2C operations for <strong>Marksandspencer.in</strong> online business launch. Managed Myntra, AJIO, Amazon, Flipkart, and Project EVE with 100% order fulfillment.</p>
                                    </div>
                                </div>

                                <div className="ap-prog-step">
                                    <div className="ap-prog-badge">4</div>
                                    <div className="ap-prog-content">
                                        <div className="ap-step-head">
                                            <h4>Transport Assistant Manager &amp; GET (Sep 2017 – Feb 2020)</h4>
                                            <span className="ap-step-tag">Dispatch Planning &amp; PAN-India E-Waybill</span>
                                        </div>
                                        <p>Managed loading/dispatch operations, daily MIS reporting, PAN India E-waybill compliance, warehouse relocation, vehicle rotation, and picker motion optimization.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* =========================================================================
                SECTION 3: CORE COMPETENCIES & TECHNICAL TOOLKIT
                ========================================================================= */}
            <section className="ap-section-spacer">
                <div className="ap-skills-grid">
                    {/* Left: Core Competencies */}
                    <div className="ap-skills-col">
                        <div className="ap-badge-pill">DOMAIN MASTERY</div>
                        <h3 className="ap-col-heading">Core Competencies</h3>
                        <div className="ap-competency-tags">
                            {competencies.map((comp, cIdx) => (
                                <span key={cIdx} className="ap-comp-tag">
                                    <CheckCircle2 size={14} color="#ea580c" />
                                    <span>{comp}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Technical Systems & Software */}
                    <div className="ap-skills-col">
                        <div className="ap-badge-pill">DIGITAL &amp; WMS TOOLS</div>
                        <h3 className="ap-col-heading">Systems &amp; Software</h3>
                        <div className="ap-tools-list">
                            <div className="ap-tool-item">
                                <Package size={18} color="#ea580c" />
                                <div>
                                    <strong>Warehouse Management Systems (WMS)</strong>
                                    <small>Inbound/Outbound, Put-away, Bin Hygiene, Cycle Count Audits</small>
                                </div>
                            </div>
                            <div className="ap-tool-item">
                                <Truck size={18} color="#ea580c" />
                                <div>
                                    <strong>Transportation Management Systems (TMS)</strong>
                                    <small>Route Optimization, Freight Negotiations, PAN-India E-Waybill</small>
                                </div>
                            </div>
                            <div className="ap-tool-item">
                                <BarChart3 size={18} color="#ea580c" />
                                <div>
                                    <strong>Data Analytics &amp; Advanced Excel</strong>
                                    <small>MTD/YTD MIS Reporting, Load vs Resource Modeling, Forecasting</small>
                                </div>
                            </div>
                            <div className="ap-tool-item">
                                <ShieldCheck size={18} color="#ea580c" />
                                <div>
                                    <strong>Quality Control &amp; Lean 5S Systems</strong>
                                    <small>Continuous Improvement (CIP), RCA on TAT Breaches, Zero Debit</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 4: EDUCATION & HONORS
                ========================================================================= */}
            <section className="ap-section-spacer">
                <div className="ap-edu-awards-grid">
                    {/* Education */}
                    <div className="ap-edu-card">
                        <div className="ap-edu-icon"><GraduationCap size={26} color="#ea580c" /></div>
                        <div>
                            <span className="ap-edu-level">POST GRADUATE DIPLOMA</span>
                            <h3 className="ap-edu-title">PGDM in Supply Chain Management</h3>
                            <p className="ap-edu-inst">IMT, Ghaziabad • 2020 – 2022</p>
                        </div>
                    </div>

                    <div className="ap-edu-card">
                        <div className="ap-edu-icon"><GraduationCap size={26} color="#ea580c" /></div>
                        <div>
                            <span className="ap-edu-level">BACHELOR OF TECHNOLOGY</span>
                            <h3 className="ap-edu-title">B.Tech in Mechanical Engineering</h3>
                            <p className="ap-edu-inst">G. L. Bajaj Institute of Technology &amp; Management • 2013 – 2017</p>
                        </div>
                    </div>

                    {/* Key Honors Card */}
                    <div className="ap-awards-card">
                        <div className="ap-award-item">
                            <Award size={22} color="#ea580c" />
                            <div>
                                <strong>Best Performer of the Year (2023)</strong>
                                <small>Recognized for exceptional operational excellence and zero-defect SLA execution.</small>
                            </div>
                        </div>
                        <div className="ap-award-item">
                            <Star size={22} color="#ea580c" />
                            <div>
                                <strong>Sustained A+ Performance Rating (2018–2023)</strong>
                                <small>Consistent top-tier evaluations across 6 consecutive years.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 5: CONTACT & CONNECT
                ========================================================================= */}
            <section id="contact" className="ap-section-spacer">
                <div className="ap-contact-card">
                    <div className="ap-contact-left">
                        <div className="ap-badge-pill">PROFESSIONAL COLLABORATION</div>
                        <h2>Get in Touch with Anant Chaudhary</h2>
                        <p>Available for senior supply chain leadership discussions, warehouse optimization consulting, and enterprise logistics opportunities.</p>

                        <div className="ap-contact-methods">
                            <div className="ap-contact-box">
                                <Mail size={20} color="#ea580c" />
                                <div>
                                    <small>OFFICIAL EMAIL</small>
                                    <strong>Bkanant5@gmail.com</strong>
                                </div>
                                <button className="ap-copy-btn" onClick={copyEmail}>
                                    {copiedEmail ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="ap-contact-box">
                                <Phone size={20} color="#ea580c" />
                                <div>
                                    <small>MOBILE PHONE</small>
                                    <strong>+91 8851179617</strong>
                                </div>
                                <button className="ap-copy-btn" onClick={copyPhone}>
                                    {copiedPhone ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Navigation back to ecosystem */}
                        <div className="ap-ecosystem-links">
                            <Link to="/" className="ap-eco-btn">
                                <span>Chaudhary &amp; Sons Enterprise</span>
                                <ArrowRight size={14} />
                            </Link>
                            <Link to="/ankit-chaudhary" className="ap-eco-btn">
                                <span>Ankit Chaudhary (EAM Architect)</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <form className="ap-contact-form" onSubmit={handleFormSubmit}>
                        <div className="ap-form-field">
                            <label>Your Name</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. Rahul Sharma"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            />
                        </div>
                        <div className="ap-form-field">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                placeholder="you@company.com"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            />
                        </div>
                        <div className="ap-form-field">
                            <label>Subject</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Supply Chain Operations / Leadership Opportunity"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            />
                        </div>
                        <div className="ap-form-field">
                            <label>Message</label>
                            <textarea 
                                rows={4} 
                                required 
                                placeholder="Describe the operational opportunity, warehouse requirements, or inquiry..."
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="ap-submit-btn" disabled={contactStatus === 'submitting'}>
                            <span>{contactStatus === 'submitting' ? 'Sending...' : 'Send Direct Message'}</span>
                            <ArrowRight size={16} />
                        </button>
                        {contactStatus === 'success' && (
                            <p className="ap-form-success">Message sent successfully! Anant will respond promptly.</p>
                        )}
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AnantPortfolio;
