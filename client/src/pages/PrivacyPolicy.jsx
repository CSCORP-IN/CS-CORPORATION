import React from 'react';
import { Shield, Lock, FileText, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-page-container">
            <div className="privacy-card">
                <div className="privacy-header">
                    <Link to="/" className="privacy-back-link">
                        <ArrowLeft size={16} /> Back to CS Corp
                    </Link>
                    <div className="privacy-icon-badge">
                        <Shield size={28} />
                    </div>
                    <h1>Privacy Policy</h1>
                    <p className="privacy-subtitle">
                        CS Corp Mobile App &amp; Web Platform (cscorp.in • app.cscorp.in)
                    </p>
                    <span className="privacy-date-badge">Last Updated: November 2026</span>
                </div>

                <div className="privacy-body">
                    <section className="privacy-section">
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to <strong>CS Corp</strong> (&ldquo;Chaudhary &amp; Sons Corporation&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our mobile application
                            (Package ID: <code>app.cscorp.in</code>) and web services hosted at <code>https://cscorp.in</code>.
                        </p>
                        <p>
                            We are committed to protecting your privacy and ensuring your personal documents, financial data, and credentials remain confidential and secure.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>2. Information We Collect</h2>
                        <div className="privacy-grid">
                            <div className="privacy-info-box">
                                <div className="pib-header">
                                    <Lock size={18} className="pib-icon" />
                                    <h3>Account Information</h3>
                                </div>
                                <p>
                                    When you register or log in, we collect your name, email address, phone number (optional), and securely hashed passwords.
                                    We use this solely to authenticate your identity across devices.
                                </p>
                            </div>

                            <div className="privacy-info-box">
                                <div className="pib-header">
                                    <FileText size={18} className="pib-icon" />
                                    <h3>User-Uploaded Documents (CS Locker)</h3>
                                </div>
                                <p>
                                    Files, PDFs, images, certificates, and ID cards uploaded to <strong>CS Locker</strong> are stored with strict per-user access control.
                                    Only you can view, preview, download, or delete your documents.
                                </p>
                            </div>

                            <div className="privacy-info-box">
                                <div className="pib-header">
                                    <CheckCircle size={18} className="pib-icon" />
                                    <h3>Financial &amp; Budget Data (KhataKit)</h3>
                                </div>
                                <p>
                                    Entries you add into KhataKit—such as recurring bills, EMI trackers, expenses, and investment portfolios—are encrypted and private to your account.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="privacy-section">
                        <h2>3. How We Use Your Data</h2>
                        <ul className="privacy-bullet-list">
                            <li>To provide, maintain, and personalize your CS Corp workspace and tools.</li>
                            <li>To securely authenticate your session and enable auto-login across app launches.</li>
                            <li>To send critical account security alerts, such as OTPs for password recovery (via Brevo transactional email).</li>
                            <li>To provide customer support and respond to inquiries.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>4. Data Storage &amp; Security</h2>
                        <p>
                            We employ industry-standard security protocols:
                        </p>
                        <ul className="privacy-bullet-list">
                            <li><strong>Encryption in Transit:</strong> All communications between your device and our servers use HTTPS/TLS with modern cipher suites.</li>
                            <li><strong>Encrypted Storage:</strong> User credentials are protected using salted bcrypt hashes, and documents are stored with user-level isolation in MongoDB GridFS.</li>
                            <li><strong>No Selling of Data:</strong> We do not sell, rent, or trade your personal information or uploaded files to any third-party advertisers.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>5. Third-Party Services</h2>
                        <p>
                            We only integrate trusted services strictly necessary for application functionality:
                        </p>
                        <ul className="privacy-bullet-list">
                            <li><strong>Brevo (Transactional Email API):</strong> Used solely for delivering OTP codes and account recovery emails.</li>
                            <li><strong>Google Play Services:</strong> Used for standard app distribution, in-app updates, and crash analytics.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>6. User Control, Data Retention &amp; Deletion</h2>
                        <p>
                            You have complete control over your data:
                        </p>
                        <ul className="privacy-bullet-list">
                            <li>You can edit or permanently delete your documents from CS Locker at any time.</li>
                            <li>You can export or clear your KhataKit financial records from the settings menu.</li>
                            <li>To request complete deletion of your account and all associated data, you may email us directly at <a href="mailto:admin@cscorp.in">admin@cscorp.in</a>.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>7. Children&apos;s Privacy</h2>
                        <p>
                            Our services and mobile app are not directed to children under the age of 13. We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    <section className="privacy-section">
                        <h2>8. Contact Us</h2>
                        <p>
                            If you have questions or concerns regarding this Privacy Policy or your data, please contact our privacy compliance team:
                        </p>
                        <div className="privacy-contact-box">
                            <Mail size={18} />
                            <div>
                                <strong>CS Corporation (Chaudhary &amp; Sons Corporation)</strong>
                                <br />
                                Email: <a href="mailto:admin@cscorp.in">admin@cscorp.in</a>
                                <br />
                                Website: <a href="https://cscorp.in" target="_blank" rel="noopener noreferrer">https://cscorp.in</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
