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

export default function ProjectLinksModal({
  isOpen,
  onClose,
  projectName
}: ProjectLinksModalProps) {
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
      const res = await fetch(
        `/api/admin/projects/project-links?projectName=${encodeURIComponent(projectName)}`
      )
      const data = await res.json()

      if (data.success) {
        setLinks(data.data || [])
      } else {
        error('Failed to fetch project links')
      }
    } catch (err) {
      console.error(err)
      error('Failed to fetch project links')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED LINK OPEN
  const openLink = (url: string) => {
    const formattedUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`

    window.open(formattedUrl, '_blank')
  }

  const handleAction = async (
    linkId: string,
    action: 'approve' | 'reject' | 'delete'
  ) => {
    try {
      const res = await fetch(
        `/api/admin/project/links-action/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId })
        }
      )

      if (res.ok) {
        success(
          action === 'delete'
            ? 'Project link deleted successfully'
            : `Project link ${action}d successfully`
        )
        fetchProjectLinks()
      } else {
        error(`Failed to ${action} project link`)
      }
    } catch (err) {
      console.error(err)
      error(`Failed to ${action} project link`)
    }
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl max-h-[90vh] rounded-xl z-50 overflow-hidden flex flex-col shadow-2xl ${
              theme === 'dark'
                ? 'bg-[#1a1a1a] border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-5 border-b ${
                theme === 'dark'
                  ? 'border-gray-700'
                  : 'border-gray-200'
              }`}
            >
              <div>
                <h2
                  className={`text-xl font-bold ${
                    theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  Project Links: {projectName}
                </h2>
                <p
                  className={`text-sm ${
                    theme === 'dark'
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}
                >
                  {links.length} submission
                  {links.length !== 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center text-gray-500">
                  No project links found
                </div>
              ) : (
                <div className="space-y-5">
                  {links.map((link) => (
                    <motion.div
                      key={link._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative rounded-xl border p-6 hover:shadow-lg hover:scale-[1.01] transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Top Right Icons */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            link.status
                          )}`}
                        >
                          {link.status}
                        </span>

                        {link.status !== 'approved' && (
                          <button
                            onClick={() =>
                              handleAction(link._id, 'approve')
                            }
                            className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}

                        {link.status !== 'rejected' && (
                          <button
                            onClick={() =>
                              handleAction(link._id, 'reject')
                            }
                            className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <XCircle size={14} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleAction(link._id, 'delete')
                          }
                          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Trash2 size={14} />
                        </button>

                        <button
                          onClick={() =>
                            openLink(link.liveUrl)
                          }
                          className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>

                      {/* Card Content - Better Layout */}
                      <div className="flex gap-6">
                        {/* Left - User Image */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            {link.user.profilePicture ? (
                              <img
                                src={link.user.profilePicture}
                                alt={link.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center font-bold text-xl ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {link.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Middle - User Info */}
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {link.user.name}
                          </h3>
                          <div className={`mt-1 space-y-1 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <p>
                              <span className="font-medium">Email:</span> {link.user.email}
                            </p>
                            <p>
                              <span className="font-medium">Mobile:</span> {link.user.mobileNumber}
                            </p>
                            <p>
                              <span className="font-medium">Role:</span>
                              <span className={`ml-2 px-3 py-1 text-xs rounded ${
                                theme === 'dark'
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {link.user.workingRole}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Right - Project Info */}
                        <div className="flex-1 max-w-sm mr-60">
                          <div className={`rounded-lg p-4 border-l-4 ${
                            theme === 'dark' 
                              ? 'bg-gray-700/30 border-blue-500' 
                              : 'bg-blue-50 border-blue-500'
                          }`}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full ${
                                link.status === 'approved' 
                                  ? 'bg-green-500' 
                                  : link.status === 'rejected' 
                                  ? 'bg-red-500' 
                                  : 'bg-yellow-500'
                              }`}></div>
                              <span className={`text-xs font-semibold uppercase tracking-wide ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {link.status}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <p className={`text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Project
                                </p>
                                <p className={`font-semibold text-sm ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {link.projectName}
                                </p>
                              </div>
                              
                              <div>
                                <p className={`text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Live URL
                                </p>
                                <div className={`p-2 rounded text-xs font-mono break-all ${
                                  theme === 'dark' ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
                                }`}>
                                  {link.liveUrl}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className={`text-xs ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Submitted
                                </span>
                                <span className={`text-xs font-medium ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {new Date(link.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
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
