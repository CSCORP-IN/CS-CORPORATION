import API_BASE_URL from '../config';
import React, { useState, useMemo, useEffect } from 'react';
import { 
    GraduationCap, CheckCircle2, Clock, Sparkles, ArrowRight, 
    BookOpen, Layers, Database, Terminal, Shield, Server, 
    Check, HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, 
    Phone, Send, X, ExternalLink, Award, Users, Flame
} from 'lucide-react';
import './Courses.css';

const Courses = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openFaq, setOpenFaq] = useState(null);
    const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
    const [selectedCourseItem, setSelectedCourseItem] = useState({ title: 'Maximo Builder Bundle', type: 'combo' });
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitStatus, setSubmitStatus] = useState(null); // 'submitting' | 'success' | 'error'

    // Typewriter Rotating Taglines for Courses
    const courseTickers = [
        "100% Live Hands-On Maximo Mentorship",
        "Individual Modules Starting from ₹1,999",
        "Enterprise MIF Integrations & Automation Scripts",
        "Save up to ₹3,000 on Bundled Power Packs"
    ];
    const [tickerIndex, setTickerIndex] = useState(0);
    const [tickerText, setTickerText] = useState('');
    const [isDeletingTicker, setIsDeletingTicker] = useState(false);
    const [tickerSpeed, setTickerSpeed] = useState(80);

    useEffect(() => {
        const full = courseTickers[tickerIndex];
        const handleType = () => {
            if (!isDeletingTicker) {
                setTickerText(full.substring(0, tickerText.length + 1));
                setTickerSpeed(70);
                if (tickerText === full) {
                    setTimeout(() => setIsDeletingTicker(true), 2000);
                }
            } else {
                setTickerText(full.substring(0, tickerText.length - 1));
                setTickerSpeed(35);
                if (tickerText === '') {
                    setIsDeletingTicker(false);
                    setTickerIndex((prev) => (prev + 1) % courseTickers.length);
                }
            }
        };
        const timer = setTimeout(handleType, tickerSpeed);
        return () => clearTimeout(timer);
    }, [tickerText, isDeletingTicker, tickerIndex, tickerSpeed]);

    const modules = [
        {
            id: 1,
            num: "01",
            category: "Foundations",
            title: "Database Configuration",
            desc: "Objects, attributes, relationships, database configuration fundamentals and live validations.",
            price: "₹4,999",
            topics: ["MBO Objects & Tables", "Attributes & Data Types", "Relationship Queries", "Database Config Live Changes"]
        },
        {
            id: 2,
            num: "02",
            category: "Customization",
            title: "Application Designer",
            desc: "Build intuitive UI screens, dynamic conditional properties, custom tabs, and streamlined navigation.",
            price: "₹2,999",
            topics: ["UI Components & Controls", "Conditional UI Rules", "Custom Dialogs & Menus", "Field Validations & Bindings"]
        },
        {
            id: 3,
            num: "03",
            category: "Foundations",
            title: "Domains & Value Control",
            desc: "Control permitted values, synonym domains, crossover domains, table domains, and dynamic lookups.",
            price: "₹1,999",
            topics: ["ALN & NUM Domains", "Synonym Domain Logic", "Crossover Auto-Populate", "Table Domain Lookups"]
        },
        {
            id: 4,
            num: "04",
            category: "Process & Workflow",
            title: "Workflows & Approvals",
            desc: "Automate complex business routing, condition nodes, action groups, role assignments, and escalations.",
            price: "₹3,999",
            topics: ["Workflow Process Canvas", "Condition & Interaction Nodes", "Role & Assignment Groups", "Sub-process Orchestration"]
        },
        {
            id: 5,
            num: "05",
            category: "Integration",
            title: "Integration Framework (MIF)",
            desc: "Master Object Structures, Enterprise Services, Publish Channels, REST APIs, and external ERP links.",
            price: "₹9,999",
            topics: ["Object Structures (OS)", "Publish Channels & Queues", "Enterprise Services & Endpoints", "REST API & JSON/XML"]
        },
        {
            id: 6,
            num: "06",
            category: "Administration",
            title: "Security Groups & Permissions",
            desc: "Implement role-based authorization, site-level restrictions, data security profiles, and access audits.",
            price: "₹1,999",
            topics: ["Security Profiles & Groups", "Conditional Data Restrictions", "Site & Org Authorizations", "Application Action Security"]
        },
        {
            id: 7,
            num: "07",
            category: "Automation",
            title: "Automation Scripts",
            desc: "Extend Maximo business logic with Jython/Python and JavaScript script points without Java compiling.",
            price: "₹4,999",
            topics: ["Attribute Launch Points", "Object Action Launch Points", "Script Variables & MboSet API", "Performance & Debugging"]
        },
        {
            id: 8,
            num: "08",
            category: "Automation",
            title: "Escalations & Cron Tasks",
            desc: "Trigger time-based automated checks, schedule recurring jobs, and send automated email alerts.",
            price: "₹2,999",
            topics: ["Escalation Points & Queries", "Action Groups & Alerts", "Custom Cron Task Setup", "Logging & Verification"]
        },
        {
            id: 9,
            num: "09",
            category: "Administration",
            title: "BIRT Reports & Analytics",
            desc: "Configure BIRT reports, Ad-hoc report templates, KPI dashboards, and automated result deliveries.",
            price: "₹8,999",
            topics: ["BIRT Architecture Basics", "SQL Data Set Queries", "Report Security & Schedulers", "KPI Manager Setup"]
        },
        {
            id: 10,
            num: "10",
            category: "Administration",
            title: "System Configuration & Admin",
            desc: "System properties, multi-org & multi-site hierarchy, logging levels, and enterprise instance tuning.",
            price: "₹3,999",
            topics: ["System Properties Manager", "Org & Site Architecture", "Logging & Debugging Mode", "Cache & Performance Tweaks"]
        }
    ];

    const combos = [
        {
            id: 'combo-1',
            badge: "Starter Path",
            title: "Configuration Essentials",
            tagline: "For learners building their core Maximo configuration base.",
            price: "₹9,200",
            originalPrice: "₹9,999",
            save: "Save ₹799",
            featured: false,
            items: [
                "01. Database Configuration (₹4,999)",
                "02. Application Designer (₹2,999)",
                "03. Domains & Data Controls (₹1,999)",
                "Hands-on Lab Exercises",
                "Live Q&A with Trainer"
            ]
        },
        {
            id: 'combo-2',
            badge: "Most Popular",
            title: "Maximo Builder Bundle",
            tagline: "A comprehensive pathway across setup, process workflows, and automation scripts.",
            price: "₹18,999",
            originalPrice: "₹20,999",
            save: "Save ₹2,000",
            featured: true,
            items: [
                "01. Database Configuration",
                "02. Application Designer",
                "03. Domains & Data Controls",
                "04. Workflows & Approvals",
                "06. Security Groups & Restrictions",
                "07. Automation Scripts",
                "1-on-1 Implementation Mentorship"
            ]
        },
        {
            id: 'combo-3',
            badge: "Advanced Tech",
            title: "Technical Power Pack",
            tagline: "For professionals and developers ready to master technical integrations and scripting.",
            price: "₹27,999",
            originalPrice: "₹30,999",
            save: "Save ₹3,000",
            featured: false,
            items: [
                "05. Integration Framework (MIF)",
                "07. Automation Scripts",
                "08. Escalations & Cron Tasks",
                "09. BIRT Reports & KPI Analytics",
                "10. System Configuration & Tuning",
                "Architecture Best Practices Guide"
            ]
        }
    ];

    const faqs = [
        {
            q: "Is this training live or pre-recorded?",
            a: "All sessions are 100% live and instructor-led. You can interact directly with the trainer, ask questions, debug configurations in real-time, and get practical walkthroughs of real enterprise implementations."
        },
        {
            q: "Does this program provide official IBM Certification?",
            a: "Important Notice: No. ChaudharyConnect provides practical, hands-on enterprise job training and engineering mentorship. We focus on real-world configurations, MIF architecture, and scripting. We do NOT provide official IBM vendor certifications."
        },
        {
            q: "Can I enroll in just one specific module?",
            a: "Yes! Individual modules start from ₹1,999 depending on your immediate job or project requirements, or you can choose a bundled combo pack to save on comprehensive learning tracks."
        },
        {
            q: "What are the session timings and batch sizes?",
            a: "Batches are kept small (typically 5-10 participants) to maintain personalized attention and interactive Q&A. Weekend and weekday evening slots are available to accommodate working professionals."
        },
        {
            q: "Will I receive practical assignments and reference notes?",
            a: "Yes. Every module includes practical assignment templates, configuration checklists, sample scripts, and architectural cheat sheets that you can immediately apply in your workplace."
        },
        {
            q: "How do I secure my seat and start?",
            a: "Click 'Enquire Module' or select your preferred bundle. Our team will share the upcoming batch schedule, payment options, and joining credentials directly with you via email/WhatsApp."
        }
    ];

    const categories = ['All', 'Foundations', 'Customization', 'Process & Workflow', 'Integration', 'Automation', 'Administration'];

    const filteredModules = useMemo(() => {
        if (selectedCategory === 'All') return modules;
        return modules.filter(m => m.category.toLowerCase() === selectedCategory.toLowerCase());
    }, [selectedCategory]);

    const handleOpenEnquiry = (itemTitle, itemType = 'module') => {
        setSelectedCourseItem({ title: itemTitle, type: itemType });
        setSubmitStatus(null);
        setEnquiryModalOpen(true);
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');
        try {
            const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    selectedItem: selectedCourseItem.title,
                    itemType: selectedCourseItem.type,
                    message: formData.message
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    setEnquiryModalOpen(false);
                    setFormData({ name: '', email: '', phone: '', message: '' });
                    setSubmitStatus(null);
                }, 2500);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Enquiry error:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <div className="courses-page-container animate-fade-in">
            {/* Ambient Lighting Orbs */}
            <div className="course-glow-top"></div>

            {/* Transparent Non-Certification Disclaimer Banner */}
            <div className="connect-disclaimer-notice">
                <div className="disclaimer-badge">TRAINING ONLY</div>
                <p>
                    <strong>Practical Hands-On Training Notice:</strong> This program provides real-world Maximo implementation skills, configuration labs, and engineering mentorship. It is strictly an enterprise training cohort and does <u>NOT</u> issue official IBM certifications.
                </p>
            </div>

            {/* Hero Section */}
            <section className="courses-hero">
                <div className="courses-hero-content">
                    <div className="hero-status-pill">
                        <div className="badge-pill emerald">
                            <span className="live-dot"></span> Live Batches Open for Enrollment
                        </div>
                    </div>

                    <h1 className="courses-hero-title">
                        Build Real <span className="text-gradient-cyan">IBM Maximo</span> <br />
                        <span className="text-gradient-primary">Enterprise Confidence.</span>
                    </h1>

                    {/* Dynamic Typewriter Badge */}
                    <div className="courses-dynamic-typewriter">
                        <span className="course-typewriter-prefix">&gt; </span>
                        <span className="course-typewriter-text">{tickerText}</span>
                        <span className="course-cursor-blink">|</span>
                    </div>

                    <p className="courses-hero-subtitle">
                        Live, instructor-led modular training designed by enterprise architects. Master configuration, MIF integration, automation scripting, and workflows with hands-on enterprise scenarios.
                    </p>

                    <div className="courses-hero-actions">
                        <a href="#combos" className="btn-primary">
                            <Flame size={18} /> View Value Bundles
                        </a>
                        <a href="#modules" className="btn-secondary">
                            <BookOpen size={18} /> Explore 10 Modules
                        </a>
                    </div>

                    <div className="courses-trust-strip">
                        <span className="trust-item"><CheckCircle2 size={16} color="#10b981" /> 100% Live Instructor-Led</span>
                        <span className="trust-item"><CheckCircle2 size={16} color="#10b981" /> Small Focused Batches</span>
                        <span className="trust-item"><CheckCircle2 size={16} color="#10b981" /> Hands-On Enterprise Labs</span>
                        <span className="trust-item"><CheckCircle2 size={16} color="#10b981" /> 1-on-1 Q&amp;A Mentorship</span>
                    </div>
                </div>

                {/* Hero Quick Pricing Badge */}
                <aside className="courses-hero-card">
                    <div className="hero-card-badge">
                        <Shield size={16} /> Hands-On Practical Cohort
                    </div>
                    <div className="hero-card-price">
                        <strong>From ₹1,999</strong>
                        <small>per individual module • Non-Certification</small>
                    </div>
                    <div className="hero-card-divider"></div>
                    <p className="hero-card-foot">Choose only what you need, or combine modules into bundles to save up to ₹3,000.</p>
                    <button 
                        className="btn-primary hero-card-btn"
                        onClick={() => handleOpenEnquiry('Maximo Live Training Consultation', 'custom')}
                    >
                        Enquire Schedule <ArrowRight size={16} />
                    </button>
                </aside>
            </section>

            {/* Feature USPs Grid */}
            <section className="courses-usps-section section-spacer">
                <div className="section-head">
                    <div className="badge-pill cyan">Practical Methodology</div>
                    <h2 className="section-heading">Learn Maximo By Doing, Not Just Watching</h2>
                    <p className="section-subheading">Every session is built around practical enterprise architecture logic and real project scenarios.</p>
                </div>

                <div className="usps-grid">
                    <div className="usp-card glass-card">
                        <div className="usp-icon-wrap cyan">
                            <Users size={22} />
                        </div>
                        <h3>Live Interactive Batches</h3>
                        <p>Ask questions in real time, debug live configuration errors, and receive immediate trainer feedback.</p>
                    </div>

                    <div className="usp-card glass-card">
                        <div className="usp-icon-wrap emerald">
                            <Terminal size={22} />
                        </div>
                        <h3>Real Enterprise Scenarios</h3>
                        <p>Learn configuration logic using real MRO, Defense, and Utility enterprise workflows.</p>
                    </div>

                    <div className="usp-card glass-card">
                        <div className="usp-icon-wrap primary">
                            <Layers size={22} />
                        </div>
                        <h3>Modular Learning Paths</h3>
                        <p>Pick only the exact modules relevant to your current project or career advancement goals.</p>
                    </div>

                    <div className="usp-card glass-card">
                        <div className="usp-icon-wrap amber">
                            <Shield size={22} />
                        </div>
                        <h3>Job-Ready Implementation</h3>
                        <p>Gain actionable confidence to configure, integrate, and support Maximo production environments.</p>
                    </div>
                </div>
            </section>

            {/* Curated Combo Offers */}
            <section className="combos-section section-spacer" id="combos">
                <div className="section-head">
                    <div className="badge-pill amber">Value Bundles</div>
                    <h2 className="section-heading">Curated Learning Combos</h2>
                    <p className="section-subheading">Accelerate your learning curve with connected skills and discounted pricing.</p>
                </div>

                <div className="combos-grid">
                    {combos.map((combo) => (
                        <div 
                            key={combo.id} 
                            className={`combo-card glass-card ${combo.featured ? 'featured-combo' : ''}`}
                        >
                            {combo.featured && (
                                <div className="featured-ribbon">
                                    <Sparkles size={13} /> Recommended Choice
                                </div>
                            )}

                            <div className="combo-top">
                                <span className={`combo-badge-pill ${combo.featured ? 'featured' : ''}`}>
                                    {combo.badge}
                                </span>
                                <h3 className="combo-title">{combo.title}</h3>
                                <p className="combo-tagline">{combo.tagline}</p>
                            </div>

                            <div className="combo-pricing">
                                <div className="price-row">
                                    <span className="current-price">{combo.price}</span>
                                    <span className="old-price">{combo.originalPrice}</span>
                                </div>
                                <span className="savings-badge">{combo.save}</span>
                            </div>

                            <div className="combo-items-list">
                                <h4>Included In This Bundle:</h4>
                                <ul>
                                    {combo.items.map((item, idx) => (
                                        <li key={idx}>
                                            <Check size={16} className="combo-check-icon" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button 
                                className={`combo-action-btn ${combo.featured ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleOpenEnquiry(combo.title, 'combo')}
                            >
                                Enroll in this Bundle <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 10-Module Catalog */}
            <section className="catalog-section section-spacer" id="modules">
                <div className="section-head">
                    <div className="badge-pill cyan">Modular Syllabus</div>
                    <h2 className="section-heading">Explore All 10 Maximo Modules</h2>
                    <p className="section-subheading">Enroll in individual focused modules tailored to your technical requirements.</p>
                </div>

                {/* Category Filter Chips */}
                <div className="catalog-filter-strip">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`catalog-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Modules Grid */}
                <div className="modules-grid">
                    {filteredModules.map((mod) => (
                        <div key={mod.id} className="module-item-card glass-card">
                            <div className="mod-card-header">
                                <span className="mod-track-num">{mod.num} / {mod.category}</span>
                                <span className="mod-price-pill">{mod.price}</span>
                            </div>

                            <h3 className="mod-title">{mod.title}</h3>
                            <p className="mod-description">{mod.desc}</p>

                            <div className="mod-topics-wrap">
                                <ul>
                                    {mod.topics.map((t, idx) => (
                                        <li key={idx}>
                                            <span className="topic-dot"></span>
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                className="mod-enquire-btn"
                                onClick={() => handleOpenEnquiry(mod.title, 'module')}
                            >
                                <span>Enquire Module</span>
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Training Format & Timeline */}
            <section className="format-section section-spacer">
                <div className="format-grid">
                    <div className="format-audience-col">
                        <div className="badge-pill">Who Is This For?</div>
                        <h2 className="format-heading">Engineered for Professionals Seeking Mastery</h2>
                        <div className="audience-points-list">
                            <div className="aud-point glass">
                                <span className="aud-arrow">→</span>
                                <div>
                                    <strong>Maximo Administrators & Support Engineers</strong>
                                    <p>Tackle real production support issues, configure security, and manage escalations.</p>
                                </div>
                            </div>
                            <div className="aud-point glass">
                                <span className="aud-arrow">→</span>
                                <div>
                                    <strong>Functional Consultants & Implementation Teams</strong>
                                    <p>Design complex workflow approvals, conditional UI rules, and database relationships.</p>
                                </div>
                            </div>
                            <div className="aud-point glass">
                                <span className="aud-arrow">→</span>
                                <div>
                                    <strong>Technical Developers & Java Specialists</strong>
                                    <p>Master MIF integrations, REST APIs, Automation Scripts, and performance tuning.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="format-roadmap-card glass-card">
                        <div className="badge-pill cyan">Learning Roadmap</div>
                        <h3>How The Training Works</h3>
                        <ol className="format-steps-timeline">
                            <li>
                                <div className="step-num">1</div>
                                <div className="step-content">
                                    <strong>Select Your Module or Combo</strong>
                                    <p>Pick the precise Maximo skills aligned with your immediate project objectives.</p>
                                </div>
                            </li>
                            <li>
                                <div className="step-num">2</div>
                                <div className="step-content">
                                    <strong>Join Live Interactive Online Batches</strong>
                                    <p>Learn step-by-step with practical screen shares, configuration labs, and architectural walkthroughs.</p>
                                </div>
                            </li>
                            <li>
                                <div className="step-num">3</div>
                                <div className="step-content">
                                    <strong>Apply on Real Tasks & 1-on-1 Q&A</strong>
                                    <p>Resolve blockers, ask implementation questions, and gain real-world confidence.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Accordion */}
            <section className="faq-section section-spacer">
                <div className="section-head">
                    <div className="badge-pill">Have Questions?</div>
                    <h2 className="section-heading">Frequently Asked Questions</h2>
                    <p className="section-subheading">Everything you need to know about batches, format, and enrollment.</p>
                </div>

                <div className="faq-accordion-wrap">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className={`faq-card glass-card ${isOpen ? 'open' : ''}`}>
                                <button 
                                    className="faq-question-btn"
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                >
                                    <span>{faq.q}</span>
                                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {isOpen && (
                                    <div className="faq-answer-body animate-fade-in">
                                        <p>{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Bottom Final CTA Strip */}
            <section className="courses-bottom-cta glass-card">
                <div className="cta-left">
                    <div className="badge-pill cyan">Ready When You Are</div>
                    <h2>Start Your IBM Maximo Journey Today</h2>
                    <p>Contact us to check the next available batch schedule, group discounts, or custom curriculum queries.</p>
                </div>
                <div className="cta-right">
                    <button 
                        className="btn-primary cta-main-btn"
                        onClick={() => handleOpenEnquiry('General Maximo Training Enquiry', 'custom')}
                    >
                        <MessageSquare size={18} /> Reserve Seat / Enquire
                    </button>
                    <a 
                        href="mailto:admin@cscorp.in?subject=IBM%20Maximo%20Training%20Enquiry" 
                        className="btn-secondary"
                    >
                        <Mail size={18} /> Email Directly
                    </a>
                </div>
            </section>

            {/* Enrollment / Enquiry Modal */}
            {enquiryModalOpen && (
                <div className="modal-backdrop-blur animate-fade-in">
                    <div className="modal-glass-card glass-card">
                        <div className="modal-head">
                            <div>
                                <span className="badge-pill cyan">{selectedCourseItem.type.toUpperCase()} ENROLMENT</span>
                                <h2 style={{ marginTop: '0.4rem' }}>{selectedCourseItem.title}</h2>
                            </div>
                            <button className="modal-close-icon" onClick={() => setEnquiryModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {submitStatus === 'success' ? (
                            <div className="modal-success-state animate-fade-in">
                                <CheckCircle2 size={54} color="#10b981" />
                                <h3>Enquiry Received!</h3>
                                <p>Thank you for reaching out. We will send the batch schedule, fee details, and enrollment links to <strong>{formData.email}</strong> shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="modal-user-form">
                                {submitStatus === 'error' && (
                                    <div className="auth-error-banner">
                                        Unable to submit enquiry. Please check your connection or contact via email.
                                    </div>
                                )}

                                <div className="modal-form-grid">
                                    <div className="modal-field">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Phone / WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="modal-field">
                                        <label>Selected Module / Track</label>
                                        <input
                                            type="text"
                                            value={selectedCourseItem.title}
                                            readOnly
                                            className="read-only-input"
                                        />
                                    </div>

                                    <div className="modal-field full-width">
                                        <label>Questions / Preferred Timings (Optional)</label>
                                        <textarea
                                            rows="3"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="e.g., Interested in weekend batch, or seeking custom corporate training..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="modal-actions-foot">
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => setEnquiryModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        disabled={submitStatus === 'submitting'}
                                    >
                                        <Send size={16} /> {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Enquiry'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
