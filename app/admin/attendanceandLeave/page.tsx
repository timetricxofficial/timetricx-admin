'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import Attendance from './components/Attendance'
import Leave from './components/Leave'
import WeekendRequests from './components/WeekendRequests'
import CompanyLeaves from './components/CompanyLeaves'
import { motion } from 'framer-motion'

interface CurrentAdmin {
  email: string
  edit: boolean
}

type TabType = 'attendance' | 'leave' | 'weekend' | 'companyLeave'

const tabs: { key: TabType; label: string }[] = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'companyLeave', label: 'Company Leave' },
]

export default function AttendanceAndLeavePage() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('attendance')
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)

  // 🔥 Get current admin from API (fresh data from DB)
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await fetch('/api/admin/get-current')
        const data = await res.json()

        if (data.success && data.data) {
          setCurrentAdmin({
            email: data.data.email,
            edit: data.data.edit
          })
        }
      } catch (err) {
        console.error('Failed to fetch current admin', err)
        setCurrentAdmin(null)
      }
    }

    fetchCurrentAdmin()
  }, [])

  // Permission check - only check edit flag
  const canEdit = () => currentAdmin?.edit === true
  const canDelete = () => currentAdmin?.edit === true
  const canApprove = () => currentAdmin?.edit === true

  const activeIndex = tabs.findIndex(t => t.key === activeTab)

  return (
    <div className={`px-10 py-2 min-h-screen 
      ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}
    `}>

      {/* ================= HEADING CENTER ================= */}
      <div className="flex flex-col items-center">

        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          Attendance & Leave
        </h1>

        {/* ================= 3-TAB TOGGLE CENTER ================= */}
        <div className={`relative flex items-center p-1 rounded-xl 
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}
        `}>

          {/* Sliding Background Animation */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-1 bottom-1 w-32 rounded-lg bg-blue-600"
            style={{
              left: 4 + activeIndex * 128
            }}
          />

          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 w-32 py-2 font-medium rounded-lg transition-colors duration-300
                ${activeTab === tab.key
                  ? 'text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-black'
                }
              `}
            >
              {tab.label}
            </button>
          ))}

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
        {activeTab === 'attendance' && (
          <Attendance canEdit={canEdit()} canDelete={canDelete()} />
        )}
        {activeTab === 'leave' && (
          <Leave canApprove={canApprove()} canEdit={canEdit()} />
        )}
        {activeTab === 'weekend' && (
          <WeekendRequests canApprove={canApprove()} />
        )}
        {activeTab === 'companyLeave' && (
          <CompanyLeaves canEdit={canEdit()} />
        )}
      </motion.div>

    </div>
  )
}

