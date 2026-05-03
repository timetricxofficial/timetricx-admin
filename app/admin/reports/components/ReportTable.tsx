'use client'

import React from 'react'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface Attempt {
  time: string
  confidence: number
  category: string
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED'
}

interface ReportTableProps {
  attempts: Attempt[]
  theme?: string
}

export default function ReportTable({ attempts, theme }: ReportTableProps) {
  const isDark = theme === 'dark'
  
  const getCategoryColor = (category: string) => {
    if (category.includes('Strong')) return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50'
    if (category.includes('Verified')) return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'
    if (category.includes('Lenient')) return isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-50'
    if (category.includes('Weak')) return isDark ? 'text-orange-400 bg-orange-900/30' : 'text-orange-600 bg-orange-50'
    return isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'PARTIAL': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden h-full ${
      isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'
    }`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} px-5 py-3`}>
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">All Attempts (Detailed)</h3>
      </div>
      
      <div className={`overflow-auto max-h-[400px] ${attempts.length > 0 ? 'min-h-[200px]' : ''}`}>
        {attempts.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${isDark ? 'bg-[#252833]' : 'bg-gray-50'}`}>
              <tr className={`text-[10px] font-black uppercase tracking-wider border-b ${
                isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'
              }`}>
                <th className="px-5 py-3 w-12 text-center">#</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 text-center">Confidence</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-50'}`}>
              {attempts.map((attempt, idx) => (
                <tr key={idx} className={`${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <td className="px-5 py-3 text-[11px] font-bold text-gray-400 text-center">{idx + 1}</td>
                  <td className={`px-5 py-3 text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{attempt.time}</td>
                  <td className={`px-5 py-3 text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-700'} text-center`}>{attempt.confidence.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${getCategoryColor(attempt.category)}`}>
                      <div className="w-1 h-1 rounded-full bg-current"></div>
                      {attempt.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      {getStatusIcon(attempt.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
            <div className={`p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
               <AlertCircle size={24} className="text-gray-400" />
            </div>
            <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No records found for today
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
