'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, Info, UserCheck, UserX, UserMinus } from 'lucide-react'

interface Insight {
  type: 'success' | 'warning' | 'info'
  text: string
}

interface ReportInsightsProps {
  avgConfidence: number
  behavior: 'Reliable' | 'Inconsistent' | 'Suspicious'
  insights: Insight[]
  theme?: string
}

export default function ReportInsights({ avgConfidence, behavior, insights, theme }: ReportInsightsProps) {
  const isDark = theme === 'dark'
  
  const getBehaviorConfig = () => {
    switch (behavior) {
      case 'Reliable':
        return { color: 'text-green-600', bg: isDark ? 'bg-green-900/20' : 'bg-green-50', icon: <UserCheck className="w-8 h-8 text-green-600" />, desc: 'User was detected multiple times with moderate to high confidence.' }
      case 'Inconsistent':
        return { color: 'text-orange-600', bg: isDark ? 'bg-orange-900/20' : 'bg-orange-50', icon: <UserMinus className="w-8 h-8 text-orange-600" />, desc: 'Presence is detected but verification is inconsistent.' }
      case 'Suspicious':
        return { color: 'text-red-600', bg: isDark ? 'bg-red-900/20' : 'bg-red-50', icon: <UserX className="w-8 h-8 text-red-600" />, desc: 'Presence is rare or confidence is extremely low.' }
    }
  }

  const config = getBehaviorConfig()

  return (
    <div className="flex flex-col gap-6">
      {/* SMART INSIGHTS */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm overflow-hidden flex-1 flex flex-col`}>
        <div className="bg-[#1a237e] px-5 py-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Smart Insights</h3>
        </div>
        
        <div className={`p-5 space-y-4 flex-1 ${isDark ? 'bg-[#1a1c23]' : 'bg-white'}`}>
          {insights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className={`mt-0.5 p-1 rounded-lg ${
                insight.type === 'success' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') :
                insight.type === 'warning' ? (isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600') :
                (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600')
              }`}>
                {insight.type === 'success' ? <CheckCircle2 size={16} /> :
                 insight.type === 'warning' ? <AlertTriangle size={16} /> :
                 <Info size={16} />}
              </div>
              <p className={`text-[11px] font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BEHAVIOR TAG */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm overflow-hidden`}>
        <div className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-900'} px-5 py-3`}>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Behavior Tag</h3>
        </div>
        
        <div className={`p-5 ${isDark ? 'bg-[#1a1c23]' : 'bg-white'}`}>
          <div className={`${config.bg} p-4 rounded-xl border ${isDark ? 'border-gray-800/50' : 'border-gray-100'} flex items-center gap-4`}>
            {config.icon}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${config.color} mb-1`}>{behavior} USER</h4>
              <p className={`text-[10px] font-bold leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {config.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
