import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdEmail,
  MdLock,
  MdSchool
} from 'react-icons/md'
import Sidebar from '../../components/Sidebar'

const defaultProfileForm = {
  name: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: 'male',
  qualification: '',
  specialization: '',
  experience: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: ''
}

const defaultPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const formatDateInput = (value) => {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().split('T')[0]
}

const TeacherProfile = () => {
  const token = localStorage.getItem('token')
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const [user, setUser] = useState(currentUser)
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
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
          qualification: nextProfile?.qualification || '',
          specialization: nextProfile?.specialization || '',
          experience: nextProfile?.experience ?? '',
          emergencyContactName: nextProfile?.emergencyContact?.name || '',
          emergencyContactPhone: nextProfile?.emergencyContact?.phone || '',
          emergencyContactRelation: nextProfile?.emergencyContact?.relation || ''
        })
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token])

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
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...nextUser
    }))
  }

  const onProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const onPasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const onImageChange = (e) => {
    setSelectedImage(e.target.files[0] || null)
  }

  const saveProfile = async (e) => {
    e.preventDefault()

    if (!profileForm.name?.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setSavingProfile(true)
    try {
      const submitData = new FormData()

      // Only append values that are actually filled in — sending null/undefined
      // as FormData stringifies them to "null"/"undefined" on the server.
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          submitData.append(key, value)
        }
      })

      if (selectedImage) {
        submitData.append('profileImage', selectedImage)
      }

      // Do NOT manually set Content-Type when sending FormData — axios will
      // automatically set multipart/form-data with the correct boundary.
      const res = await axios.put('/api/auth/me/profile', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      updateLocalUser(res.data.user)
      setProfile(res.data.profile)
      setSelectedImage(null)
      toast.success(res.data.message || 'Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)

    try {
      const res = await axios.put('/api/auth/me/password', passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
            Update your personal details and profile photo. Official institute fields stay read-only.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 xl:col-span-1">
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
              <p className="text-gray-500">{profile?.designation || 'Teacher'}</p>

              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {profile?.employeeId || 'Employee ID'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {profile?.department || 'Department'}
                </span>
              </div>

              <label className="w-full mt-6 text-left">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Change Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
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
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="text-sm text-gray-800 font-medium">{profile?.designation}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MdSchool className="text-gray-400 mt-1" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {profile?.joiningDate
                      ? new Date(profile.joiningDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-6">
            <form onSubmit={saveProfile} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Editable Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Phone</span>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileForm.dateOfBirth}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Gender</span>
                  <select
                    name="gender"
                    value={profileForm.gender}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="md:col-span-2">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Address</span>
                  <textarea
                    name="address"
                    value={profileForm.address}
                    onChange={onProfileChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Qualification</span>
                  <input
                    type="text"
                    name="qualification"
                    value={profileForm.qualification}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Specialization</span>
                  <input
                    type="text"
                    name="specialization"
                    value={profileForm.specialization}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</span>
                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={profileForm.experience}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
              </div>

              <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Name</span>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={profileForm.emergencyContactName}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Phone</span>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={profileForm.emergencyContactPhone}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Relation</span>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={profileForm.emergencyContactRelation}
                    onChange={onProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Profile...' : 'Save Profile'}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Official Institute Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Employee ID</p>
                  <p className="text-gray-800 font-semibold">{profile?.employeeId || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Department</p>
                  <p className="text-gray-800 font-semibold">{profile?.department || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Designation</p>
                  <p className="text-gray-800 font-semibold">{profile?.designation || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Subjects Assigned</p>
                  <p className="text-gray-800 font-semibold">
                    {profile?.subjects?.length ? profile.subjects.join(', ') : 'None assigned'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={changePassword} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Current Password</span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={onPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">New Password</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={onPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={onPasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  <MdLock size={18} />
                  {savingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile
