'use client'

import React from 'react'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface ReportStatsProps {
  status: 'Present' | 'Partial' | 'Absent'
  avgConfidence: number
  highestConfidence: number
  totalAttempts: number
  theme?: string
}

export default function ReportStats({ status, avgConfidence, highestConfidence, totalAttempts, theme }: ReportStatsProps) {
  const isDark = theme === 'dark'
  
  const getStatusConfig = () => {
    switch (status) {
      case 'Present':
        return { 
          color: 'text-green-600', 
          bg: isDark ? 'bg-green-900/20' : 'bg-green-50', 
          icon: <CheckCircle2 className="w-8 h-8 text-green-600" />, 
          desc: 'Good presence detected.' 
        }
      case 'Partial':
        return { 
          color: 'text-yellow-600', 
          bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50', 
          icon: <AlertCircle className="w-8 h-8 text-yellow-600" />, 
          desc: 'Limited presence detected.' 
        }
      case 'Absent':
        return { 
          color: 'text-red-600', 
          bg: isDark ? 'bg-red-900/20' : 'bg-red-50', 
          icon: <XCircle className="w-8 h-8 text-red-600" />, 
          desc: 'No significant presence detected.' 
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className={`${config.bg} p-4 rounded-2xl border ${isDark ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Status</p>
          <h2 className={`text-2xl font-black ${config.color} leading-none mb-1 uppercase`}>{status}</h2>
          <p className="text-[10px] text-gray-500 font-medium">{config.desc}</p>
        </div>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-2 rounded-full shadow-sm`}>
          {config.icon}
        </div>
      </div>

      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-4 rounded-2xl border shadow-sm flex flex-col justify-center text-center`}>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Confidence</p>
        <div className="text-2xl font-black leading-none">{avgConfidence.toFixed(2)}</div>
      </div>

      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-4 rounded-2xl border shadow-sm flex flex-col justify-center text-center`}>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Highest Confidence</p>
        <div className="text-2xl font-black leading-none">{highestConfidence.toFixed(2)}</div>
      </div>

      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-4 rounded-2xl border shadow-sm flex flex-col justify-center text-center`}>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Total Attempts</p>
        <div className="text-2xl font-black leading-none">{totalAttempts}</div>
      </div>
    </div>
  )
}
