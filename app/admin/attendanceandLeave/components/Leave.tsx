'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Trash2 } from 'lucide-react'
import { useTheme } from '../../../../contexts/ThemeContext'

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

export default function Leave() {
  const { theme } = useTheme()

  const [leaves, setLeaves] = useState<LeaveData[]>([])
  const [selected, setSelected] = useState<LeaveData | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 10

  useEffect(() => {
    fetchLeaves(page)
  }, [page])

  const fetchLeaves = async (pageNumber: number) => {
    const res = await fetch(
      `/api/admin/Leave/get-all?page=${pageNumber}&limit=${limit}`
    )
    const data = await res.json()

    if (data.success) {
      setLeaves(data.data)
      setTotalPages(data.totalPages)
    }
  }

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {

    await fetch('/api/admin/leave/update-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaveId: id,
        status,
        rejectionReason
      })
    })

    setSelected(null)
    fetchLeaves(page)
  }

  /* ================= DELETE ================= */

  const deleteLeave = async (id: string) => {
    if (!confirm('Delete this leave request?')) return

    await fetch('/api/admin/leave/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveId: id })
    })

    fetchLeaves(page)
  }

  return (
    <div className="mt-8">

      {/* ================= TABLE ================= */}

      <div className={`overflow-x-auto rounded-xl border transition-colors ${
        theme === 'dark'
          ? 'border-gray-700'
          : 'border-gray-200'
      }`}>
        <table className="w-full text-sm">

          <thead className={`border-b transition-colors text-left ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}>
            <tr>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>S.No</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Username</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Email</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>From</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>To</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Days</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Status</th>
              <th className={`p-3 text-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave, index) => (
              <tr
                key={leave._id}
                className={`border-b transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/40'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {(page - 1) * limit + index + 1}
                </td>
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{leave.userName}</td>
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{leave.userEmail}</td>
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {new Date(leave.fromDate).toDateString()}
                </td>
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {new Date(leave.toDate).toDateString()}
                </td>
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
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
                    className="text-blue-500 hover:scale-110"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => deleteLeave(leave._id)}
                    className="text-red-500 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex justify-center gap-3 mt-6">
        {totalPages > 1 && Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded transition ${
              page === i + 1
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

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
              className={`w-[420px] max-h-[85vh] overflow-y-auto mr-10 p-6 rounded-2xl backdrop-blur-2xl shadow-2xl transition-colors ${
                theme === 'dark'
                  ? 'bg-black/40 border border-blue-500/30'
                  : 'bg-white/90 border border-blue-500/50'
              }`}
            >

              <div className="flex justify-between mb-6">
                <h2 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Leave Details
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className={`transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ✖
                </button>
              </div>

              <div className={`space-y-4 text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>

                <div><b>Name:</b> {selected.userName}</div>
                <div><b>Email:</b> {selected.userEmail}</div>
                <div><b>From:</b> {new Date(selected.fromDate).toDateString()}</div>
                <div><b>To:</b> {new Date(selected.toDate).toDateString()}</div>
                <div><b>Total Days:</b> {selected.totalDays}</div>

                <div>
                  <b>Reason:</b>
                  <div className={`mt-1 p-3 rounded transition-colors ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    {selected.reason}
                  </div>
                </div>

              </div>

              {selected.status === 'pending' && (
                <div className="mt-6 space-y-3">

                  <button
                    onClick={() => updateStatus(selected._id, 'approved')}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Approve
                  </button>

                  <textarea
                    placeholder="Rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={`w-full p-2 rounded transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  />

                  <button
                    onClick={() => updateStatus(selected._id, 'rejected')}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded"
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
