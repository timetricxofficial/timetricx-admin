'use client'

import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import Attendance from './components/Attendance'
import Leave from './components/Leave'
import { motion } from 'framer-motion'

export default function AttendanceAndLeavePage() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave'>('attendance')

  return (
    <div className={`px-10 py-2 min-h-screen 
      ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}
    `}>

      {/* ================= HEADING CENTER ================= */}
      <div className="flex flex-col items-center">

        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          Attendance & Leave
        </h1>

        {/* ================= TOGGLE CENTER ================= */}
        <div className={`relative flex items-center p-1 rounded-xl 
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
        `}>

          {/* Sliding Background Animation */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-1 bottom-1 w-32 rounded-lg bg-blue-600"
            style={{
              left: activeTab === 'attendance' ? 4 : 132
            }}
          />

          {/* Attendance */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`relative z-10 w-32 py-2 font-medium rounded-lg transition-colors duration-300
              ${activeTab === 'attendance'
                ? 'text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-black'
              }
            `}
          >
            Attendance
          </button>

          {/* Leave */}
          <button
            onClick={() => setActiveTab('leave')}
            className={`relative z-10 w-32 py-2 font-medium rounded-lg transition-colors duration-300
              ${activeTab === 'leave'
                ? 'text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-black'
              }
            `}
          >
            Leave Requests
          </button>

        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-12 w-full"
      >
        {activeTab === 'attendance' ? <Attendance /> : <Leave />}
      </motion.div>

    </div>
  )
}
