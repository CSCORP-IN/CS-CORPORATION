/**
 * Email Service for Sending 6-Digit OTP Verification Emails
 */

export const sendOTPEmail = async (email, otp, recipientName = 'User') => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_FROM || 'admin@cscorp.in';
    const senderName = process.env.EMAIL_FROM_NAME || 'Chaudhary & Sons';

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
            // Fallback console log in case of API rejection
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
