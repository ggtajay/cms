/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function OtpVerification({ email, mobile, onVerified, onCancel }) {
  const [step, setStep] = useState(1) // 1: Request OTPs, 2: Verify OTPs
  const [emailOtp, setEmailOtp] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [emailVerified, setEmailVerified] = useState(false)
  const [mobileVerified, setMobileVerified] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const requestOtps = async () => {
    setLoading(true)
    setError('')
    try {
      // Send Email OTP
      await axios.post('/api/otp/send-email-otp', { email, mobile })
      // Send Mobile OTP
      await axios.post('/api/otp/send-mobile-otp', { email, mobile })
      setStep(2)
      setCooldown(60) // 1 minute cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTPs')
    } finally {
      setLoading(false)
    }
  }

  const verifyEmailOtp = async () => {
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/otp/verify-email-otp', { email, mobile, otp: emailOtp })
      setEmailVerified(true)
      checkAllVerified(true, mobileVerified)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyMobileOtp = async () => {
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/otp/verify-mobile-otp', { email, mobile, otp: mobileOtp })
      setMobileVerified(true)
      checkAllVerified(emailVerified, true)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Mobile OTP')
    } finally {
      setLoading(false)
    }
  }

  const checkAllVerified = (isEv, isMv) => {
    if (isEv && isMv) {
      setTimeout(() => onVerified(), 1000)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Identity Verification</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            We need to verify your email (<span className="font-semibold">{email}</span>) and mobile number (<span className="font-semibold">{mobile}</span>) before proceeding.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={requestOtps}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTPs'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email OTP Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              <span>Email OTP</span>
              {emailVerified && <span className="text-green-600 text-xs font-bold">✓ Verified</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={emailVerified}
                className="flex-1 p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {!emailVerified && (
                <button
                  onClick={verifyEmailOtp}
                  disabled={loading || emailOtp.length !== 6}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          {/* Mobile OTP Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex justify-between">
              <span>Mobile OTP</span>
              {mobileVerified && <span className="text-green-600 text-xs font-bold">✓ Verified</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={mobileVerified}
                className="flex-1 p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {!mobileVerified && (
                <button
                  onClick={verifyMobileOtp}
                  disabled={loading || mobileOtp.length !== 6}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          {!emailVerified || !mobileVerified ? (
            <div className="pt-4 text-center">
              <button
                onClick={requestOtps}
                disabled={cooldown > 0 || loading}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:text-gray-400"
              >
                {cooldown > 0 ? `Resend OTPs in ${cooldown}s` : 'Resend OTPs'}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 text-green-700 rounded-xl text-center font-medium"
            >
              Verification Successful! Proceeding...
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
