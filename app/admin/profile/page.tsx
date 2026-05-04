'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'
import { Camera, User, Mail, Briefcase, Phone, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface AdminProfile {
  _id: string
  name: string
  email: string
  designation: string
  mobileNumber: string
  profilePicture: string
  status: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminProfilePage() {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const isDark = theme === 'dark'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    mobileNumber: ''
  })

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile')
        const data = await res.json()
        
        if (data.success) {
          setProfile(data.data)
          setFormData({
            name: data.data.name || '',
            designation: data.data.designation || '',
            mobileNumber: data.data.mobileNumber || ''
          })
        } else {
          error(data.message || 'Failed to fetch profile')
        }
      } catch (err) {
        console.error('Fetch profile error:', err)
        error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Save profile changes
  const handleSave = async () => {
    if (!formData.name || !formData.designation) {
      error('Name and designation are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setProfile(data.data)
        success('Profile updated successfully')
      } else {
        error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Update profile error:', err)
      error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('File size too large. Max 5MB allowed.')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      error('Invalid file type. Only JPG, PNG, WebP allowed.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/admin/profile/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        setProfile(prev => prev ? { ...prev, profilePicture: data.data.profilePicture } : null)
        success('Profile picture updated successfully')
      } else {
        error(data.message || 'Failed to upload image')
      }
    } catch (err) {
      console.error('Upload image error:', err)
      error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Admin Profile
      </h1>

      <div className={`rounded-2xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        {/* Header with Profile Picture */}
        <div className={`relative h-32 ${isDark ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-100 to-purple-100'}`}>
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isDark ? 'border-gray-800' : 'border-white'} ${uploading ? 'opacity-50' : ''}`}>
                {profile?.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <User size={48} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                )}
              </div>
              
              {/* Camera button */}
              <button
                onClick={handleImageClick}
                disabled={uploading}
                className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          {/* Name & Status */}
          <div className="mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {profile?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {profile?.designation}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                profile?.status === 'superadmin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {profile?.status}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Full Name *
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter your name"
              />
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                readOnly
                className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed ${
                  isDark
                    ? 'bg-gray-800/50 border-gray-700 text-gray-400'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                }`}
              />
            </div>

            {/* Designation */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} />
                  Designation *
                </div>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter your designation"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Mobile Number
                </div>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          {/* Account Info */}
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>Account Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full ${
                  profile?.isDisabled 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {profile?.isDisabled ? 'Disabled' : 'Active'}
                </span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>Member Since:</span>
                <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
              <div>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>Last Updated:</span>
                <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
