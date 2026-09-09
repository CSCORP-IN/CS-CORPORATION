import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
    ExternalLink, Github, Mail, Linkedin, Code2, Database, Terminal, 
    Shield, Briefcase, Download, Sparkles, ArrowRight, CheckCircle2, 
    Layers, Cpu, Server, Check, Copy, BookOpen, GraduationCap, FileText, 
    ArrowUpRight, MapPin, Play, Pause, ChevronRight, Volume2, Award, 
    Zap, Flame, Compass, ArrowUp, Monitor, CheckCircle, RefreshCw, Eye
} from 'lucide-react';
import './Home.css';

const Home = () => {
    // Dynamic Typewriter / Morphing Role Switcher
    const roles = [
        "Enterprise Maximo & EAM Architect",
        "Mission-Critical Java Systems Specialist",
        "MIF Integration & Jython Automation Lead",
        "Creator @ ChaudharyDocs & ChaudharyConnect"
    ];
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        const fullText = roles[currentRoleIndex];
        const handleTyping = () => {
            if (!isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                setTypingSpeed(80);
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

    // 3 Dynamic Profile Narrative Paragraphs with Smooth Fade-Slide Transition & 5s Auto Progress
    const bioParagraphs = [
        {
            id: 'maximo',
            tag: "Maximo EAM & Architecture",
            icon: Shield,
            content: (
                <>
                    Results-driven <strong>IBM Maximo Developer</strong> with 4+ years of experience in designing, developing, customizing, enhancing, and supporting enterprise-grade Maximo solutions. Strong technical expertise in <strong>IBM Maximo, Java, Python, SQL, BIRT Reporting, Application Designer, Database Configuration, Workflows, Domains, Automation Scripts, and Integration Framework (MIF)</strong>. Proven ability to deliver scalable and efficient solutions aligned with business requirements, with hands-on experience in enterprise application development, production support, troubleshooting, and performance optimization.
                </>
            )
        },
        {
            id: 'genai',
            tag: "Generative AI & Modern Dev",
            icon: Sparkles,
            content: (
                <>
                    Experienced in leveraging <strong>Generative AI and AI-assisted development</strong> to implement client-focused use cases, automate business processes, improve operational efficiency, and enhance user experience. Proficient in modern AI-powered development tools, including <strong>GitHub Copilot and Cloud Code</strong>, to accelerate software development, improve code quality, and increase developer productivity. Passionate about applying emerging technologies to solve complex business and technical challenges.
                </>
            )
        },
        {
            id: 'sap',
            tag: "SAP ABAP & Enterprise ERP",
            icon: Layers,
            content: (
                <>
                    Completed <strong>SAP ABAP training</strong> and actively interested in gaining hands-on experience in SAP development while expanding expertise across the broader <strong>ERP and EAM ecosystem</strong>. Adaptable and technology-driven professional with the ability to work across diverse enterprise platforms, combining strong technical capabilities with an understanding of <strong>business processes, functional requirements, and end-to-end solution delivery</strong>.
                </>
            )
        }
    ];

    const [currentBioIndex, setCurrentBioIndex] = useState(0);
    const [isBioPaused, setIsBioPaused] = useState(false);

    useEffect(() => {
        if (isBioPaused) return;
        const timer = setInterval(() => {
            setCurrentBioIndex((prev) => (prev + 1) % bioParagraphs.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isBioPaused, bioParagraphs.length]);

    // Interactive Code Playground State
    // Spotlight Cursor Physics for Project Cards
    const handleMouseMove = (e, cardRef) => {
        if (!cardRef) return;
        const rect = cardRef.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.style.setProperty('--mouse-x', `${x}px`);
        cardRef.style.setProperty('--mouse-y', `${y}px`);
    };

    // 4 Flagship Digital Platforms
    const platformsData = [
        {
            id: 'chaudhary-sons',
            badge: 'PARENT ORGANIZATION',
            badgeColor: '#f97316',
            title: 'Chaudhary & Sons',
            subtitle: 'Foundational Heritage & Parent Organization',
            desc: 'The foundational parent organization uniting family heritage, public service, enterprise advisory, and strategic digital platforms across verticals.',
            stats: ['Foundational Heritage', 'Family Leadership', 'Enterprise Ecosystem'],
            tags: ['Parent Organization', 'Family Heritage', 'Public Service', 'Strategic Advisory'],
            link: '/',
            actionText: 'Visit'
        },
        {
            id: 'docs',
            badge: 'KNOWLEDGE PLATFORM',
            badgeColor: '#f97316',
            title: 'ChaudharyDocs',
            subtitle: 'Architecture Guides & Automation Knowledge Base',
            desc: 'Comprehensive technical documentation and open knowledge repository featuring architecture guides, script launch points, and system blueprints.',
            stats: ['31+ In-Depth Guides', 'REST / OSLC Blueprints', 'Automation Scripts'],
            tags: ['Architecture Guides', 'Automation Scripts', 'MIF Framework', 'Database Configuration', 'System Blueprints'],
            link: '/docs',
            actionText: 'Visit'
        },
        {
            id: 'articles',
            badge: 'PUBLICATIONS',
            badgeColor: '#10b981',
            title: 'ChaudharyArticles',
            subtitle: 'Engineering Blogs & Technical Whitepapers',
            desc: 'Curated publishing platform featuring in-depth case studies, system design breakdowns, migration whitepapers, and enterprise engineering best practices.',
            stats: ['In-Depth Case Studies', 'System Architecture', 'Modernization Whitepapers'],
            tags: ['Technical Articles', 'System Design', 'Enterprise Architecture', 'Engineering Blogs'],
            link: '/articles',
            actionText: 'Visit'
        },
        {
            id: 'connect',
            badge: 'PRACTICAL TRAINING',
            badgeColor: '#a855f7',
            title: 'ChaudharyConnect',
            subtitle: 'Hands-On Enterprise Maximo Practical Training',
            desc: 'Interactive, instructor-led modular training cohorts designed by enterprise architects. Hands-on configuration labs, real-world MIF scenarios, and 1-on-1 mentorship (Non-Certification).',
            stats: ['100% Live Instructor-Led', '10 Modular Tracks', 'From ₹1,999 / Module', 'Practical Labs'],
            tags: ['Live Batches', 'Hands-On Labs', 'Modular Pricing', 'Enterprise Mentorship', 'Job-Ready Skills'],
            link: '/courses',
            actionText: 'Visit'
        }
    ];

    // Maximo Developer Tools & Projects
    const developerToolsData = [
        {
            id: 'maxassist',
            badge: 'AI COPILOT FOR MAXIMO',
            badgeColor: '#f43f5e',
            title: 'MaxAssist AI Chatbot',
            subtitle: 'Intelligent LLM Assistant for IBM Maximo Architects',
            desc: 'Context-aware AI chatbot engineered to accelerate Maximo development. Diagnoses complex MBO runtime errors, drafts custom Jython launch points, explains table relationships, and assists with MAS 8.x configurations.',
            stats: ['Instant Launch Point Gen', 'MBO Error Diagnostics', 'NLP to Jython Engine'],
            tags: ['Generative AI', 'Python & LLM', 'IBM Maximo', 'Jython Generator', 'Prompt Engineering'],
            link: '#contact'
        },
        {
            id: 'dbc-generator',
            badge: 'DATABASE AUTOMATION',
            badgeColor: '#f59e0b',
            title: 'Maximo DBC Generator',
            subtitle: 'Automated Database Configuration Script (.dbc) Engine',
            desc: 'Eliminates error-prone manual scripting by automatically generating structured IBM Maximo .dbc scripts and XML definitions directly from metadata for tables, attributes, relationships, and domains.',
            stats: ['Zero Manual XML Typos', 'Schema Delta Sync', 'Database Config Automation'],
            tags: ['Python / Java', 'DBC Scripts', 'Database Config', 'Maximo Automation', 'Oracle & Db2'],
            link: '#contact'
        },
        {
            id: 'insert-generator',
            badge: 'DATA MIGRATION UTILITY',
            badgeColor: '#06b6d4',
            title: 'SQL Insert Script Generator',
            subtitle: 'Direct Table-to-SQL Insert Statement Automation Tool',
            desc: 'High-speed utility that extracts live Maximo table records, parses complex schemas, and automatically outputs production-ready SQL INSERT statements for deployment packages, seed data, and test fixtures.',
            stats: ['Instant Table Extraction', 'Safe Data Serialization', 'Deployment-Ready SQL'],
            tags: ['SQL Generator', 'Data Migration', 'Schema Parser', 'Database Tooling'],
            link: '#contact'
        }
    ];

    // Email Copy Toast State
    const [copiedEmail, setCopiedEmail] = useState(false);
    const copyEmailToClipboard = () => {
        navigator.clipboard.writeText("admin@cscorp.in");
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    return (
        <div className="revamp-master-wrapper">
            
            {/* AMBIENT BACKGROUND LIGHTING MESH */}
            <div className="cyber-ambient-mesh">
                <div className="ambient-orb orb-indigo"></div>
                <div className="ambient-orb orb-cyan"></div>
                <div className="ambient-orb orb-violet"></div>
                <div className="cyber-grid-overlay"></div>
            </div>

            {/* =========================================================================
                SECTION 1: HOLOGRAPHIC CYBER HERO (NO MOVING CARDS)
                ========================================================================= */}
            <section className="cyber-hero-section">
                <div className="hero-content-shell">
                    {/* Top Status & Availability Pill */}
                    <div className="hero-status-pill animate-fade-in-down">
                        <span className="pulsing-live-dot"></span>
                        <span className="status-text">AVAILABLE FOR ENTERPRISE ARCHITECTURE &amp; MAXIMO CONSULTING</span>
                        <span className="status-divider">•</span>
                        <span className="status-year">EST. 2020</span>
                    </div>

                    {/* Brand Subtitle & Family Signature (Above ANKIT CHAUDHARY) */}
                    <div className="hero-brand-subtitle">
                        <span className="brand-flank-line left"></span>
                        <div className="brand-title-badge">
                            <span className="brand-title-text">
                                CHAUDHARY <span className="brand-ampersand">&amp;</span> SONS
                            </span>
                        </div>
                        <span className="brand-flank-line right"></span>
                    </div>

                    {/* Giant Typographic Headline with Stacked Dual-Tone Continuous Shining */}
                    <h1 className="hero-display-giant-title">
                        <span className="hero-firstname">ANKIT</span>
                        <span className="hero-surname">CHAUDHARY</span>
                    </h1>

                    {/* Dynamic Morphing Typewriter Subheadline */}
                    <div className="hero-dynamic-role-container">
                        <span className="role-prefix">&gt;&nbsp;</span>
                        <span className="role-typed-text">{currentText}</span>
                        <span className="typing-cursor-blink">|</span>
                    </div>

                    {/* 3-Segment Rich Narrative Card with Smooth Fade/Slide & 5s Auto Progress */}
                    <div 
                        className="hero-narrative-card"
                        onMouseEnter={() => setIsBioPaused(true)}
                        onMouseLeave={() => setIsBioPaused(false)}
                    >
                        {/* Interactive Tab Header with Live Progress Indicator */}
                        <div className="narrative-segments-header">
                            {bioParagraphs.map((seg, idx) => {
                                const IconComp = seg.icon;
                                const shortLabels = ["Maximo", "GenAI", "SAP ABAP"];
                                return (
                                    <button
                                        key={seg.id}
                                        type="button"
                                        className={`narrative-segment-btn ${currentBioIndex === idx ? 'active' : ''}`}
                                        onClick={() => setCurrentBioIndex(idx)}
                                        aria-label={`Switch to ${seg.tag}`}
                                    >
                                        <div className="segment-btn-content">
                                            <span className="segment-index-badge">{idx + 1}</span>
                                            <IconComp size={14} className="segment-btn-icon" />
                                            <span className="segment-btn-label">{seg.tag}</span>
                                            <span className="segment-btn-short-label">{shortLabels[idx]}</span>
                                        </div>
                                        <div className="segment-progress-track">
                                            <div 
                                                className="segment-progress-bar"
                                                style={{
                                                    width: currentBioIndex === idx ? '100%' : '0%',
                                                    animationPlayState: isBioPaused ? 'paused' : 'running'
                                                }}
                                            ></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>


                        {/* Animated Text Body with Rich JSX Highlighting */}
                        <div className="narrative-content-stage" key={currentBioIndex}>
                            <div className="narrative-animated-body">
                                <p>{bioParagraphs[currentBioIndex].content}</p>
                            </div>
                        </div>
                    </div>

                    {/* Direct Action CTAs */}
                    <div className="hero-cta-button-cluster">
                        <a href="#platforms" className="cyber-btn cyber-btn-primary">
                            <Layers size={18} />
                            <span>Explore Platforms</span>
                            <ArrowRight size={16} />
                        </a>
                        <a href="#projects" className="cyber-btn cyber-btn-secondary">
                            <Sparkles size={18} color="#f59e0b" />
                            <span>Developer Tools</span>
                        </a>
                        <a 
                            href="/resume" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="cyber-btn cyber-btn-glass resume-hero-btn"
                        >
                            <FileText size={18} color="#ea580c" />
                            <span>Interactive Resume</span>
                            <ArrowUpRight size={14} />
                        </a>
                    </div>

                    {/* Interactive 3-Metric Quick Bar */}
                    <div className="hero-metrics-grid">
                        <div className="metric-chip">
                            <div className="metric-chip-icon">
                                <Shield size={20} color="#10b981" />
                            </div>
                            <div className="metric-chip-data">
                                <h3>4 Platforms</h3>
                                <p>Chaudhary Digital Ecosystem</p>
                            </div>
                        </div>

                        <div className="metric-chip">
                            <div className="metric-chip-icon">
                                <Cpu size={20} color="#06b6d4" />
                            </div>
                            <div className="metric-chip-data">
                                <h3>&lt; 120ms</h3>
                                <p>MIF Real-Time Sync Latency</p>
                            </div>
                        </div>

                        <div className="metric-chip">
                            <div className="metric-chip-icon">
                                <Award size={20} color="#f59e0b" />
                            </div>
                            <div className="metric-chip-data">
                                <h3>4+ Years</h3>
                                <p>Enterprise Consulting</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Infinite Flowing Relatable Maximo & Dev Ecosystem Marquee */}
                <div className="tech-marquee-wrapper">
                    <div className="tech-marquee-track">
                        {[
                            "IBM Maximo 7.6 & MAS 8.x",
                            "MaxAssist AI Chatbot for Maximo",
                            "Maximo DBC Script Generator",
                            "SQL Insert Script Automation",
                            "Custom Java MBOs & Cron Tasks",
                            "Jython Launch Points (Object/Attribute/Action)",
                            "MIF Integration Bus (REST / JSON / JMS)",
                            "Application Designer & Conditional UI",
                            "Workflows, Domains & Database Config",
                            "BIRT Enterprise Reporting",
                            "Oracle PL/SQL & IBM Db2 Tuning",
                            "ChaudharyDocs Knowledge Hub",
                            "ChaudharyConnect Live Masterclass",
                            "SAP ABAP & Enterprise ERP Integration",
                            "Generative AI & GitHub Copilot Development",
                            /* Duplicate for seamless infinite loop */
                            "IBM Maximo 7.6 & MAS 8.x",
                            "MaxAssist AI Chatbot for Maximo",
                            "Maximo DBC Script Generator",
                            "SQL Insert Script Automation",
                            "Custom Java MBOs & Cron Tasks",
                            "Jython Launch Points (Object/Attribute/Action)",
                            "MIF Integration Bus (REST / JSON / JMS)",
                            "Application Designer & Conditional UI",
                            "Workflows, Domains & Database Config",
                            "BIRT Enterprise Reporting",
                            "Oracle PL/SQL & IBM Db2 Tuning",
                            "ChaudharyDocs Knowledge Hub",
                            "ChaudharyConnect Live Masterclass",
                            "SAP ABAP & Enterprise ERP Integration",
                            "Generative AI & GitHub Copilot Development"
                        ].map((item, idx) => (
                            <div className="marquee-chip" key={idx}>
                                <span className="chip-dot"></span>
                                <span className="chip-label">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 2: THE 4 FLAGSHIP CHAUDHARY PLATFORMS
                ========================================================================= */}
            <section className="cyber-section platforms-showcase-section" id="platforms">
                <div className="section-container">
                    
                    <div className="section-header-wrap">
                        <div className="section-eyebrow">
                            <Layers size={16} color="#f97316" />
                            <span>CHAUDHARY ECOSYSTEM</span>
                        </div>
                        <h2 className="section-main-heading">The 4 Flagship Chaudhary Platforms</h2>
                        <p className="section-sub-copy">
                            Explore our official enterprise platforms spanning parent organization heritage, architecture documentation, technical publications, and live practical academies.
                        </p>
                    </div>

                    {/* 4 Flagship Platforms Grid */}
                    <div className="platforms-cards-grid">
                        {platformsData.map((plat) => {
                            const cardRef = useRef(null);
                            return (
                                <div 
                                    className="platform-card" 
                                    key={plat.id}
                                    ref={cardRef}
                                    onMouseMove={(e) => handleMouseMove(e, cardRef.current)}
                                >
                                    <div className="spotlight-glow-border"></div>
                                    <div className="platform-card-content">
                                        
                                        <div className="platform-card-top">
                                            <span className="proj-category-badge" style={{ color: plat.badgeColor, borderColor: `${plat.badgeColor}40` }}>
                                                {plat.badge}
                                            </span>
                                            {plat.link.startsWith('#') ? (
                                                <a href={plat.link} className="platform-action-link" style={{ color: plat.badgeColor }}>
                                                    <span>{plat.actionText}</span>
                                                    <ArrowRight size={15} />
                                                </a>
                                            ) : (
                                                <Link to={plat.link} className="platform-action-link" style={{ color: plat.badgeColor }}>
                                                    <span>{plat.actionText}</span>
                                                    <ArrowUpRight size={15} />
                                                </Link>
                                            )}
                                        </div>

                                        <h3 className="platform-card-title">{plat.title}</h3>
                                        <h4 className="platform-card-sub">{plat.subtitle}</h4>
                                        <p className="platform-card-desc">{plat.desc}</p>

                                        {/* Impact Metrics Row */}
                                        <div className="proj-stats-strip">
                                            {plat.stats.map((stat, i) => (
                                                <div className="stat-pill" key={i}>
                                                    <CheckCircle2 size={13} color={plat.badgeColor} />
                                                    <span>{stat}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tech Tags */}
                                        <div className="proj-tags-list">
                                            {plat.tags.map((tag, i) => (
                                                <span className="tech-tag" key={i}>{tag}</span>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 3: MAXIMO DEVELOPER TOOLS & AI ACCELERATORS
                ========================================================================= */}
            <section className="cyber-section projects-spotlight-section" id="projects">
                <div className="section-container">
                    
                    <div className="section-header-wrap">
                        <div className="section-eyebrow">
                            <Briefcase size={16} color="#06b6d4" />
                            <span>MAXIMO ACCELERATORS &amp; AI</span>
                        </div>
                        <h2 className="section-main-heading">Developer Innovation &amp; Automation Tools</h2>
                        <p className="section-sub-copy">
                            Specialized internal tools, AI chatbots, and database configuration generators built to accelerate IBM Maximo development.
                        </p>
                    </div>

                    {/* Developer Tools Spotlight Grid */}
                    <div className="spotlight-cards-grid">
                        {developerToolsData.map((proj) => {
                            const cardRef = useRef(null);
                            return (
                                <div 
                                    className="spotlight-card"
                                    key={proj.id}
                                    ref={cardRef}
                                    onMouseMove={(e) => handleMouseMove(e, cardRef.current)}
                                >
                                    <div className="spotlight-glow-border"></div>
                                    <div className="spotlight-card-content">
                                        
                                        <div className="proj-card-top-row">
                                            <span className="proj-category-badge" style={{ color: proj.badgeColor, borderColor: `${proj.badgeColor}40` }}>
                                                {proj.badge}
                                            </span>
                                            <ArrowUpRight size={20} className="proj-arrow-icon" />
                                        </div>

                                        <h3 className="proj-card-title">{proj.title}</h3>
                                        <h4 className="proj-card-sub">{proj.subtitle}</h4>
                                        <p className="proj-card-desc">{proj.desc}</p>

                                        {/* Impact Metrics Row */}
                                        <div className="proj-stats-strip">
                                            {proj.stats.map((stat, i) => (
                                                <div className="stat-pill" key={i}>
                                                    <CheckCircle2 size={13} color={proj.badgeColor} />
                                                    <span>{stat}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tech Tags */}
                                        <div className="proj-tags-list">
                                            {proj.tags.map((tag, i) => (
                                                <span className="tech-tag" key={i}>{tag}</span>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 4: ILLUMINATED CIRCUIT CAREER ROADMAP
                ========================================================================= */}
            <section className="cyber-section roadmap-section" id="experience">
                <div className="section-container">
                    
                    <div className="section-header-wrap">
                        <div className="section-eyebrow">
                            <Compass size={16} color="#a855f7" />
                            <span>CAREER TRAJECTORY</span>
                        </div>
                        <h2 className="section-main-heading">Enterprise Experience Roadmap</h2>
                        <p className="section-sub-copy">
                            A proven track record of 4+ years delivering scalable IBM Maximo architectures, GenAI tooling, and enterprise ERP solutions.
                        </p>
                    </div>

                    <div className="circuit-timeline">
                        <div className="circuit-line-laser"></div>

                        {/* Milestone 1: Infosys Limited */}
                        <div className="circuit-node-item">
                            <div className="circuit-dot-pulse"></div>
                            <div className="circuit-card">
                                <div className="circuit-date-badge">INFOSYS LIMITED</div>
                                <h3>Associate Consultant – IBM Maximo Developer</h3>
                                <h4>Infosys Limited • Enterprise Solutions</h4>
                                <p>
                                    Designing, developing, customizing, enhancing, and supporting enterprise-grade <strong>IBM Maximo (7.6 &amp; MAS 8.x)</strong> solutions. 
                                    Engineering custom Java MBO classes, Field Validations, Workflows, Domains, Database Configurations, Application Designer logic, 
                                    and high-throughput MIF integration pipelines using REST APIs, XML, and JSON queues with Oracle PL/SQL &amp; IBM Db2 database performance optimization.
                                </p>
                                <div className="circuit-tags">
                                    <span>IBM Maximo 7.6 / MAS 8</span>
                                    <span>Java MBOs &amp; Cron Tasks</span>
                                    <span>Jython Automation Scripts</span>
                                    <span>MIF Integration Bus</span>
                                    <span>Oracle PL/SQL &amp; Db2</span>
                                    <span>BIRT Reports</span>
                                </div>
                            </div>
                        </div>

                        {/* Milestone 2: Wipro Limited */}
                        <div className="circuit-node-item">
                            <div className="circuit-dot-pulse"></div>
                            <div className="circuit-card">
                                <div className="circuit-date-badge">WIPRO LIMITED</div>
                                <h3>Project Engineer – Java &amp; IBM Maximo Developer</h3>
                                <h4>Wipro Limited • Enterprise Application Services</h4>
                                <p>
                                    Developed, customized, and maintained core IBM Maximo modules, work order management workflows, and inventory tracking for enterprise clients. 
                                    Automated business rules with Jython/Python launch point scripts, implemented custom Java business logic, and configured database domains and application screens.
                                </p>
                                <div className="circuit-tags">
                                    <span>IBM Maximo 7.6</span>
                                    <span>Core Java Development</span>
                                    <span>Jython Scripting</span>
                                    <span>Application Designer</span>
                                    <span>Database Configuration</span>
                                    <span>Workflows &amp; Domains</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Resume Showcase Banner */}
                    <div className="resume-showcase-banner">
                        <div className="resume-banner-glow"></div>
                        <div className="resume-banner-content">
                            <div className="resume-banner-badge">
                                <Award size={15} />
                                <span>VERIFIED CAREER DOSSIER</span>
                            </div>
                            <h3>Explore Full Interactive Career Credentials</h3>
                            <p>
                                Complete chronological work history, IBM Maximo certifications, enterprise project architectures, client impact metrics, and downloadable CV dossier.
                            </p>
                        </div>
                        <a 
                            href="/resume" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="resume-banner-btn"
                        >
                            <FileText size={18} />
                            <span>Launch Interactive Resume</span>
                            <ArrowUpRight size={16} />
                        </a>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 5: CATEGORIZED TECHNICAL ARSENAL
                ========================================================================= */}
            <section className="cyber-section skills-section" id="skills">
                <div className="section-container">
                    
                    <div className="section-header-wrap">
                        <div className="section-eyebrow">
                            <Cpu size={16} color="#6366f1" />
                            <span>TECHNICAL ARSENAL</span>
                        </div>
                        <h2 className="section-main-heading">Skills &amp; Enterprise Stack</h2>
                        <p className="section-sub-copy">
                            Comprehensive proficiency spanning enterprise EAM suites, core backend engineering, and cloud systems.
                        </p>
                    </div>

                    <div className="skills-category-grid">
                        
                        {/* 1. Enterprise EAM */}
                        <div className="skill-cat-card">
                            <div className="skill-cat-header">
                                <div className="cat-icon-box indigo">
                                    <Layers size={22} color="#6366f1" />
                                </div>
                                <h4>Enterprise EAM</h4>
                            </div>
                            <div className="skill-pills-wrap">
                                <span className="skill-tag-pill">IBM Maximo 7.6 / MAS 8</span>
                                <span className="skill-tag-pill">Work Order Management</span>
                                <span className="skill-tag-pill">Preventive Maintenance</span>
                                <span className="skill-tag-pill">Asset Lifecycle</span>
                                <span className="skill-tag-pill">Database Configurations</span>
                                <span className="skill-tag-pill">Application Designer</span>
                            </div>
                        </div>

                        {/* 2. Core Backend */}
                        <div className="skill-cat-card">
                            <div className="skill-cat-header">
                                <div className="cat-icon-box cyan">
                                    <Server size={22} color="#06b6d4" />
                                </div>
                                <h4>Backend Engineering</h4>
                            </div>
                            <div className="skill-pills-wrap">
                                <span className="skill-tag-pill">Java EE / Core Java</span>
                                <span className="skill-tag-pill">Custom MBOs &amp; MboSets</span>
                                <span className="skill-tag-pill">Spring Boot</span>
                                <span className="skill-tag-pill">RESTful &amp; SOAP APIs</span>
                                <span className="skill-tag-pill">Microservices Architecture</span>
                                <span className="skill-tag-pill">Hibernate / JPA</span>
                            </div>
                        </div>

                        {/* 3. Automation & Scripting */}
                        <div className="skill-cat-card">
                            <div className="skill-cat-header">
                                <div className="cat-icon-box emerald">
                                    <Terminal size={22} color="#10b981" />
                                </div>
                                <h4>Automation &amp; Scripting</h4>
                            </div>
                            <div className="skill-pills-wrap">
                                <span className="skill-tag-pill">Jython Scripting</span>
                                <span className="skill-tag-pill">Launch Points (Action/Attribute/Object)</span>
                                <span className="skill-tag-pill">Python 3</span>
                                <span className="skill-tag-pill">Event Handlers</span>
                                <span className="skill-tag-pill">Business Rule Engines</span>
                                <span className="skill-tag-pill">Bash / Shell Scripting</span>
                            </div>
                        </div>

                        {/* 4. Integration & Databases */}
                        <div className="skill-cat-card">
                            <div className="skill-cat-header">
                                <div className="cat-icon-box violet">
                                    <Database size={22} color="#a855f7" />
                                </div>
                                <h4>Integration &amp; Databases</h4>
                            </div>
                            <div className="skill-pills-wrap">
                                <span className="skill-tag-pill">MIF Framework</span>
                                <span className="skill-tag-pill">JMS Queues / MEA</span>
                                <span className="skill-tag-pill">Oracle 19c &amp; SQL Tuning</span>
                                <span className="skill-tag-pill">IBM Db2</span>
                                <span className="skill-tag-pill">Apache Kafka</span>
                                <span className="skill-tag-pill">XML / JSON Data Pipelines</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 6: CONTACT PORTAL & CONSULTATION HORIZON
                ========================================================================= */}
            <section className="cyber-section contact-portal-section" id="contact">
                <div className="section-container">
                    <div className="contact-portal-card">
                        <div className="portal-glow-halo"></div>
                        
                        <div className="portal-content-inner">
                            <div className="portal-badge">
                                <Sparkles size={16} color="#f59e0b" />
                                <span>START A CONVERSATION</span>
                            </div>

                            <h2 className="portal-title">Let&apos;s Build Resilient Enterprise Systems</h2>
                            <p className="portal-subtitle">
                                Available for enterprise architecture consulting, IBM Maximo modernization, 
                                custom integration design, or specialized team training.
                            </p>

                            <div className="portal-contact-actions">
                                <a 
                                    href="mailto:admin@cscorp.in?subject=Enterprise%20Architecture%20Inquiry" 
                                    className="cyber-btn cyber-btn-primary portal-btn"
                                >
                                    <Mail size={18} />
                                    <span>Send Direct Email</span>
                                </a>

                                <button onClick={copyEmailToClipboard} className="cyber-btn cyber-btn-secondary portal-btn">
                                    {copiedEmail ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                                    <span>{copiedEmail ? 'Email Copied!' : 'admin@cscorp.in'}</span>
                                </button>
                            </div>

                            <div className="portal-meta-strip">
                                <div className="meta-item">
                                    <MapPin size={16} color="#06b6d4" />
                                    <span>India (Available Worldwide Remote / Hybrid)</span>
                                </div>
                                <div className="meta-item">
                                    <Shield size={16} color="#10b981" />
                                    <span>Enterprise Non-Disclosure &amp; Security Compliant</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
