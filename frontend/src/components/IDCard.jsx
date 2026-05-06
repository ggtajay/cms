import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const IDCard = ({ userDetails, role }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Constructing string to encode in QR
        const qrText = `Name: ${userDetails.name}\nID: ${role === 'student' ? userDetails.studentId : userDetails.facultyId}\nRole: ${role.toUpperCase()}`
        const url = await QRCode.toDataURL(qrText, {
          width: 100,
          margin: 1,
          color: { dark: '#1e40af', light: '#ffffff' }
        })
        setQrCodeDataUrl(url)
      } catch (err) {
        console.error('Failed to generate QR', err)
      }
    }
    
    if (userDetails) generateQR()
  }, [userDetails, role])

  if (!userDetails) return null

  const isStudent = role === 'student'
  const idNumber = isStudent ? userDetails.studentId : userDetails.facultyId
  const primaryRole = isStudent ? userDetails.course : userDetails.designation
  const secondaryRole = userDetails.department
  
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + (isStudent ? 4 : 5)) // Approximation
  
  // Institute details can be driven by context or config in future
  const instituteName = 'Modern Institute of Technology'

  return (
    <div className="w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative id-card-container mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-center">
        <h2 className="text-white font-bold text-lg leading-tight">{instituteName}</h2>
        <p className="text-blue-100 text-xs mt-1 uppercase tracking-widest">{role} Identity Card</p>
      </div>
      
      {/* Photo and ID */}
      <div className="relative pt-6 pb-2 px-6 text-center">
        <div className="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 z-10 relative -mt-16">
          <img 
            src={userDetails.profileImage || 'https://via.placeholder.com/150'} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h3 className="mt-3 text-xl font-bold text-gray-800">{userDetails.name}</h3>
        <p className="text-sm font-semibold text-blue-600 mb-1">{primaryRole}</p>
        <p className="text-xs text-gray-500">{secondaryRole}</p>
      </div>

      {/* Details Grid */}
      <div className="px-6 py-4 bg-gray-50/50">
        <div className="space-y-2">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">ID Number</span>
            <span className="text-sm font-bold text-gray-800">{idNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">DOB</span>
            <span className="text-sm font-medium text-gray-800">
              {new Date(userDetails.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Blood Group</span>
            <span className="text-sm font-medium text-red-600">{userDetails.bloodGroup || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
            <span className="text-sm font-medium text-gray-800">{userDetails.phone}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase">Valid Until</span>
            <span className="text-sm font-medium text-gray-800">{validUntil.getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* QR Code and Footer */}
      <div className="p-4 flex items-center justify-between border-t border-gray-100">
        <div>
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code" className="w-16 h-16" />
          ) : (
            <div className="w-16 h-16 bg-gray-200" />
          )}
        </div>
        <div className="text-right">
          <div className="h-8 border-b border-gray-300 mb-1 w-24 ml-auto"></div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Auth Signature</p>
        </div>
      </div>

      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .id-card-container, .id-card-container * { visibility: visible; }
          .id-card-container { position: absolute; left: 0; top: 0; margin: 0; box-shadow: none; border: 1px solid #000; }
        }
      `}} />
    </div>
  )
}

export default IDCard
