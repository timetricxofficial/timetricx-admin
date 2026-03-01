'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Eye, Trash2 } from 'lucide-react'

interface AttendanceData {
  _id: string
  userEmail: string
  months: any[]
}

interface AttendanceProps {
  canEdit?: boolean
  canDelete?: boolean
}

import Skeleton from '../../../../components/ui/Skeleton'

export default function Attendance({ canEdit = false, canDelete = false }: AttendanceProps) {
  const { theme } = useTheme()

  const [data, setData] = useState<AttendanceData[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [weekendRequests, setWeekendRequests] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [companyHolidays, setCompanyHolidays] = useState<any[]>([])

  const limit = 10

  /* ================= FETCH (Infinite Scroll) ================= */
  const fetchAttendance = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(
        `/api/admin/Attendance/getuserattendance?page=${pageNum}&limit=${limit}`
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
    } catch {
      console.error('Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }, [loading])

  /* ================= TOTAL COUNT ================= */

  const getTotalAttendance = (months: any[]) => {
    return months.reduce(
      (acc, m) => acc + m.records.length,
      0
    )
  }

  /* ================= TIME PARSERS ================= */

  const parseTime = (time: string) => {
    if (!time) return 0
    const [timePart, meridianRaw] = time.trim().split(' ')
    const meridian = meridianRaw?.toUpperCase()
    const parts = timePart.split(':').map(Number)
    let h = parts[0]
    const m = parts[1]
    const s = parts[2] || 0

    if (meridian === 'PM' && h !== 12) h += 12
    if (meridian === 'AM' && h === 12) h = 0

    return h * 60 + m + s / 60
  }

  const getWorkedHours = (entry: string, exit?: string) => {
    const start = parseTime(entry)
    const end = exit
      ? parseTime(exit)
      : new Date().getHours() * 60 + new Date().getMinutes()

    const diff = (end - start) / 60
    return Math.max(0, diff)
  }

  /* ================= MONTH PARSER ================= */

  const parseMonth = (monthName: string) => {
    const [monthStr, yearStr] = monthName.split(' ')
    const monthIndex = new Date(`${monthStr} 1, ${yearStr}`).getMonth()
    const year = parseInt(yearStr)
    return { monthIndex, year }
  }

  // Initial load
  useEffect(() => {
    fetchAttendance(1, false)
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
        fetchAttendance(nextPage, true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, fetchAttendance])

  useEffect(() => {
    if (selected?.userEmail) {
      // Fetch weekend requests
      fetch(`/api/admin/weekend-requests?email=${selected.userEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWeekendRequests(data.data || [])
          }
        })
        .catch(console.error)

      // Fetch company holidays
      fetch('/api/admin/company-holiday')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCompanyHolidays(data.data || [])
          }
        })
        .catch(console.error)
    } else {
      setWeekendRequests([])
      setLeaves([])
      setCompanyHolidays([])
    }
  }, [selected])

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
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>S.No</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
              <th className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Total Attendance</th>
              <th className={`p-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={item._id}
                className={`border-b transition-colors ${theme === 'dark'
                  ? 'border-gray-700 hover:bg-gray-700/40'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {index + 1}
                </td>

                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.userEmail}</td>

                <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getTotalAttendance(item.months)}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelected(item)}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Check Attendance
                  </button>
                </td>
              </tr>
            ))}

            {/* SKELETON ROWS DURING LOADING */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className="p-3"><Skeleton height={20} width={30} /></td>
                <td className="p-3"><Skeleton height={20} width={200} /></td>
                <td className="p-3"><Skeleton height={20} width={100} /></td>
                <td className="p-3 text-center"><Skeleton height={32} width={130} className="rounded-lg" /></td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {!hasMore && data.length > 0 && !loading && (
        <div className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No more attendance to load
        </div>
      )}

      {/* ================= MODAL ================= */}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className={`w-[1000px] max-h-[85vh] overflow-y-auto p-8 rounded-2xl backdrop-blur-2xl border shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-colors ${theme === 'dark'
                ? 'bg-black/40 border-blue-500/30'
                : 'bg-white/90 border-blue-500/50'
                }`}
            >

              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selected.userEmail}
                </h2>

                <button
                  onClick={() => setSelected(null)}
                  className={`text-lg transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  ✖
                </button>
              </div>

              {/* MONTH LOOP */}
              {[...selected.months].reverse().map((month: any, mi: number) => {

                const { monthIndex, year } = parseMonth(month.monthName)

                const daysInMonth =
                  new Date(year, monthIndex + 1, 0).getDate()

                const firstDay = new Date(year, monthIndex, 1).getDay()

                return (
                  <div key={mi} className="mb-10">

                    <h3 className={`mb-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {month.monthName}
                    </h3>

                    {/* DAY NAMES HEADER */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                        <div
                          key={dayName}
                          className={`text-center text-xs font-medium py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {dayName}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {

                        const day = i + 1
                        const checkDate =
                          new Date(year, monthIndex, day)

                        const formatted =
                          `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

                        const record =
                          month.records.find((r: any) => r.date === formatted)

                        const isWeekend =
                          checkDate.getDay() === 0 ||
                          checkDate.getDay() === 6

                        const isFuture =
                          checkDate > new Date()

                        const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                        const isToday = formatted === todayStr

                        const isWeekendReq = weekendRequests.find((r: any) => r.date === formatted)
                        const isWeekendPending = isWeekendReq?.status === 'pending'
                        const isWeekendApproved = isWeekendReq?.status === 'approved'

                        const qTime = checkDate.getTime()
                        let isLeaveStart = false
                        let isLeaveMiddle = false
                        let isLeaveEnd = false

                        // Check if this date falls within an approved leave
                        const leaveForDate = leaves.find((l: any) => {
                          if (l.status !== 'approved') return false
                          const lStart = new Date(l.fromDate)
                          const lEnd = new Date(l.toDate)
                          lStart.setHours(0, 0, 0, 0)
                          lEnd.setHours(0, 0, 0, 0)

                          if (qTime >= lStart.getTime() && qTime <= lEnd.getTime()) {
                            if (lStart.getTime() !== lEnd.getTime()) {
                              if (qTime === lStart.getTime()) isLeaveStart = true
                              else if (qTime === lEnd.getTime()) isLeaveEnd = true
                              else isLeaveMiddle = true
                            }
                            return true
                          }
                          return false
                        })

                        // Check Company Holiday
                        const companyHoliday = companyHolidays.find(h => {
                          const hDate = new Date(h.date);
                          const hDateStr = `${hDate.getFullYear()}-${(hDate.getMonth() + 1).toString().padStart(2, '0')}-${hDate.getDate().toString().padStart(2, '0')}`;
                          return hDateStr === formatted;
                        })

                        let fillColor = ''
                        let fillPct = 0
                        let textColor = '#ffffff'
                        let displayLabel = ''
                        let className = ''
                        let tooltip = ''

                        let baseBg = theme === 'dark' ? '#1f2937' : '#f3f4f6'
                        let roundingClass = 'rounded-xl'
                        let showRightConnector = false

                        if (companyHoliday && (!record?.entryTime || !record?.completed)) {
                          baseBg = '#f43f5e' // Vibrant Rose Pink 🎀
                          displayLabel = companyHoliday.title
                          textColor = '#ffffff'
                        } else if (leaveForDate) {
                          baseBg = '#f97316'
                          displayLabel = 'Leave'
                          tooltip = `Reason: ${leaveForDate.reason}`
                          const isLeftRounded = (!isLeaveMiddle && !isLeaveEnd) || checkDate.getDay() === 0
                          const isRightRounded = (!isLeaveMiddle && !isLeaveStart) || checkDate.getDay() === 6
                          if (isLeaveStart || isLeaveMiddle || isLeaveEnd) {
                            if (isLeftRounded && isRightRounded) roundingClass = 'rounded-xl'
                            else if (isLeftRounded && !isRightRounded) roundingClass = 'rounded-l-xl rounded-r-none'
                            else if (!isLeftRounded && isRightRounded) roundingClass = 'rounded-r-xl rounded-l-none'
                            else roundingClass = 'rounded-none'
                            showRightConnector = (!isLeaveEnd) && (checkDate.getDay() !== 6)
                          }
                        } else if (record?.entryTime && isWeekend) {
                          if (isWeekendApproved) {
                            if (record?.exitTime) {
                              const hours = record.workedHours || getWorkedHours(record.entryTime, record.exitTime)
                              fillPct = Math.max(2, Math.min((hours / 6) * 100, 100))
                              fillColor = '#22c55e'
                              displayLabel = hours >= 6 ? '6h ✓' : `${hours.toFixed(1)}h`
                            } else if (isToday) {
                              baseBg = '#3b82f6'
                              className = 'animate-pulse'
                              displayLabel = 'Active'
                            } else {
                              fillColor = '#22c55e'
                              fillPct = 100
                            }
                          } else if (isWeekendPending) {
                            baseBg = '#f59e0b'
                            displayLabel = 'Pending'
                            textColor = '#111'
                          } else {
                            baseBg = '#6b7280'
                            textColor = '#111'
                            displayLabel = 'Holiday'
                          }
                        } else if (isWeekend) {
                          baseBg = '#6b7280'
                          textColor = '#111'
                          displayLabel = 'Holiday'
                        } else if (record?.entryTime && record?.exitTime) {
                          const hours = record.workedHours || getWorkedHours(record.entryTime, record.exitTime)
                          fillPct = Math.max(2, Math.min((hours / 6) * 100, 100))
                          fillColor = '#22c55e'
                          displayLabel = hours >= 6 ? '6h ✓' : `${hours.toFixed(1)}h`
                        } else if (record?.entryTime && !record?.exitTime) {
                          if (isToday) {
                            baseBg = '#3b82f6'
                            className = 'animate-pulse'
                            displayLabel = 'Active'
                          } else {
                            fillColor = '#22c55e'
                            fillPct = 100
                          }
                        } else if (isFuture) {
                          textColor = theme === 'dark' ? '#9ca3af' : '#6b7280'
                        } else {
                          fillColor = '#ef4444'
                          fillPct = 100
                        }

                        return (
                          <div
                            key={day}
                            className={`h-14 ${roundingClass} flex flex-col items-center justify-center text-sm font-semibold shadow-[0_4px_10px_rgba(0,0,0,0.1)] cursor-pointer relative overflow-visible transition-all hover:scale-[1.05] group ${className}`}
                            style={{ background: baseBg, color: textColor }}
                          >
                            {showRightConnector && <div className="absolute top-0 right-[-0.5rem] w-2 h-full bg-[#f97316] z-0" />}
                            {fillPct > 0 && fillColor && (
                              <div className="absolute left-0 top-0 bottom-0 rounded-xl" style={{ width: `${fillPct}%`, background: fillColor, zIndex: 0 }} />
                            )}
                            {companyHoliday?.animationUrl && (!record?.entryTime || !record?.completed) && (
                              (() => {
                                const isVid = companyHoliday.animationResourceType === 'video' ||
                                  companyHoliday.animationUrl.match(/\.(mp4|webm|ogg|mov)$|^.*\/video\/upload\/.*$/i);

                                if (isVid) {
                                  return (
                                    <video
                                      src={companyHoliday.animationUrl}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none rounded-xl"
                                    />
                                  )
                                }
                                return (
                                  <img
                                    src={companyHoliday.animationUrl}
                                    alt=""
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none rounded-xl"
                                  />
                                )
                              })()
                            )}
                            <span className="relative z-10">{day}</span>
                            {displayLabel && <span className="relative z-10 text-[10px] opacity-90">{displayLabel}</span>}

                            {/* ✨ Animated Festive Bubble Tooltip */}
                            {(record || tooltip) && (
                              <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 px-3 py-2 rounded-2xl 
                                             bg-black/80 backdrop-blur-xl border border-white/10 text-white text-[11px] 
                                             font-bold shadow-2xl pointer-events-none z-[100] whitespace-nowrap
                                             opacity-0 group-hover:opacity-100 group-hover:translate-y-[-5px] 
                                             scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                {tooltip ? (
                                  <span className="flex flex-col">
                                    <span className="text-blue-400 text-[9px] uppercase tracking-wider">Festival</span>
                                    {tooltip}
                                  </span>
                                ) : (
                                  <span>Entry: {record.entryTime} - Exit: {record.exitTime || '-'}</span>
                                )}
                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/80" />
                              </div>
                            )}
                          </div>
                        )
                      })}

                    </div>
                  </div>
                )
              })}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
