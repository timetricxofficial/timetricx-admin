'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'
import { X, ExternalLink, CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface ProjectLinkData {
  _id: string
  projectName: string
  liveUrl: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: string
  createdAt: string
  user: {
    name: string
    email: string
    profilePicture: string
    mobileNumber: string
    workingRole: string
  }
}

interface ProjectLinksModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
}

export default function ProjectLinksModal({ isOpen, onClose, projectName }: ProjectLinksModalProps) {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [links, setLinks] = useState<ProjectLinkData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && projectName) {
      fetchProjectLinks()
    }
  }, [isOpen, projectName])

  const fetchProjectLinks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/projects/project-links?projectName=${encodeURIComponent(projectName)}`)
      const data = await res.json()

      if (data.success) {
        setLinks(data.data || [])
      } else {
        error('Failed to fetch project links')
      }
    } catch (err) {
      console.error('Error fetching project links:', err)
      error('Failed to fetch project links')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (linkId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      const res = await fetch(`/api/admin/project/links-action/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId })
      })

      if (res.ok) {
        if (action === 'delete') {
          success('Project link deleted successfully')
        } else {
          success(`Project link ${action}d successfully`)
        }
        fetchProjectLinks()
      } else {
        error(`Failed to ${action} project link`)
      }
    } catch (err) {
      console.error(`Error ${action} link:`, err)
      error(`Failed to ${action} project link`)
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal - Centered with max-width */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl max-h-[85vh] rounded-xl z-50 overflow-hidden flex flex-col shadow-2xl ${
              theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Project Links: {projectName}
                </h2>
                <p className={`mt-0.5 text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {links.length} submission{links.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : links.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-32 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <p className="text-base">No project links found</p>
                  <p className="text-xs mt-1">No submissions for this project yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <motion.div
                      key={link._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative rounded-lg border p-3 ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Top Right Buttons */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(link.status)}`}>
                          {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                        </span>

                        {/* Action Buttons */}
                        {link.status !== 'approved' && (
                          <button
                            onClick={() => handleAction(link._id, 'approve')}
                            title="Approve"
                            className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition"
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}
                        {link.status !== 'rejected' && (
                          <button
                            onClick={() => handleAction(link._id, 'reject')}
                            title="Reject"
                            className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                          >
                            <XCircle size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(link._id, 'delete')}
                          title="Delete"
                          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          onClick={() => openLink(link.liveUrl)}
                          title="Open Link"
                          className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>

                      {/* Card Content - Grid Layout */}
                      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start pt-8">
                        {/* Left - User Image */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            {link.user.profilePicture ? (
                              <img
                                src={link.user.profilePicture}
                                alt={link.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-base font-bold ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {link.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Middle - User Info */}
                        <div className="min-w-0">
                          <h3 className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {link.user.name}
                          </h3>
                          <div className={`mt-0.5 space-y-0 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <p className="flex items-center gap-1.5">
                              <span className="font-medium">Email:</span>
                              <span className="truncate">{link.user.email}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="font-medium">Mobile:</span>
                              <span>{link.user.mobileNumber}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="font-medium">Role:</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                theme === 'dark'
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {link.user.workingRole}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Right - Project Info Box */}
                        <div className={`flex-shrink-0 w-44 p-2.5 rounded ${
                          theme === 'dark' ? 'bg-gray-700/50' : 'bg-white border border-gray-200'
                        }`}>
                          <p className={`text-[10px] font-medium mb-0.5 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            Project
                          </p>
                          <p className={`font-medium text-xs mb-1.5 truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {link.projectName}
                          </p>
                          <p className={`text-[10px] font-medium mb-0.5 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            Live URL
                          </p>
                          <a
                            href={link.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-600 hover:underline block truncate"
                            title={link.liveUrl}
                          >
                            {link.liveUrl}
                          </a>
                          <p className={`text-[10px] mt-1.5 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            Submitted: {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
