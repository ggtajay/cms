/**
 * Nodemailer email utility — sends login credentials to new users
 * Uses Gmail SMTP with App Password
 * Falls back gracefully if email sending fails (logs to console, doesn't throw)
 */

const nodemailer = require('nodemailer')

/**
 * Build a Nodemailer transporter using explicit Gmail SMTP settings.
 * Using host/port/secure instead of service:'gmail' shorthand is more
 * reliable with nodemailer v8 and avoids potential service-alias resolution issues.
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,  // true for port 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  // Must be a Gmail App Password (not your account password)
    },
    // Increase timeout for slow connections
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

/**
 * Verify SMTP connection — call this once on server startup to catch
 * bad credentials early. Logs result but never throws.
 */
const verifyTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Mailer] ⚠️  EMAIL_USER or EMAIL_PASS not set — email will be skipped')
    return false
  }
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log(`[Mailer] ✅ SMTP connection verified — ready to send as ${process.env.EMAIL_USER}`)
    return true
  } catch (err) {
    console.error('[Mailer] ❌ SMTP verification failed:', err.message)
    console.error('[Mailer]    → Check EMAIL_USER and EMAIL_PASS in .env')
    console.error('[Mailer]    → Gmail requires a 16-char App Password (not your account password)')
    console.error('[Mailer]    → Generate one at: https://myaccount.google.com/apppasswords')
    return false
  }
}

/**
 * Send auto-generated login credentials to a newly created user
 *
 * @param {Object} opts
 * @param {string} opts.to       - Recipient email
 * @param {string} opts.name     - User's full name
 * @param {string} opts.userId   - Auto-generated user ID (e.g., H260001)
 * @param {string} opts.role     - 'student' | 'teacher' | 'staff'
 * @param {string} opts.tempPassword - The system generated temporary password
 */
const sendCredentials = async ({ to, name, userId, role, tempPassword, setPasswordUrl, loginUrl }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured in server')
    }

    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Account Created</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                🎓 College Management System
              </h1>
              <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Your account has been created successfully</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#374151;font-size:16px;margin:0 0 8px;">Dear <strong>${name}</strong>,</p>
              <p style="color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.6;">
                Welcome! Your <strong>${roleLabel}</strong> account has been created in the College Management System.
                Below are your login credentials. You will be prompted to change your password upon your first login.
              </p>

              <!-- Credentials Box -->
              <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:10px;padding:24px;margin-bottom:28px;">
                <h3 style="color:#1e40af;margin:0 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px;">
                  🔑 Login Information
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:14px;width:40%;font-weight:600;">User ID</td>
                    <td style="color:#111827;font-size:16px;font-weight:700;font-family:monospace;background:#fff;padding:10px 14px;border-radius:6px;border:1px solid #e5e7eb;">${userId}</td>
                  </tr>
                  ${tempPassword ? `<tr>
                    <td style="color:#6b7280;font-size:14px;width:40%;font-weight:600;">Password</td>
                    <td style="color:#111827;font-size:16px;font-weight:700;font-family:monospace;background:#fff;padding:10px 14px;border-radius:6px;border:1px solid #e5e7eb;">${tempPassword}</td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Login Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${setPasswordUrl || loginUrl || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'}"
                   style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  ${setPasswordUrl ? 'Set Your Password →' : 'Login to Your Account →'}
                </a>
              </div>

              <!-- Warning -->
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:20px;">
                <p style="color:#9a3412;font-size:13px;margin:0;">
                  ⚠️ <strong>Important:</strong> Please do not share these credentials with anyone.
                </p>
              </div>

              <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
                If you did not expect this email, please contact your institute administrator.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} College Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    const textBody = `
Dear ${name},

Your ${roleLabel} account has been created.

User ID: ${userId}
${tempPassword ? `Password: ${tempPassword}\n` : ''}
Please use the following link to ${setPasswordUrl ? 'set your password' : 'log in'}:
${setPasswordUrl || loginUrl || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'}

— College Management System
`

    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: `"College Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your CMS Login Credentials — ${roleLabel} Account`,
      text: textBody,
      html: htmlBody,
    })
    console.log(`[Mailer] Credentials email sent to ${to} — MessageId: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[Mailer] Failed to send email to', to, '—', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Send a generic notification email
 */
const sendNotification = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Mailer] EMAIL_USER or EMAIL_PASS not set — skipping notification')
    return { skipped: true }
  }

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"College Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    })
    return { success: true }
  } catch (err) {
    console.error('[Mailer] Failed to send notification to', to, '—', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Send OTP via Email
 */
const sendOtpEmail = async ({ to, otp }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Mailer] EMAIL_USER or EMAIL_PASS not set — skipping OTP email')
    return { success: true, warning: 'Skipped due to missing env vars' } // In dev mode without email setup, don't crash
  }

  const htmlBody = `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #2563eb; text-align: center;">CMS Verification</h2>
    <p>Your One-Time Password (OTP) for verification is:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f3f4f6; padding: 10px 20px; border-radius: 8px; color: #1f2937;">${otp}</span>
    </div>
    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
  </div>
  `

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"College Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your CMS Verification OTP: ${otp}`,
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: htmlBody,
    })
    console.log(`[Mailer] OTP sent to ${to}`)
    return { success: true }
  } catch (err) {
    console.error('[Mailer] Failed to send OTP email to', to, '—', err.message)
    return { success: false, error: err.message }
  }
}

module.exports = { sendCredentials, sendNotification, sendOtpEmail, verifyTransporter }
