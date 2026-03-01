'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import { useTheme } from '../../../../contexts/ThemeContext'
import Swal from 'sweetalert2'

interface LeaveData {
  _id: string
  userName: string
  userEmail: string
  fromDate: string
  toDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

interface LeaveProps {
  canEdit?: boolean
  canApprove?: boolean
}

export default function Leave({ canEdit = false, canApprove = false }: LeaveProps) {
  const { theme } = useTheme()

  const [leaves, setLeaves] = useState<LeaveData[]>([])
  const [selected, setSelected] = useState<LeaveData | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const limit = 10

  /* ================= FETCH (Infinite Scroll) ================= */
  const fetchLeaves = useCallback(async (pageNumber: number, append: boolean = false) => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(
        `/api/admin/Leave/get-all?page=${pageNumber}&limit=${limit}`
      )
      const data = await res.json()

      if (data.success) {
        if (append) {
          setLeaves(prev => {
            const existingIds = new Set(prev.map((l: any) => l._id))
            const newLeaves = data.data.filter((l: any) => !existingIds.has(l._id))
            return [...prev, ...newLeaves]
          })
        } else {
          setLeaves(data.data)
        }
        setHasMore(data.pagination?.hasMore || data.hasMore || pageNumber < data.totalPages)
      }
    } catch {
      console.error('Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }, [loading])

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {

    await fetch('/api/admin/Leave/update-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaveId: id,
        status,
        rejectionReason
      })
    })

    setSelected(null)
    setPage(1)
    fetchLeaves(1, false)
  }

  /* ================= DELETE ================= */

  const deleteLeave = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Leave Request?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Yes, Delete'
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch('/api/admin/Leave/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveId: id })
      })

      if (res.ok) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Leave request has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        setPage(1)
        fetchLeaves(1, false)
      } else {
        throw new Error('Failed to delete')
      }
    } catch {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete leave request.',
        icon: 'error'
      })
    }
  }

  // Initial load
  useEffect(() => {
    fetchLeaves(1, false)
  }, [])

  // Auto load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchLeaves(nextPage, true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, fetchLeaves])

  return (
    <div className="mt-8">

      {/* ================= TABLE ================= */}

      <div className={`overflow-x-auto rounded-xl border transition-colors ${theme === 'dark'
          ? 'border-gray-700'
          : 'border-gray-200'
        }`}>
        <table className="w-full text-sm">

          <thead className={`border-b transition-colors text-left ${theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
            <tr>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>S.No</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Username</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Email</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>From</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>To</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Days</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</th>
              <th className={`p-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave, index) => (
              <tr
                key={leave._id}
                className={`border-b transition-colors ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/40'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  {index + 1}
                </td>
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{leave.userName}</td>
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{leave.userEmail}</td>
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  {new Date(leave.fromDate).toDateString()}
                </td>
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  {new Date(leave.toDate).toDateString()}
                </td>
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{leave.totalDays}</td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs
                    ${leave.status === 'approved'
                      ? 'bg-green-600 text-white'
                      : leave.status === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-yellow-500 text-black'}
                  `}>
                    {leave.status}
                  </span>
                </td>

                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => setSelected(leave)}
                    className="text-blue-500 hover:scale-110 cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => canEdit && deleteLeave(leave._id)}
                    disabled={!canEdit}
                    className={`${canEdit ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                      } text-red-500`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* ================= LOADING / NO MORE ================= */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
            }`} />
        </div>
      )}

      {!hasMore && leaves.length > 0 && (
        <div className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
          No more leaves to load
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-end z-50"
          >
            <motion.div
              initial={{ x: '100%', y: 0 }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: '100%', y: 0 }}
              transition={{ duration: 0.4 }}
              className={`w-[420px] max-h-[85vh] overflow-y-auto mr-10 p-6 rounded-2xl backdrop-blur-2xl shadow-2xl transition-colors ${theme === 'dark'
                  ? 'bg-black/40 border border-blue-500/30'
                  : 'bg-white/90 border border-blue-500/50'
                }`}
            >

              <div className="flex justify-between mb-6">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  Leave Details
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className={`transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  ✖
                </button>
              </div>

              <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>

                <div><b>Name:</b> {selected.userName}</div>
                <div><b>Email:</b> {selected.userEmail}</div>
                <div><b>From:</b> {new Date(selected.fromDate).toDateString()}</div>
                <div><b>To:</b> {new Date(selected.toDate).toDateString()}</div>
                <div><b>Total Days:</b> {selected.totalDays}</div>

                <div>
                  <b>Reason:</b>
                  <div className={`mt-1 p-3 rounded transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    {selected.reason}
                  </div>
                </div>

              </div>

              {selected.status === 'pending' && (
                <div className="mt-6 space-y-3">

                  <button
                    onClick={async () => {
                      if (!canApprove) return
                      const result = await Swal.fire({
                        title: 'Approve Leave?',
                        text: 'Are you sure you want to approve this leave request?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#16a34a',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Yes, Approve'
                      })
                      if (result.isConfirmed) {
                        await updateStatus(selected._id, 'approved')
                        Swal.fire({
                          title: 'Approved!',
                          text: 'Leave request has been approved.',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false
                        })
                      }
                    }}
                    disabled={!canApprove}
                    className={`w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded ${!canApprove ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  >
                    Approve
                  </button>

                  <textarea
                    placeholder="Rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={!canApprove}
                    className={`w-full p-2 rounded transition-colors ${theme === 'dark'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                      } ${!canApprove ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />

                  <button
                    onClick={async () => {
                      if (!canApprove) return
                      if (!rejectionReason.trim()) {
                        Swal.fire({
                          title: 'Error!',
                          text: 'Please provide a rejection reason.',
                          icon: 'error'
                        })
                        return
                      }
                      const result = await Swal.fire({
                        title: 'Reject Leave?',
                        text: 'Are you sure you want to reject this leave request?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc2626',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Yes, Reject'
                      })
                      if (result.isConfirmed) {
                        await updateStatus(selected._id, 'rejected')
                        Swal.fire({
                          title: 'Rejected!',
                          text: 'Leave request has been rejected.',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false
                        })
                      }
                    }}
                    disabled={!canApprove}
                    className={`w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded ${!canApprove ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                  >
                    Reject
                  </button>

                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
