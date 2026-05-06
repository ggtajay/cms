/**
 * SMS utility — sends real SMS via Fast2SMS (India)
 *
 * Setup:
 *  1. Sign up at https://www.fast2sms.com and get your API key (free tier available)
 *  2. Add FAST2SMS_API_KEY=<your_key> to backend/.env
 *
 * Falls back to console mock when FAST2SMS_API_KEY is not set (safe for local dev).
 * Uses Node 18+ native fetch — no extra dependencies required.
 */

/**
 * Send a plain-text SMS to a phone number.
 * @param {string} phone   - 10-digit Indian mobile number (e.g. "9876543210")
 * @param {string} message - Message text (max ~160 chars for single SMS)
 * @returns {Promise<boolean>} true on success, false on failure
 */
const sendSMS = async (phone, message) => {
  // Sanitize: strip leading +91 / 91 / 0 country/trunk prefix
  const cleanPhone = String(phone || '').replace(/^\+?91|^0/, '').trim()

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn('[SMS] Invalid or missing phone number — skipped')
    return false
  }

  // Dev fallback: log to console when API key is not configured
  if (!process.env.FAST2SMS_API_KEY) {
    console.log('\n=================== SMS (DEV MODE — no API key) ===================')
    console.log(`To      : ${cleanPhone}`)
    console.log(`Message : ${message}`)
    console.log('====================================================================\n')
    return true
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        route: 'q',          // 'q' = Quick route (requires DLT for OTP messages)
        message,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.return) {
      console.error('[SMS] Fast2SMS rejected the request:', JSON.stringify(data.message || data))
      return false
    }

    console.log(`[SMS] Message sent to ${cleanPhone} — RequestId: ${data.request_id || 'N/A'}`)
    return true
  } catch (err) {
    console.error(`[SMS] Network/API error while sending to ${cleanPhone}:`, err.message)
    return false
  }
}

/**
 * Send an OTP via SMS.
 * @param {string} phone - Recipient mobile number
 * @param {string} otp   - 6-digit OTP code
 */
const sendOtpSms = async (phone, otp) => {
  // Sanitize phone
  const cleanPhone = String(phone || '').replace(/^\+?91|^0/, '').trim()

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn('[SMS] Invalid or missing phone number for OTP — skipped')
    return false
  }

  if (!process.env.FAST2SMS_API_KEY) {
    console.log(`\n[SMS DEV] OTP for ${cleanPhone}: ${otp}\n`)
    return true
  }

  try {
    // Use the 'otp' route — specifically designed for OTPs, no DLT required
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        flash: 0,
        numbers: cleanPhone,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.return) {
      console.error('[SMS] Fast2SMS OTP route failed:', JSON.stringify(data.message || data))
      return false
    }

    console.log(`[SMS] OTP sent to ${cleanPhone} — RequestId: ${data.request_id || 'N/A'}`)
    return true
  } catch (err) {
    console.error(`[SMS] Network/API error while sending OTP to ${cleanPhone}:`, err.message)
    return false
  }
}

module.exports = { sendSMS, sendOtpSms }
