'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Eye, Download, Filter, ArrowLeft, ChevronRight, UserCheck, Calendar, Clock, CalendarDays } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import Link from 'next/link'

interface LeaveData {
  _id: string
  userEmail: string
  userName: string
  leaves: any[]
  stats: {
    totalLeaves: number
    approvedLeaves: number
    pendingLeaves: number
    rejectedLeaves: number
    totalLeaveDays: number
  }
  isEmailVerified?: boolean
}

export default function LeaveReport() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [data, setData] = useState<LeaveData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<LeaveData | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  
  const loadingRef = useRef(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const limit = 10

  const observerTarget = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(p => p + 1)
  })

  const fetchLeaveSummary = useCallback(async (pageNum: number, append: boolean = false, filter: string = statusFilter) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await fetch(
        `/api/admin/Leave/get-user-leaves-summary?page=${pageNum}&limit=${limit}&status=${filter}`
      )
      const result = await res.json()

      if (result.success) {
        if (append) {
          setData(prev => {
            const existingIds = new Set(prev.map((u: any) => u._id))
            const newData = result.data.filter((u: any) => !existingIds.has(u._id))
            return [...prev, ...newData]
          })
        } else {
          setData(result.data)
        }
        setHasMore(result.pagination.hasMore)
      }
    } catch (err) {
      console.error('Failed to fetch leave summary', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (page > 1) {
      fetchLeaveSummary(page, true)
    }
  }, [page, fetchLeaveSummary])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchLeaveSummary(1, false, statusFilter)
  }, [statusFilter, fetchLeaveSummary])

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setIsExporting(true)

    try {
      const element = reportRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0f1117' : '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Leave_Report_${selectedUser?.userEmail || 'User'}.pdf`)
    } catch (err) {
      console.error('PDF Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'rejected':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm mb-2 opacity-60">
            <span>Admin</span>
            <ChevronRight size={14} />
            <Link href="/admin/reports" className="hover:underline">Reports</Link>
            <ChevronRight size={14} />
            <span className="font-bold opacity-100">Leave Report</span>
          </div>
          <h1 className="text-2xl font-bold">Leave Analytics</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* FILTERS */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`pl-10 pr-4 py-2 rounded-xl border appearance-none cursor-pointer text-sm font-medium transition-all outline-none
                    ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>
              </div>

              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-4 pr-4 py-2 rounded-xl border text-sm font-medium transition-all outline-none
                    ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>

            {/* USER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data
                .filter(u => u.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`group p-6 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02]
                    ${isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Clock size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold truncate">{user.userEmail}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        user.isEmailVerified ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                      <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Total Leaves</p>
                      <p className="text-xl font-bold">{user.stats.totalLeaves}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                      <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Total Days</p>
                      <p className="text-xl font-bold text-orange-500">{user.stats.totalLeaveDays}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Full Leave History <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* LOADING STATE */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {[1, 2, 3].map(i => <Skeleton key={i} height={180} className="rounded-2xl" />)}
              </div>
            )}

            <div ref={observerTarget} className="h-10 w-full" />
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setSelectedUser(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                  ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-sm">Back to List</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : <><Download size={18} /> Export PDF</>}
              </button>
            </div>

            <div ref={reportRef} className={`p-8 rounded-3xl border ${
              isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200 shadow-xl'
            }`}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedUser.userEmail}</h2>
                  <p className="opacity-60 text-sm">Comprehensive Leave Record</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-60">Total Leave Days</p>
                  <p className="text-4xl font-black text-orange-500">{selectedUser.stats.totalLeaveDays} <span className="text-sm font-bold opacity-60">Days</span></p>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Total Requests</p>
                  <p className="text-2xl font-bold">{selectedUser.stats.totalLeaves}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-500">{selectedUser.stats.approvedLeaves}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{selectedUser.stats.pendingLeaves}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <p className="opacity-60 text-[10px] uppercase font-bold mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-500">{selectedUser.stats.rejectedLeaves}</p>
                </div>
              </div>

              {/* LEAVE LIST */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays size={20} className="text-orange-500" />
                  Leave History
                </h3>
                
                {selectedUser.leaves.length === 0 ? (
                  <div className={`p-8 rounded-xl text-center ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                    <p className="opacity-60">No leave records found</p>
                  </div>
                ) : (
                  selectedUser.leaves.map((leave: any, idx: number) => (
                    <div key={idx} className={`p-5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyle(leave.status)}`}>
                            {leave.status.toUpperCase()}
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                            {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                          </div>
                        </div>
                        <p className="text-xs opacity-40">
                          {formatDate(leave.createdAt)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] opacity-40 uppercase font-black mb-1">From</p>
                          <p className="text-sm font-bold">{formatDate(leave.fromDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-40 uppercase font-black mb-1">To</p>
                          <p className="text-sm font-bold">{formatDate(leave.toDate)}</p>
                        </div>
                        {leave.status === 'approved' && (
                          <>
                            <div>
                              <p className="text-[10px] opacity-40 uppercase font-black mb-1">Approved By</p>
                              <p className="text-sm font-bold">{leave.approvedByEmail || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] opacity-40 uppercase font-black mb-1">Approved At</p>
                              <p className="text-sm font-bold">{leave.approvedAt ? formatDate(leave.approvedAt) : 'N/A'}</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] opacity-40 uppercase font-black mb-1">Reason</p>
                        <p className="text-sm opacity-80">{leave.reason}</p>
                      </div>

                      {leave.status === 'rejected' && leave.rejectionReason && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-[10px] opacity-60 uppercase font-black mb-1">Rejection Reason</p>
                          <p className="text-sm text-red-400">{leave.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
