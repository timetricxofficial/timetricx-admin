'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../../contexts/ThemeContext'

interface AttendanceData {
  _id: string
  userEmail: string
  months: any[]
}

export default function Attendance() {
  const { theme } = useTheme()

  const [data, setData] = useState<AttendanceData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<any>(null)

  const perPage = 10

  /* ================= FETCH (SERVER PAGINATION) ================= */

  useEffect(() => {
    fetchAttendance(page)
  }, [page])

  const fetchAttendance = async (pg: number) => {
    const res = await fetch(
      `/api/admin/Attendance/getuserattendance?page=${pg}&limit=${perPage}`
    )
    const result = await res.json()

    if (result.success) {
      setData(result.data)
      setTotalPages(result.pagination.totalPages)
    }
  }

  /* ================= TOTAL COUNT ================= */

  const getTotalAttendance = (months: any[]) => {
    return months.reduce(
      (acc, m) => acc + m.records.length,
      0
    )
  }

  /* ================= MONTH PARSER ================= */

  const parseMonth = (monthName: string) => {
    const [monthStr, yearStr] = monthName.split(' ')
    const monthIndex = new Date(`${monthStr} 1, ${yearStr}`).getMonth()
    const year = parseInt(yearStr)
    return { monthIndex, year }
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
              }`}>Email</th>
              <th className={`p-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Total Attendance</th>
              <th className={`p-3 text-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={item._id}
                className={`border-b transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700/40'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {(page - 1) * perPage + index + 1}
                </td>

                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{item.userEmail}</td>

                <td className={`p-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
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
          </tbody>

        </table>
      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex justify-center gap-3 mt-6">
        {Array.from({ length: totalPages }).map((_, i) => (
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
              className={`w-[1000px] max-h-[85vh] overflow-y-auto p-8 rounded-2xl backdrop-blur-2xl border shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-colors ${
                theme === 'dark'
                  ? 'bg-black/40 border-blue-500/30'
                  : 'bg-white/90 border-blue-500/50'
              }`}
            >

              {/* HEADER */}
              <div className="flex justify-between mb-6">
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {selected.userEmail}
                </h2>

                <button
                  onClick={() => setSelected(null)}
                  className={`text-lg transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ✖
                </button>
              </div>

              {/* MONTH LOOP */}
              {selected.months.map((month: any, mi: number) => {

                const { monthIndex, year } = parseMonth(month.monthName)

                const daysInMonth =
                  new Date(year, monthIndex + 1, 0).getDate()

                return (
                  <div key={mi} className="mb-10">

                    <h3 className={`mb-4 font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {month.monthName}
                    </h3>

                    {/* DAY NAMES HEADER */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                        <div
                          key={dayName}
                          className={`text-center text-xs font-medium py-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {dayName}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">

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

                        let bg = 'bg-red-500'

                        if (isWeekend) bg = 'bg-gray-700'
                        else if (isFuture) bg = 'bg-gray-400'
                        else if (record) bg = 'bg-green-500'

                        return (
                          <div
                            key={day}
                            className={`${bg} h-16 rounded-lg flex items-center justify-center text-white text-sm relative group cursor-pointer transition`}
                          >
                            {day}

                            {record && (
                              <div className="absolute bottom-20 hidden group-hover:block bg-black text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                                Entry: {record.entryTime} <br />
                                Exit: {record.exitTime || '-'}
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
