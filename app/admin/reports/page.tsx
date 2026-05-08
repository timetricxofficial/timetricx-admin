'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { ChevronRight, Users, CalendarCheck, Clock, FileText, Briefcase, UserCheck } from 'lucide-react'
import Link from 'next/link'

const reportCategories = [
  {
    id: 'intern-presence',
    title: 'Intern Presence',
    description: 'View daily presence and face verification reports for all interns',
    icon: UserCheck,
    href: '/admin/reports/intern-presence',
    color: 'bg-blue-500',
  },
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'Comprehensive attendance analytics and summaries',
    icon: CalendarCheck,
    href: '/admin/reports/attendance-report',
    color: 'bg-green-500',
  },
  {
    id: 'leave',
    title: 'Leave Report',
    description: 'Track and analyze leave patterns and approvals',
    icon: Clock,
    href: '/admin/reports/leave-report',
    color: 'bg-orange-500',
  },
  {
    id: 'project',
    title: 'Project Report',
    description: 'Project progress and task completion statistics',
    icon: Briefcase,
    href: '/admin/reports',
    color: 'bg-purple-500',
  },
  {
    id: 'performance',
    title: 'Performance Report',
    description: 'Intern performance metrics and evaluations',
    icon: FileText,
    href: '/admin/reports',
    color: 'bg-pink-500',
  },
  {
    id: 'team',
    title: 'Team Report',
    description: 'Team-wise activity and collaboration insights',
    icon: Users,
    href: '/admin/reports',
    color: 'bg-teal-500',
  },
]

export default function ReportsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen p-6 ${
      isDark ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-2 opacity-60">
          <span>Admin</span>
          <ChevronRight size={14} />
          <span className="font-bold opacity-100">Reports</span>
        </div>
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon

          return (
            <Link
              key={category.id}
              href={category.href}
              className={`group relative overflow-hidden rounded-xl h-64 transition-all duration-500 hover:scale-[1.02] ${
                isDark 
                  ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600' 
                  : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >

              {/* 🔥 SVG SHAPE (TOP CENTER DROP) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                <svg 
                  viewBox="0 0 2 1" 
                  preserveAspectRatio="none"
                  className="w-32 h-44 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                >
                  <path 
                    d="M 1,0 L 1,0 C 1,0.2 0,0.15 0,0.25 V 0.75 C 0,0.85 1,0.8 1,1 L 1,1 V 0 Z" 
                    fill="currentColor"
                    className={`${category.color.replace('bg-', 'text-')} opacity-20`}
                  />
                  <path 
                    d="M 1,0 L 1,0 C 1,0.2 0,0.15 0,0.25 V 0.75 C 0,0.85 1,0.8 1,1 L 1,1 V 0 Z"
                    fill="currentColor"
                    transform="translate(2,0) scale(-1,1)"
                    className={`${category.color.replace('bg-', 'text-')} opacity-20`}
                  />
                </svg>
              </div>

              {/* 🔥 CENTER ICON (HOVER) */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                <div className={`p-4 rounded-full`}>
                  <Icon className={`w-12 h-12 ${category.color.replace('bg-', 'text-')}`} />
                </div>
              </div>

              {/* CONTENT */}
              <div className="relative p-6 mt-6 group-hover:mt-28 transition-all duration-500">

                <div className="flex items-start justify-between mb-4 group-hover:opacity-0 transition-opacity duration-300">

                  {/* NORMAL ICON */}
                  <div className={`p-3 rounded-lg transition-all duration-500`}>
                    <Icon className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
                  </div>

                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors group-hover:opacity-0 transition-opacity duration-300">
                  {category.title}
                </h3>

                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm group-hover:opacity-0 transition-opacity duration-300`}>
                  {category.description}
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-blue-500 group-hover:-translate-y-20 transition-transform duration-500">
                  View Report
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}