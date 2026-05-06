import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdCheckCircle, MdUpload, MdPerson } from 'react-icons/md'

const Onboarding = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  
  // Files for upload
  const [files, setFiles] = useState({
    photo: null,
    marksheet10th: null,
    marksheet12th: null,
    aadhaarDocument: null,
  })

  useEffect(() => {
    // If they somehow are fully complete, redirect to dashboard
    if (user.profileCompletion >= 100) {
      navigate(`/${user.role}/dashboard`)
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/me/profile', config)
        setProfile(res.data.profile)
      } catch (err) {
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // We only force document upload for students in this MVP onboarding
    // since Admin usually fills the text details
    if (user.role === 'student') {
      const formData = new FormData()
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file)
      })

      if (!files.photo || !files.marksheet10th || !files.marksheet12th) {
        toast.error('Please upload all required documents (Photo, 10th, 12th)')
        return
      }

      try {
        const res = await axios.post(`/api/students/${profile._id}/documents`, formData, config)
        
        // After successful upload, refresh token payload essentially by updating local user
        const newCompletion = res.data.student.profileCompletion
        const updatedUser = { ...user, profileCompletion: newCompletion }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        toast.success('Onboarding complete! Welcome.')
        setTimeout(() => {
          navigate(`/${user.role}/dashboard`)
        }, 1500)
      } catch (err) {
        toast.error('Failed to complete onboarding')
      }
    } else {
      // For teachers, call the profile API to mark onboarding as complete server-side
      try {
        await axios.put('/api/auth/me/profile', {}, config)
        const updatedUser = { ...user, profileCompletion: 100 }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        toast.success('Onboarding complete! Welcome.')
        setTimeout(() => {
          navigate(`/${user.role}/dashboard`)
        }, 1000)
      } catch (err) {
        toast.error('Failed to complete onboarding')
      }
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-3xl"></div>

      <div className="max-w-2xl w-full z-10 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <MdPerson className="text-blue-600 text-4xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to the CMS! Please upload your required documents to access your dashboard.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start">
            <MdCheckCircle className="text-blue-500 text-xl mr-3 mt-0.5" />
            <p className="text-sm text-blue-800">
              Your academic and personal details have been pre-filled by the administrator. 
              To finish setup, you must provide your compliance documents.
            </p>
          </div>

          {user.role === 'student' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Photo Upload */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <MdUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input name="photo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{files.photo ? files.photo.name : 'PNG, JPG up to 2MB'}</p>
                    </div>
                  </div>
                </div>

                {/* Aadhaar Upload */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card (Optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <MdUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input name="aadhaarDocument" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{files.aadhaarDocument ? files.aadhaarDocument.name : 'PDF, JPG up to 5MB'}</p>
                    </div>
                  </div>
                </div>

                {/* 10th Marksheet */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">10th Marksheet *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <MdUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input name="marksheet10th" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{files.marksheet10th ? files.marksheet10th.name : 'PDF, JPG up to 5MB'}</p>
                    </div>
                  </div>
                </div>

                {/* 12th Marksheet */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">12th Marksheet *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <MdUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input name="marksheet12th" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">{files.marksheet12th ? files.marksheet12th.name : 'PDF, JPG up to 5MB'}</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Submit & Continue to Dashboard
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Acknowledge & Continue
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Onboarding
