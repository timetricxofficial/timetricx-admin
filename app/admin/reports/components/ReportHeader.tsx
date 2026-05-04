'use client'

import React from 'react'

interface ReportHeaderProps {
  type: 'SINGLE' | 'MULTIPLE'
  dateRange: string
  user: any
  theme?: string
}

export default function ReportHeader({ type, dateRange, user, theme }: ReportHeaderProps) {
  const isDark = theme === 'dark'
  return (
    <div className={`flex justify-between items-start border-b pb-6 mb-6 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#004d40] rounded-xl flex items-center justify-center">
             <img src="/Timetricx logo.svg" alt="Logo" className="w-8 h-8 brightness-0 invert" />
          </div>
          <div>
            <h1 className={`text-xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>CYBERSHOORA</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Secure. Monitor. Protect.</p>
          </div>
        </div>
        <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
          type === 'SINGLE' ? 'bg-[#00897b] text-white' : 'bg-[#004d40] text-white'
        }`}>
          {type === 'SINGLE' ? 'Single Day Report' : 'Multiple Day Report'}
        </div>
      </div>

      <div className="text-right space-y-2 self-start pt-2">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-2 font-medium"><span className="w-4">📅</span> {type === 'SINGLE' ? 'Report Date' : 'Date Range'}</span>
          <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>: {dateRange}</span>
          
          <span className="flex items-center gap-2 font-medium"><span className="w-4">👤</span> User</span>
          <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>: {user.name}</span>
          
          <span className="flex items-center gap-2 font-medium"><span className="w-4">📧</span> Email</span>
          <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>: {user.email || 'N/A'}</span>
        </div>
      </div>
    </div>
  )
}
