import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Printer, Download, ArrowLeft, Mail, Phone, MapPin, 
    Linkedin, Github, Globe, Briefcase, GraduationCap, 
    Code, Terminal, Database, CheckCircle2, Award, ExternalLink
} from 'lucide-react';
import API_BASE_URL from '../config';
import './Resume.css';

const Resume = () => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="resume-page-wrapper animate-fade-in">
            {/* Floating Top Control Bar (Hidden during print) */}
            <div className="resume-controls-bar no-print">
                <Link to="/ankit-chaudhary" className="control-btn back-btn">
                    <ArrowLeft size={16} /> Portfolio Home
                </Link>
                <div className="control-right-group">
                    <button onClick={handlePrint} className="control-btn print-btn">
                        <Printer size={16} /> Print / Save as PDF
                    </button>
                    <a 
                        href={`${API_BASE_URL}/uploads/CV/UPDATED_Resume.pdf`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="control-btn download-btn btn-primary"
                    >
                        <Download size={16} /> Download File
                    </a>
                </div>
            </div>

            {/* Resume Sheet Container */}
            <main className="resume-paper-container glass-card">
                {/* Header / Bio */}
                <header className="resume-header">
                    <div className="resume-name-col">
                        <h1 className="resume-name">Ankit Chaudhary</h1>
                        <h2 className="resume-role text-gradient-primary">Java Developer & IBM Maximo Specialist</h2>
                        <p className="resume-tagline">
                            Accomplished Software Engineer with 4+ years of expertise in enterprise architecture, 
                            IBM Maximo Enterprise Asset Management (EAM), and full-stack backend development.
                        </p>
                    </div>

                    <div className="resume-contact-col">
                        <a href="mailto:admin@cscorp.in" className="contact-link">
                            <Mail size={14} className="contact-icon" /> admin@cscorp.in
                        </a>
                        <span className="contact-link">
                            <MapPin size={14} className="contact-icon" /> India (Open to Remote & Global)
                        </span>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                            <Linkedin size={14} className="contact-icon" /> linkedin.com/in/ankitchaudhary
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                            <Github size={14} className="contact-icon" /> github.com/ankitchaudhary
                        </a>
                    </div>
                </header>

                <div className="resume-grid-body">
                    {/* Left Main Column */}
                    <div className="resume-main-col">
                        {/* Professional Summary */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <Briefcase size={16} className="title-icon" /> Professional Summary
                            </h3>
                            <div className="section-text-paragraphs">
                                <p className="section-text">
                                    Results-driven <strong>IBM Maximo Developer</strong> with 4+ years of experience in designing, developing, customizing, enhancing, and supporting enterprise-grade Maximo solutions. Strong technical expertise in <strong>IBM Maximo, Java, Python, SQL, BIRT Reporting, Application Designer, Database Configuration, Workflows, Domains, Automation Scripts, and Integration Framework (MIF)</strong>.
                                </p>
                                <p className="section-text">
                                    Proven ability to deliver scalable and efficient solutions aligned with business requirements, with hands-on experience in enterprise application development, production support, troubleshooting, and performance optimization. Experienced in leveraging <strong>Generative AI and AI-assisted development</strong> to implement client-focused use cases, automate business processes, improve operational efficiency, and enhance user experience.
                                </p>
                                <p className="section-text">
                                    Proficient in modern AI-powered development tools, including <strong>GitHub Copilot and Cloud Code</strong>, to accelerate software development, improve code quality, and increase developer productivity. Also completed <strong>SAP ABAP training</strong>, with a strong interest in gaining hands-on experience in SAP development and expanding expertise across the broader <strong>ERP and EAM ecosystem</strong>.
                                </p>
                                <p className="section-text">
                                    Adaptable and technology-driven professional with the ability to work across diverse enterprise platforms, combining strong technical capabilities with an understanding of <strong>business processes, functional requirements, and end-to-end solution delivery</strong>.
                                </p>
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <Briefcase size={16} className="title-icon" /> Professional Experience
                            </h3>

                            <div className="experience-entry">
                                <div className="entry-head">
                                    <div>
                                        <h4 className="entry-role">Associate Consultant – IBM Maximo Developer</h4>
                                        <h5 className="entry-company">Infosys Limited</h5>
                                    </div>
                                    <span className="entry-period">Enterprise Solutions</span>
                                </div>
                                <ul className="entry-bullets">
                                    <li>Architected and customized <strong>IBM Maximo 7.6 / MAS 8.x</strong> solutions for large-scale enterprise clients, ensuring 99.9% uptime and high transaction throughput.</li>
                                    <li>Engineered custom Java MBO classes, Field Validations, and background Cron Tasks to automate complex organizational business rules.</li>
                                    <li>Built robust integration pipelines using the <strong>Maximo Integration Framework (MIF)</strong>, connecting enterprise systems via REST APIs, XML, and JSON data queues.</li>
                                    <li>Implemented dynamic, conditional UI logic in Application Designer, improving end-user workflow efficiency by over 30%.</li>
                                    <li>Authored high-performance Jython/Python <strong>Automation Scripts</strong> for rapid business rule extensions without requiring application redeployments.</li>
                                    <li>Optimized database schemas, indexing, and complex queries on <strong>Oracle PL/SQL</strong> and <strong>IBM Db2</strong> environments.</li>
                                </ul>
                            </div>

                            <div className="experience-entry">
                                <div className="entry-head">
                                    <div>
                                        <h4 className="entry-role">Project Engineer – Java & IBM Maximo Developer</h4>
                                        <h5 className="entry-company">Wipro Limited</h5>
                                    </div>
                                    <span className="entry-period">Enterprise Application Services</span>
                                </div>
                                <ul className="entry-bullets">
                                    <li>Developed, customized, and supported core IBM Maximo modules including Work Orders, Assets, and Inventory management.</li>
                                    <li>Implemented Jython automation launch points and Java business logic to streamline client asset workflows.</li>
                                    <li>Configured application layouts, conditional UI properties, and data domains in Application Designer and Database Configuration.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Key Projects */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <Terminal size={16} className="title-icon" /> Key Projects & Implementations
                            </h3>

                            <div className="project-entry">
                                <div className="entry-head">
                                    <h4 className="entry-role">MaxAssist – AI Copilot for IBM Maximo</h4>
                                    <span className="tech-badge">Python • Generative AI • LLM • Maximo</span>
                                </div>
                                <p className="entry-desc">
                                    Developed an intelligent conversational AI chatbot engineered specifically for Maximo developers that automates Jython launch point scripting, diagnoses complex MBO stack traces, and provides instant MAS 8.x guidance.
                                </p>
                            </div>

                            <div className="project-entry">
                                <div className="entry-head">
                                    <h4 className="entry-role">Maximo DBC & SQL Insert Script Generators</h4>
                                    <span className="tech-badge">Python • Java • Database Config • SQL</span>
                                </div>
                                <p className="entry-desc">
                                    Engineered developer automation utilities that automatically generate structured Maximo .dbc configuration scripts from metadata and extract live table records into deployment-ready SQL INSERT statements.
                                </p>
                            </div>

                            <div className="project-entry">
                                <div className="entry-head">
                                    <h4 className="entry-role">Chaudhary & Sons – Enterprise Maximo Suite & Hubs</h4>
                                    <span className="tech-badge">IBM Maximo • Java EE • MIF • Jython</span>
                                </div>
                                <p className="entry-desc">
                                    Enterprise Asset Management architecture and digital ecosystem (ChaudharyDocs & ChaudharyConnect) delivering custom Java MBO business rules, MIF REST/JMS integration buses, and live technical mentorship.
                                </p>
                            </div>

                            <div className="project-entry">
                                <div className="entry-head">
                                    <h4 className="entry-role">Enterprise HR & Talent Lifecycle Suite</h4>
                                    <span className="tech-badge">Java • Spring Boot • React</span>
                                </div>
                                <p className="entry-desc">
                                    Engineered an end-to-end recruitment, interview pipeline, appraisal, and employee data management platform.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right Side Column */}
                    <div className="resume-side-col">
                        {/* Core Technical Competencies */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <Code size={16} className="title-icon" /> Technical Skills
                            </h3>

                            <div className="skill-group">
                                <h4 className="skill-group-title">IBM Maximo (EAM)</h4>
                                <div className="skill-tags">
                                    <span>Maximo 7.6 / 8.x</span>
                                    <span>MIF Integration</span>
                                    <span>Automation Scripts</span>
                                    <span>Database Config</span>
                                    <span>Application Designer</span>
                                    <span>Workflows & Escalations</span>
                                    <span>Security Groups</span>
                                </div>
                            </div>

                            <div className="skill-group">
                                <h4 className="skill-group-title">Backend & Languages</h4>
                                <div className="skill-tags">
                                    <span>Java (SE/EE)</span>
                                    <span>Spring Boot</span>
                                    <span>RESTful APIs</span>
                                    <span>Python / Jython</span>
                                    <span>Object-Oriented Design</span>
                                    <span>Microservices</span>
                                </div>
                            </div>

                            <div className="skill-group">
                                <h4 className="skill-group-title">Databases & Querying</h4>
                                <div className="skill-tags">
                                    <span>Oracle (PL/SQL)</span>
                                    <span>IBM Db2</span>
                                    <span>MongoDB</span>
                                    <span>Query Optimization</span>
                                </div>
                            </div>

                            <div className="skill-group">
                                <h4 className="skill-group-title">Web, Tools & DevOps</h4>
                                <div className="skill-tags">
                                    <span>React.js</span>
                                    <span>Modern JavaScript</span>
                                    <span>Git & GitHub</span>
                                    <span>Docker Basics</span>
                                    <span>Linux & Shell</span>
                                    <span>CI/CD Pipelines</span>
                                </div>
                            </div>
                        </section>

                        {/* Education */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <GraduationCap size={16} className="title-icon" /> Education
                            </h3>
                            <div className="edu-entry">
                                <h4 className="edu-degree">Bachelor of Technology (B.Tech)</h4>
                                <h5 className="edu-field">Computer Science & Engineering</h5>
                                <span className="edu-note">Lifelong Advocate of Continuous Learning</span>
                            </div>
                        </section>

                        {/* Professional Highlights */}
                        <section className="resume-section">
                            <h3 className="section-title-line">
                                <Award size={16} className="title-icon" /> Highlights
                            </h3>
                            <ul className="highlights-list">
                                <li>4+ Years Enterprise Delivery</li>
                                <li>Defense-Grade MRO Expertise</li>
                                <li>Live Technical Trainer & Author</li>
                                <li>Knowledge Hub Creator</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Resume;
