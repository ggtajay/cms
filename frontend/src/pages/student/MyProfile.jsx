import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdEmail, MdLock, MdSchool, MdUploadFile } from 'react-icons/md'
import Sidebar from '../../components/Sidebar'
import ProfileCompletion from '../../components/ProfileCompletion'

const defaultProfileForm = {
  name: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: 'male',
  bloodGroup: '',
  category: '',
  aadhaar: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  parentRelation: ''
}

const defaultPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const formatDateInput = (value) => {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

const StudentProfile = () => {
  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const [user, setUser] = useState(currentUser)
  const [profile, setProfile] = useState(null)
  
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm)
  
  // Document states
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [documents, setDocuments] = useState({
    marksheet10th: null,
    marksheet12th: null,
    casteCertificate: null,
    bonafideCertificate: null,
    aadhaarDocument: null
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingDocs, setSavingDocs] = useState(false)
  const [loading, setLoading] = useState(true)

  const config = { headers: { Authorization: `Bearer ${token}` } }
  const sendDebugLog = (hypothesisId, location, message, data = {}) => {
    // #region agent log
    fetch('http://127.0.0.1:7933/ingest/beab5d74-2c64-4e0b-9e7d-4886ce253ad4', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f4ed93' },
      body: JSON.stringify({
        sessionId: 'f4ed93',
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        runId: 'pre-fix',
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now()
      })
    }).catch(() => {})
    // #endregion
  }

  const fetchProfile = async () => {
    try {
      sendDebugLog('H1', 'frontend/src/pages/student/MyProfile.jsx:fetchProfile', 'Fetching student profile', {
        endpoint: '/api/auth/profile'
      })
      const res = await axios.get('/api/auth/profile', config)
      sendDebugLog('H1', 'frontend/src/pages/student/MyProfile.jsx:fetchProfile', 'Student profile fetch succeeded', {
        status: res.status,
        hasUser: Boolean(res.data?.user),
        hasProfile: Boolean(res.data?.profile)
      })
      const nextUser = res.data.user
      const nextProfile = res.data.profile

      setUser(nextUser)
      setProfile(nextProfile)
      setProfileForm({
        name: nextUser.name || '',
        phone: nextUser.phone || nextProfile?.phone || '',
        address: nextUser.address || nextProfile?.address || '',
        dateOfBirth: formatDateInput(nextUser.dateOfBirth || nextProfile?.dateOfBirth),
        gender: nextUser.gender || nextProfile?.gender || 'male',
        bloodGroup: nextProfile?.bloodGroup || '',
        category: nextProfile?.category || '',
        aadhaar: nextProfile?.aadhaar || '',
        parentName: nextProfile?.parentName || '',
        parentPhone: nextProfile?.parentPhone || '',
        parentEmail: nextProfile?.parentEmail || '',
        parentRelation: nextProfile?.parentRelation || ''
      })
    } catch (error) {
      sendDebugLog('H1', 'frontend/src/pages/student/MyProfile.jsx:fetchProfile', 'Student profile fetch failed', {
        status: error.response?.status || null,
        message: error.response?.data?.message || error.message
      })
      toast.error(error.response?.data?.message || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    sendDebugLog('H1', 'frontend/src/pages/student/MyProfile.jsx:mount', 'Student profile component mounted', {
      hasToken: Boolean(token),
      hasCurrentUser: Boolean(currentUser)
    })
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedImage) {
      setPreviewImage('')
      return
    }
    const objectUrl = URL.createObjectURL(selectedImage)
    setPreviewImage(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedImage])

  const updateLocalUser = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...nextUser }))
  }

  const onProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  const onPasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  const onDocumentChange = (e) => setDocuments({ ...documents, [e.target.name]: e.target.files[0] })

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const submitData = new FormData()
      Object.entries(profileForm).forEach(([key, value]) => submitData.append(key, value))
      if (selectedImage) submitData.append('profileImage', selectedImage)

      const res = await axios.put('/api/auth/profile', submitData, config)
      updateLocalUser(res.data.user)
      setProfile(res.data.profile)
      setSelectedImage(null)
      toast.success(res.data.message)
      fetchProfile() // Refresh to get updated completion %
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const uploadDocs = async (e) => {
    e.preventDefault()
    setSavingDocs(true)
    try {
      const submitData = new FormData()
      Object.entries(documents).forEach(([key, file]) => {
        if (file) submitData.append(key, file)
      })

      const res = await axios.post(`/api/students/${profile._id}/documents`, submitData, config)
      setProfile(res.data.student)
      toast.success('Documents uploaded successfully')
      fetchProfile()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload documents')
    } finally {
      setSavingDocs(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      const res = await axios.put('/api/auth/me/password', passwordForm, config)
      setPasswordForm(defaultPasswordForm)
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const avatarSrc = previewImage || profile?.profileImage || user?.profileImage || ''

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your contact details, documents, and track profile completion.
          </p>
        </div>

        <div className="p-6">
          <ProfileCompletion 
            completionPercentage={profile?.profileCompletion || 0} 
            role={user?.role} 
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Sidebar Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user?.name || 'Profile'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-800 mt-4">{user?.name}</h2>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {profile?.studentId || 'ID Pending'}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {profile?.department || 'Department'}
                  </span>
                </div>

                <label className="w-full mt-6 text-left">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MdEmail className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Official Email</p>
                    <p className="text-sm text-gray-800 font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdSchool className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Course / Sem</p>
                    <p className="text-sm text-gray-800 font-medium">{profile?.course} (Sem {profile?.semester})</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Forms */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Personal Details Form */}
              <form onSubmit={saveProfile} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Full Name</span>
                    <input type="text" name="name" value={profileForm.name} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Phone</span>
                    <input type="text" name="phone" value={profileForm.phone} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</span>
                    <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Gender</span>
                    <select name="gender" value={profileForm.gender} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Blood Group</span>
                    <select name="bloodGroup" value={profileForm.bloodGroup} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                      <option value="">Select...</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Category</span>
                    <select name="category" value={profileForm.category} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                      <option value="">Select...</option>
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="md:col-span-2">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</span>
                    <input type="text" name="aadhaar" value={profileForm.aadhaar} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </label>
                  <label className="md:col-span-2">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Address</span>
                    <textarea name="address" value={profileForm.address} onChange={onProfileChange} rows="2" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </label>
                </div>

                <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">Guardian Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</span>
                    <input type="text" name="parentName" value={profileForm.parentName} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</span>
                    <input type="text" name="parentPhone" value={profileForm.parentPhone} onChange={onProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={savingProfile} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>

              {/* Document Uploads Form */}
              <form onSubmit={uploadDocs} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Document Uploads</h3>
                <p className="text-sm text-gray-500 mb-4">Upload scanned copies (PDF/Images) of your mandatory documents. Max size 10MB.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: '10th Marksheet', name: 'marksheet10th' },
                    { label: '12th Marksheet', name: 'marksheet12th' },
                    { label: 'Caste Certificate', name: 'casteCertificate' },
                    { label: 'Bonafide / Domicile', name: 'bonafideCertificate' },
                    { label: 'Aadhaar Document', name: 'aadhaarDocument' }
                  ].map(doc => (
                    <div key={doc.name} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-sm text-gray-800 mb-1">{doc.label}</p>
                        {profile?.documents?.[doc.name] ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Uploaded</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Pending</span>
                        )}
                      </div>
                      <input 
                        type="file" 
                        name={doc.name} 
                        onChange={onDocumentChange} 
                        accept="image/*,.pdf"
                        className="mt-3 text-xs w-full" 
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={savingDocs} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    <MdUploadFile size={20} />
                    {savingDocs ? 'Uploading...' : 'Upload Documents'}
                  </button>
                </div>
              </form>

              {/* Change Password Form */}
              <form onSubmit={changePassword} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Current Password</span>
                    <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={onPasswordChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">New Password</span>
                    <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={onPasswordChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                  </label>
                  <label>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</span>
                    <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={onPasswordChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={savingPassword} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                    <MdLock size={18} />
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
