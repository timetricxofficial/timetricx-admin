'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Eye, Download, Filter, ArrowLeft, ChevronRight, UserCheck, Calendar, BarChart3 } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import Link from 'next/link'
interface AttendanceData {
  _id: string
  userEmail: string
  months: any[]
  isEmailVerified?: boolean
  profilePicture?: string
}

export default function AttendanceReport() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [data, setData] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AttendanceData | null>(null)
  const [userLeaves, setUserLeaves] = useState<any[]>([])
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'not-verified'>('all')
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

  const fetchAttendance = useCallback(async (pageNum: number, append: boolean = false, filter: string = verifiedFilter) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await fetch(
        `/api/admin/Attendance/getuserattendance?page=${pageNum}&limit=${limit}&verified=${filter}`
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
      console.error('Failed to fetch attendance', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [verifiedFilter])

  useEffect(() => {
    if (page > 1) {
      fetchAttendance(page, true)
    }
  }, [page, fetchAttendance])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchAttendance(1, false, verifiedFilter)
  }, [verifiedFilter, fetchAttendance])

  const getTotalAttendance = (months: any[]) => {
    return months.reduce((acc, m) => acc + (m.records?.length || 0), 0)
  }

  // Helper function to check if a date is a weekend
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  // Helper function to check if a date is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Helper function to calculate duration between entry and exit times
  const calculateDuration = (entryTime: string, exitTime: string, dateString: string) => {
    if (!entryTime || !exitTime) return 0
    
    try {
      // Parse time strings with AM/PM format
      const parseTime = (timeStr: string) => {
        const parts = timeStr.trim().split(' ')
        const timePart = parts[0]
        const period = parts[1] || ''
        
        let [hours, minutes] = timePart.split(':').map(Number)
        
        // Handle AM/PM conversion
        if (period.toLowerCase() === 'pm' && hours < 12) {
          hours += 12
        } else if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0
        }
        
        return { hours, minutes }
      }
      
      const entry = parseTime(entryTime)
      const exit = parseTime(exitTime)
      
      const entryDate = new Date(dateString)
      entryDate.setHours(entry.hours, entry.minutes, 0, 0)
      
      const exitDate = new Date(dateString)
      exitDate.setHours(exit.hours, exit.minutes, 0, 0)
      
      // If exit time is earlier than entry time, it means next day
      if (exitDate.getTime() <= entryDate.getTime()) {
        exitDate.setDate(exitDate.getDate() + 1)
      }
      
      const durationMs = exitDate.getTime() - entryDate.getTime()
      return durationMs / (1000 * 60 * 60) // Convert to hours
    } catch (e) {
      console.error('Error calculating duration:', e)
      return 0
    }
  }

  // Helper function to determine status based on entry/exit and duration
  const getAttendanceStatus = (record: any) => {
    const { entryTime, exitTime, date } = record
    const today = isToday(date)
    
    // If both entry and exit exist
    if (entryTime && exitTime) {
      const duration = calculateDuration(entryTime, exitTime, date)
      return duration >= 6 ? 'COMPLETED' : 'INCOMPLETE'
    }
    
    // If only entry exists
    if (entryTime && !exitTime) {
      if (today) {
        return 'IN-PROGRESS'
      } else {
        return 'COMPLETED BUT NOT OUT'
      }
    }
    
    // No entry
    return 'ABSENT'
  }

  // Helper function to get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500'
      case 'INCOMPLETE':
        return 'bg-orange-500/10 text-orange-500'
      case 'IN-PROGRESS':
        return 'bg-blue-500/10 text-blue-500'
      case 'COMPLETED BUT NOT OUT':
        return 'bg-purple-500/10 text-purple-500'
      case 'ABSENT':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  // Helper function to get monthly statistics
  const getMonthlyStats = (records: any[]) => {
    const filteredRecords = records.filter(record => !isWeekend(record.date))
    const totalWorkingDays = filteredRecords.length
    const daysWithEntry = filteredRecords.filter(record => record.entryTime).length
    const daysWithExit = filteredRecords.filter(record => record.exitTime).length
    
    return {
      totalWorkingDays,
      daysWithEntry,
      daysWithExit
    }
  }

  // Helper function to filter records for current month (up to present day)
  const filterCurrentMonthRecords = (records: any[]) => {
    const today = new Date()
    return records.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate <= today
    })
  }

  // Fetch leaves for selected user
  const fetchUserLeaves = useCallback(async (userEmail: string) => {
    try {
      // Use get-user-leaves endpoint which properly filters by email
      const res = await fetch(`/api/admin/Leave/get-user-leaves?email=${encodeURIComponent(userEmail)}`)
      const result = await res.json()
      console.log('Leave API response:', result)
      if (result.success) {
        // Filter only approved leaves
        const approvedLeaves = (result.data || []).filter((leave: any) => leave.status === 'approved')
        setUserLeaves(approvedLeaves)
        console.log('Approved user leaves:', approvedLeaves)
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err)
      setUserLeaves([])
    }
  }, [])

  // Fetch leaves when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserLeaves(selectedUser.userEmail)
    } else {
      setUserLeaves([])
    }
  }, [selectedUser, fetchUserLeaves])

  // Helper function to calculate leave days from leave requests for a specific month
  const calculateLeaveStatsForMonth = (monthName: string, year: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
    const monthIndex = monthNames.indexOf(monthName.split(' ')[0])
    
    console.log('Calculating leave stats for:', monthName, year, 'Month index:', monthIndex)
    console.log('User leaves:', userLeaves)
    
    if (monthIndex === -1 || !userLeaves.length) {
      return { totalLeaveDays: 0, weekendDaysInLeave: 0 }
    }

    // Use Set to track unique leave dates and avoid double counting
    const leaveDates = new Set<string>()
    const weekendLeaveDates = new Set<string>()

    userLeaves.forEach((leave: any, idx: number) => {
      console.log(`Processing leave ${idx}:`, leave)
      const fromDate = new Date(leave.fromDate)
      const toDate = new Date(leave.toDate)
      
      console.log('Leave fromDate:', fromDate, 'toDate:', toDate)
      
      // Iterate through each day of the leave
      const currentDate = new Date(fromDate)
      while (currentDate <= toDate) {
        const dateString = currentDate.toISOString().split('T')[0]
        
        // Only count if it's in the target month and year
        if (currentDate.getMonth() === monthIndex && currentDate.getFullYear() === year) {
          console.log('Adding date to leave:', dateString)
          leaveDates.add(dateString)
          
          // Check if this leave day is a weekend
          if (isWeekend(dateString)) {
            weekendLeaveDates.add(dateString)
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    console.log('Final leave dates:', leaveDates)
    console.log('Final stats:', { totalLeaveDays: leaveDates.size, weekendDaysInLeave: weekendLeaveDates.size })

    return { 
      totalLeaveDays: leaveDates.size, 
      weekendDaysInLeave: weekendLeaveDates.size 
    }
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setIsExporting(true)

    try {
      const element = reportRef.current
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const margin = 10
      const contentWidth = pdfWidth - (2 * margin)
      
      // 1. Export Header
      const header = element.querySelector('[data-report-header]') as HTMLElement
      const headerCanvas = await html2canvas(header, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0f1117' : '#ffffff',
      })
      const headerImg = headerCanvas.toDataURL('image/jpeg', 0.8)
      const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width
      
      pdf.addImage(headerImg, 'JPEG', margin, margin, contentWidth, headerHeight)
      
      let currentY = margin + headerHeight + 10

      // 2. Export each month
      const monthSections = element.querySelectorAll('[data-month-section]')
      
      for (let i = 0; i < monthSections.length; i++) {
        const section = monthSections[i] as HTMLElement
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          backgroundColor: isDark ? '#0f1117' : '#ffffff',
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        const imgHeight = (canvas.height * contentWidth) / canvas.width
        
        // If it doesn't fit on the current page, add a new page
        const pdfHeight = pdf.internal.pageSize.getHeight()
        if (currentY + imgHeight > pdfHeight - margin) {
          pdf.addPage()
          currentY = margin
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight)
        currentY += imgHeight + 10
      }

      pdf.save(`Attendance_Report_${selectedUser?.userEmail || 'User'}.pdf`)
    } catch (err) {
      console.error('PDF Export failed:', err)
    } finally {
      setIsExporting(false)
    }
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
            <span className="font-bold opacity-100">Attendance Report</span>
          </div>
          <h1 className="text-2xl font-bold">Attendance Analytics</h1>
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
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value as any)}
                  className={`pl-10 pr-4 py-2 rounded-xl border appearance-none cursor-pointer text-sm font-medium transition-all outline-none
                    ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified Only</option>
                  <option value="not-verified">Not Verified</option>
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
                  className={`group p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer relative overflow-hidden h-[240px] hover:h-[300px]
                    ${isDark 
                      ? 'bg-[#0f1117] border-blue-500/20 hover:border-blue-500/40 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.1)]' 
                      : 'bg-white border-gray-200 hover:shadow-lg'}`}
                >
                  {/* Neon Glow Borders */}
                  {isDark && (
                    <>
                      <div className="absolute top-0 left-0 w-full h-full rounded-[2.5rem] pointer-events-none border-t border-l border-blue-500/40 shadow-[inset_10px_10px_20px_-10px_rgba(59,130,246,0.3)]"></div>
                      <div className="absolute bottom-0 right-0 w-full h-full rounded-[2.5rem] pointer-events-none border-b border-r border-green-500/40 shadow-[inset_-10px_-10px_20px_-10px_rgba(34,197,94,0.3)]"></div>
                    </>
                  )}

                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="relative group/avatar">
                      {/* 3D Elevation & Glow Layers */}
                      <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/20 to-green-500/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500/40 to-green-500/40 rounded-full opacity-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                      
                      <div className="w-20 h-20 rounded-full bg-[#0f1117] flex items-center justify-center text-blue-500 border border-blue-500/30 relative overflow-hidden z-10 shadow-[5px_5px_15px_rgba(0,0,0,0.5),-2px_-2px_10px_rgba(255,255,255,0.05)] transform group-hover:scale-110 transition-transform duration-500">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.userEmail} className="w-full h-full object-cover" />
                        ) : (
                          <UserCheck size={36} />
                        )}
                        {/* Circular inner glow */}
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(59,130,246,0.4)] pointer-events-none"></div>
                      </div>

                      {/* Animated outer ring */}
                      <div className="absolute -inset-1.5 rounded-full border border-blue-500/20 animate-[spin_10s_linear_infinite] pointer-events-none"></div>
                      <div className="absolute -inset-1.5 rounded-full border-t-2 border-l-2 border-blue-400/40 animate-[spin_3s_linear_infinite] pointer-events-none"></div>
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-bold truncate mb-2">{user.userEmail}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        user.isEmailVerified 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                          : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                    <div className={`p-4 rounded-3xl border transition-all flex items-center gap-3
                      ${isDark 
                        ? 'bg-[#1a1c23]/60 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="opacity-50 text-[10px] uppercase font-bold tracking-tight mb-0.5">Total Present</p>
                        <p className="text-lg font-bold">{getTotalAttendance(user.months)} Days</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-3xl border transition-all flex items-center gap-3
                      ${isDark 
                        ? 'bg-[#1a1c23]/60 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                        : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                        <BarChart3 size={20} />
                      </div>
                      <div>
                        <p className="opacity-50 text-[10px] uppercase font-bold tracking-tight mb-0.5">Status</p>
                        <p className="text-lg font-bold text-green-500">Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center text-sm font-bold text-blue-500 hover:text-blue-400 transition-all relative z-10 group/link opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    View Full Attendance 
                    <ChevronRight size={18} className="ml-1 transition-transform group-hover/link:translate-x-1" />
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
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : <><Download size={18} /> Export PDF</>}
              </button>
            </div>

            <div ref={reportRef} className={`p-8 rounded-3xl border ${
              isDark ? 'bg-[#0f1117] border-gray-700' : 'bg-white border-gray-200 shadow-xl'
            }`}>
              <div data-report-header className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedUser.userEmail}</h2>
                  <p className="opacity-60 text-sm">Comprehensive Attendance Record</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-60">Total Presence</p>
                  <p className="text-4xl font-black text-blue-500">{getTotalAttendance(selectedUser.months)} <span className="text-sm font-bold opacity-60">Days</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {[...selectedUser.months].reverse().map((month, idx) => {
                  // Check if this is the current month
                  const currentDate = new Date()
                  const monthDate = new Date(month.monthName + ' 1, ' + currentDate.getFullYear())
                  const isCurrentMonth = monthDate.getMonth() === currentDate.getMonth() && monthDate.getFullYear() === currentDate.getFullYear()
                  
                  // Filter records based on whether it's current month
                  const monthRecords = isCurrentMonth ? filterCurrentMonthRecords(month.records) : month.records
                  
                  // Filter out weekends and get stats
                  const filteredRecords = monthRecords.filter(record => !isWeekend(record.date))
                  const stats = getMonthlyStats(filteredRecords)
                  
                  // Calculate leave stats for this month
                  const currentYear = new Date().getFullYear()
                  const leaveStats = calculateLeaveStatsForMonth(month.monthName, currentYear)
                  
                  return (
                    <div key={idx} data-month-section className={`p-6 rounded-2xl ${isDark ? 'bg-black/20' : 'bg-gray-50/50 border border-gray-100'}`}>
                      {/* Month Header with Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-blue-500" size={20} />
                          <h3 className="text-xl font-bold">{month.monthName}</h3>
                        </div>
                        
                        {/* Compact Stats Pills */}
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <span className="opacity-60">Working:</span> <span className="font-bold">{stats.totalWorkingDays}</span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <span className="opacity-60">Entry:</span> <span className="font-bold text-green-500">{stats.daysWithEntry}</span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <span className="opacity-60">Exit:</span> <span className="font-bold text-orange-500">{stats.daysWithExit}</span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <span className="opacity-60">Leave:</span> <span className="font-bold text-purple-500">{leaveStats.totalLeaveDays}</span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                            <span className="opacity-60">Weekend in Leave:</span> <span className="font-bold text-pink-500">{leaveStats.weekendDaysInLeave}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRecords.map((record: any, ridx: number) => {
                          const status = getAttendanceStatus(record)
                          return (
                            <div key={ridx} className={`p-4 rounded-xl border flex justify-between items-center
                              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                              <div>
                                <p className="text-xs opacity-60 font-bold uppercase mb-1">{record.date}</p>
                                <div className="flex gap-4">
                                  <div>
                                    <p className="text-[10px] opacity-40 uppercase font-black">Entry</p>
                                    <p className="text-sm font-bold">{record.entryTime || '--'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] opacity-40 uppercase font-black">Exit</p>
                                    <p className="text-sm font-bold">{record.exitTime || '--'}</p>
                                  </div>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyle(status)}`}>
                                {status}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
