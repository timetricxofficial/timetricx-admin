'use client'

import React from 'react'
import { Activity, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ConsistencyAnalysisProps {
  score: number
  stdDev: number
  cv: number
  theme?: string
}

export default function ConsistencyAnalysis({ score, stdDev, cv, theme }: ConsistencyAnalysisProps) {
  const isDark = theme === 'dark'
  
  const getStatus = (s: number) => {
    if (s >= 80) return { label: 'Reliable', color: 'text-green-600', bg: isDark ? 'bg-green-900/20' : 'bg-green-50', icon: CheckCircle }
    if (s >= 50) return { label: 'Moderate', color: 'text-yellow-600', bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50', icon: AlertTriangle }
    return { label: 'Poor', color: 'text-red-600', bg: isDark ? 'bg-red-900/20' : 'bg-red-50', icon: TrendingDown }
  }

  const status = getStatus(score)
  const StatusIcon = status.icon

  // Generate summary based on data
  const getSummary = () => {
    const points: string[] = []
    
    // Main consistency assessment
    if (score >= 80) {
      points.push('✓ User maintains excellent consistency across all face verification attempts')
      points.push('✓ Confidence scores remain stable throughout the session')
      points.push('✓ User behavior is reliable and predictable')
    } else if (score >= 50) {
      points.push('⚠ User shows moderate consistency in verification attempts')
      points.push('⚠ Some variation detected in confidence levels during the session')
      points.push('⚠ Performance is acceptable but could be improved')
    } else {
      points.push('✗ User shows high inconsistency in verification attempts')
      points.push('✗ Confidence levels vary significantly across attempts')
      points.push('✗ Recommend investigation - user may need assistance or re-training')
    }
    
    // Variation analysis
    if (stdDev < 0.15) {
      points.push('✓ Very stable: Minimal difference between best and worst attempts')
    } else if (stdDev < 0.3) {
      points.push('⚠ Moderate spread: Some attempts differ significantly from others')
    } else {
      points.push('✗ Unstable: Large gap between highest and lowest confidence scores')
    }
    
    // Reliability assessment
    if (cv < 0.25) {
      points.push('✓ Highly reliable: User can be trusted for consistent verification')
    } else if (cv < 0.5) {
      points.push('⚠ Moderate reliability: Results may vary on different attempts')
    } else {
      points.push('✗ Low reliability: Cannot depend on consistent verification results')
    }
    
    // Overall recommendation
    if (score >= 80 && stdDev < 0.2 && cv < 0.3) {
      points.push('✓ Overall: User is fully compliant and reliable for attendance marking')
    } else if (score < 50 || stdDev > 0.4 || cv > 0.5) {
      points.push('✗ Overall: Attention required - review user verification setup')
    } else {
      points.push('⚠ Overall: Monitor user performance for any declining trends')
    }
    
    return points
  }

  const summaryPoints = getSummary()

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden mt-6 mb-2 w-full ${
      isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'
    }`}>
      <div className={`px-5 py-3 border-b flex items-center gap-2 ${
        isDark ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-100'
      }`}>
        <Activity size={14} className="text-indigo-500" />
        <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Consistency Analysis</h3>
      </div>
      
      <div className="p-6">
        {/* NEW LAYOUT: Top Score Banner + 2 Column Below */}
        <div className="space-y-4">
          {/* TOP: Big Score Card - Full Width */}
          <div className={`p-5 rounded-2xl flex items-center justify-between ${isDark ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Consistency Score</p>
              <div className={`text-4xl font-black ${status.color}`}>{score.toFixed(0)}%</div>
            </div>
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-wider ${status.bg} ${status.color}`}>
              <StatusIcon size={16} />
              {status.label}
            </div>
          </div>

          {/* BOTTOM: 2 Columns - Metrics Left (stacked), Summary Right (wider) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* LEFT: 2 Metrics Stacked - takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              {/* VARIATION RANGE */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Variation Range</p>
                  <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${stdDev < 0.2 ? 'bg-green-100 text-green-700' : stdDev < 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {stdDev < 0.2 ? 'Low ✓' : stdDev < 0.4 ? 'Medium' : 'High ⚠'}
                  </div>
                </div>
                <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stdDev.toFixed(2)}</div>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  How much scores differ from average. Lower = more stable.
                </p>
              </div>

              {/* RELIABILITY INDEX */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reliability Index</p>
                  <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${cv < 0.3 ? 'bg-green-100 text-green-700' : cv < 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {cv < 0.3 ? 'Good ✓' : cv < 0.5 ? 'Okay' : 'Poor ⚠'}
                  </div>
                </div>
                <div className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{(cv * 100).toFixed(1)}%</div>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Below 30% = trustworthy, above 50% = needs attention.
                </p>
              </div>
            </div>

            {/* RIGHT: Summary - takes 3 columns (wider) */}
            <div className={`lg:col-span-3 p-5 rounded-2xl flex flex-col max-h-[280px] ${isDark ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
              <h4 className={`text-[11px] font-black uppercase tracking-tight flex items-center gap-2 mb-4 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <Info size={14} />
                Quick Summary
              </h4>
              <ul className="space-y-2.5 overflow-y-auto pr-2">
                {summaryPoints.map((point, idx) => (
                  <li key={idx} className={`text-[11px] leading-relaxed flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      {idx + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
