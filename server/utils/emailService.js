/**
 * Email Service for Sending 6-Digit OTP Verification, Contact Inquiries, and Course Enquiries via Brevo API
 */

const getEmailConfig = () => {
    return {
        brevoApiKey: process.env.BREVO_API_KEY,
        adminEmail: process.env.ADMIN_EMAIL || 'admin@cscorp.in',
        senderEmail: process.env.EMAIL_FROM || 'admin@cscorp.in',
        senderName: process.env.EMAIL_FROM_NAME || 'Chaudhary & Sons'
    };
};

/**
 * Send 6-Digit OTP Verification Email for User Signup
 */
export const sendOTPEmail = async (email, otp, recipientName = 'User') => {
    const { brevoApiKey, senderEmail, senderName } = getEmailConfig();

    // If no API key configured, use local dev logger fallback
    if (!brevoApiKey) {
        console.log('--------------------------------------------------');
        console.log(`[EMAIL DEV MOCK] Destination: ${email}`);
        console.log(`[EMAIL DEV MOCK] 6-Digit OTP: ${otp}`);
        console.log('--------------------------------------------------');
        return true;
    }

    const payload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [
            {
                email: email,
                name: recipientName
            }
        ],
        subject: "Your 6-Digit Verification Code | Chaudhary & Sons",
        htmlContent: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="background: #09090b; padding: 28px 24px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 0.05em;">CHAUDHARY &amp; SONS</h1>
                    <p style="color: #ea580c; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 6px 0 0 0; letter-spacing: 0.15em;">Engineering &amp; Knowledge Hub</p>
                </div>
                
                <div style="padding: 32px 28px;">
                    <h2 style="color: #09090b; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Verify Your Email Address</h2>
                    <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                        Hello <strong>${recipientName}</strong>,<br/>
                        Thank you for registering on the <strong>Chaudhary &amp; Sons Knowledge Hub</strong>. Please use the following 6-digit One-Time Password (OTP) to activate your account.
                    </p>

                    <div style="background: #f4f4f5; border: 1.5px dashed #ea580c; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px 0;">
                        <span style="display: block; font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">One-Time Password</span>
                        <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c;">${otp}</span>
                    </div>

                    <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.
                    </p>
                    <p style="color: #a1a1aa; font-size: 11px; line-height: 1.4; margin: 0;">
                        If you did not initiate this registration request, please ignore this email.
                    </p>
                </div>

                <div style="background: #fafafa; border-top: 1px solid #f4f4f5; padding: 16px 28px; text-align: center;">
                    <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Chaudhary &amp; Sons Corporation. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`[EMAIL API] OTP successfully sent to: ${email}`);
            return true;
        } else {
            const errorText = await response.text();
            console.error('[EMAIL API ERROR]', errorText);
            console.log('--------------------------------------------------');
            console.log(`[EMAIL BACKUP LOG] Destination: ${email}`);
            console.log(`[EMAIL BACKUP LOG] 6-Digit OTP: ${otp}`);
            console.log('--------------------------------------------------');
            return true;
        }
    } catch (err) {
        console.error('[EMAIL NETWORK ERROR]', err.message);
        console.log('--------------------------------------------------');
        console.log(`[EMAIL BACKUP LOG] Destination: ${email}`);
        console.log(`[EMAIL BACKUP LOG] 6-Digit OTP: ${otp}`);
        console.log('--------------------------------------------------');
        return true;
    }
};

/**
 * Send Contact Notification Email to Admin (admin@cscorp.in) + Confirmation to User
 */
export const sendContactEmail = async ({ name, email, phone, subject, message }) => {
    const { brevoApiKey, adminEmail, senderEmail, senderName } = getEmailConfig();
    const formattedSubject = subject || 'New General Inquiry';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[CONTACT INQUIRY] New contact from ${name} (${email}): ${formattedSubject}`);

    // If no API key configured, log in dev mode
    if (!brevoApiKey) {
        console.log('==================================================');
        console.log(`[CONTACT DEV MOCK] To Admin: ${adminEmail}`);
        console.log(`[CONTACT DEV MOCK] From: ${name} <${email}>`);
        if (phone) console.log(`[CONTACT DEV MOCK] Phone: ${phone}`);
        console.log(`[CONTACT DEV MOCK] Subject: ${formattedSubject}`);
        console.log(`[CONTACT DEV MOCK] Message: ${message}`);
        console.log('==================================================');
        return true;
    }

    // 1. Email payload to Admin (admin@cscorp.in)
    const adminPayload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [
            {
                email: adminEmail,
                name: "Chaudhary & Sons Admin"
            }
        ],
        replyTo: {
            email: email,
            name: name
        },
        subject: `📬 [New Inquiry] ${formattedSubject} - ${name}`,
        htmlContent: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #09090b 0%, #1c1917 100%); padding: 30px 26px; border-bottom: 3px solid #ea580c;">
                    <span style="display: inline-block; background: rgba(234, 88, 12, 0.15); border: 1px solid rgba(234, 88, 12, 0.35); color: #ea580c; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                        New Portal Message
                    </span>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">
                        Connect with Us Form Submission
                    </h1>
                    <p style="color: #a1a1aa; font-size: 12px; margin: 6px 0 0 0;">Received on ${timestamp} IST</p>
                </div>
                
                <div style="padding: 28px 26px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 14px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Sender Details</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; width: 110px; font-weight: 600;">Full Name:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
                                <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #ea580c; text-decoration: none; font-weight: 600;">${email}</a></td>
                            </tr>
                            ${phone ? `
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Phone / WA:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${phone}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Subject:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${formattedSubject}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-bottom: 26px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">Message Content</h3>
                        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #ea580c; border-radius: 8px; padding: 18px 20px; font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">${message}</div>
                    </div>

                    <div style="text-align: center; padding-top: 8px;">
                        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(formattedSubject)}" style="display: inline-block; background: #ea580c; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(234,88,12,0.3);">
                            ✉️ Direct Reply to ${name}
                        </a>
                    </div>
                </div>

                <div style="background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 16px 26px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0;">
                        Chaudhary &amp; Sons Automated Inbound Dispatch • Delivered to <strong>${adminEmail}</strong>
                    </p>
                </div>
            </div>
        `
    };

    // 2. Automated acknowledgment payload to User
    const userAckPayload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [
            {
                email: email,
                name: name
            }
        ],
        subject: `Thank you for contacting Chaudhary & Sons | Inquiry Received`,
        htmlContent: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="background: #09090b; padding: 26px 24px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.05em;">CHAUDHARY &amp; SONS</h1>
                    <p style="color: #ea580c; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 0.15em;">Strategic Solutions &amp; Knowledge Hub</p>
                </div>
                
                <div style="padding: 30px 26px;">
                    <h2 style="color: #09090b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">We have received your message!</h2>
                    <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear <strong>${name}</strong>,<br/><br/>
                        Thank you for reaching out to us. We have successfully received your inquiry regarding <em>"${formattedSubject}"</em>.
                    </p>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 0 0 20px 0;">
                        <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Your Message Summary</span>
                        <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0; font-style: italic;">"${message.length > 200 ? message.slice(0, 200) + '...' : message}"</p>
                    </div>

                    <p style="color: #52525b; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
                        A member of our team will review your message and get in touch with you shortly.
                    </p>
                    <p style="color: #71717a; font-size: 12px; margin: 0;">
                        For urgent inquiries, feel free to reply directly to this email or contact us at <a href="mailto:admin@cscorp.in" style="color: #ea580c;">admin@cscorp.in</a>.
                    </p>
                </div>

                <div style="background: #fafafa; border-top: 1px solid #f4f4f5; padding: 16px 26px; text-align: center;">
                    <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Chaudhary &amp; Sons Corporation. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        // Send email to Admin
        const adminRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(adminPayload)
        });

        if (adminRes.ok) {
            console.log(`[EMAIL API] Contact inquiry successfully forwarded to admin: ${adminEmail}`);
        } else {
            const errText = await adminRes.text();
            console.error('[EMAIL API ADMIN ERROR]', errText);
        }

        // Send acknowledgment email to user (non-blocking failure)
        try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': brevoApiKey,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify(userAckPayload)
            });
        } catch (ackErr) {
            console.warn('[EMAIL API USER ACK WARNING]', ackErr.message);
        }

        return true;
    } catch (err) {
        console.error('[EMAIL API NETWORK ERROR]', err.message);
        return true;
    }
};

/**
 * Send Course / Training Enquiry Notification Email
 */
export const sendEnquiryEmail = async ({ name, email, phone, selectedItem, itemType, message }) => {
    const { brevoApiKey, adminEmail, senderEmail, senderName } = getEmailConfig();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[COURSE ENQUIRY] New enquiry from ${name} (${email}) for: ${selectedItem}`);

    if (!brevoApiKey) {
        console.log('==================================================');
        console.log(`[ENQUIRY DEV MOCK] To Admin: ${adminEmail}`);
        console.log(`[ENQUIRY DEV MOCK] Student: ${name} <${email}>, Phone: ${phone || 'N/A'}`);
        console.log(`[ENQUIRY DEV MOCK] Course: ${selectedItem} (${itemType || 'module'})`);
        console.log(`[ENQUIRY DEV MOCK] Message: ${message || 'N/A'}`);
        console.log('==================================================');
        return true;
    }

    const payload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [
            {
                email: adminEmail,
                name: "Chaudhary & Sons Admin"
            }
        ],
        replyTo: {
            email: email,
            name: name
        },
        subject: `🎓 [New Course Lead] ${selectedItem} - ${name}`,
        htmlContent: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="background: #09090b; padding: 26px 24px; border-bottom: 3px solid #06b6d4;">
                    <span style="display: inline-block; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35); color: #06b6d4; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                        Training &amp; Course Lead
                    </span>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">
                        New Course Enquiry Received
                    </h1>
                    <p style="color: #a1a1aa; font-size: 12px; margin: 4px 0 0 0;">Received on ${timestamp} IST</p>
                </div>
                
                <div style="padding: 26px 24px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 600;">Student Name:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
                                <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Phone / WA:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${phone || 'Not provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Course / Bundle:</td>
                                <td style="padding: 6px 0; color: #0284c7; font-weight: 700;">${selectedItem} (${itemType || 'module'})</td>
                            </tr>
                        </table>
                    </div>

                    ${message ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Message / Note:</h4>
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 13px; color: #334155; white-space: pre-wrap;">${message}</div>
                    </div>` : ''}

                    <div style="text-align: center;">
                        <a href="mailto:${email}?subject=ChaudharyConnect%20Course%20Details%20-%20${encodeURIComponent(selectedItem)}" style="display: inline-block; background: #0284c7; color: #ffffff; font-weight: 700; font-size: 13px; padding: 11px 24px; border-radius: 8px; text-decoration: none;">
                            ✉️ Reply to Student
                        </a>
                    </div>
                </div>

                <div style="background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0;">
                        Chaudhary &amp; Sons Course Engine • Lead forwarded to <strong>${adminEmail}</strong>
                    </p>
                </div>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log(`[EMAIL API] Course lead forwarded to admin: ${adminEmail}`);
        } else {
            console.error('[EMAIL API LEAD ERROR]', await response.text());
        }
        return true;
    } catch (err) {
        console.error('[EMAIL API NETWORK ERROR]', err.message);
        return true;
    }
};

