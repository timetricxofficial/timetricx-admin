'use client'

import React from 'react'
import { Calendar, CheckCircle2, AlertCircle, XCircle, TrendingUp, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DayDetail {
  date: string
  avgConfidence: number
  highestConfidence: number
  attempts: number
  status: 'Present' | 'Partial' | 'Absent'
  reliability: number
  consistencyScore: number
}

interface MultiDaySummaryProps {
  summary: {
    totalDays: number
    presentDays: number
    partialDays: number
    absentDays: number
    avgConfidence: number
    overallConsistency: number
  }
  trendData: { date: string; confidence: number }[]
  dailyDetails: DayDetail[]
  reliabilityScore: number
  behavior: 'Reliable' | 'Inconsistent' | 'Suspicious'
  theme?: string
}

export default function MultiDaySummary({ summary, trendData, dailyDetails, reliabilityScore, behavior, theme }: MultiDaySummaryProps) {
  const isDark = theme === 'dark'
  
  const getBehaviorConfig = () => {
    switch (behavior) {
      case 'Reliable': return { color: 'text-green-600', label: 'RELIABLE', desc: 'Consistent presence maintained.' }
      case 'Inconsistent': return { color: 'text-orange-600', label: 'INCONSISTENT', desc: 'Consistency can be improved.' }
      case 'Suspicious': return { color: 'text-red-600', label: 'SUSPICIOUS', desc: 'Frequent absences detected.' }
    }
  }

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const config = getBehaviorConfig()

  return (
    <div className="space-y-6">
      {/* SUMMARY OVERVIEW */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
        <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className={`w-1 h-3 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-gray-900'}`}></div> Summary Overview
        </h3>
        <div className="grid grid-cols-5 gap-4">
          <StatMiniCard label="Total Days" value={summary.totalDays} icon={<Calendar className="text-blue-500" />} theme={theme} />
          <StatMiniCard label="Present Days" value={summary.presentDays} subValue={`${((summary.presentDays/summary.totalDays)*100).toFixed(0)}%`} icon={<CheckCircle2 className="text-green-500" />} theme={theme} />
          <StatMiniCard label="Partial Days" value={summary.partialDays} subValue={`${((summary.partialDays/summary.totalDays)*100).toFixed(0)}%`} icon={<AlertCircle className="text-yellow-500" />} theme={theme} />
          <StatMiniCard label="Absent Days" value={summary.absentDays} subValue={`${((summary.absentDays/summary.totalDays)*100).toFixed(0)}%`} icon={<XCircle className="text-red-500" />} theme={theme} />
          <StatMiniCard label="Avg Confidence" value={summary.avgConfidence.toFixed(2)} icon={<TrendingUp className="text-indigo-500" />} theme={theme} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* TREND GRAPH */}
        <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
          <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average Confidence Over Days</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    fontSize: '10px',
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    color: isDark ? '#fff' : '#000'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <ReferenceLine y={0.5} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="confidence" stroke="#004d40" strokeWidth={3} dot={{ r: 4, fill: '#004d40', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RELIABILITY & CONSISTENCY */}
        <div className="grid grid-cols-1 gap-4">
            <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                <div className="absolute top-4 left-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Overall Reliability</div>
                <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke={isDark ? '#252833' : '#f3f4f6'} strokeWidth="8" fill="none" />
                        <circle 
                            cx="56" cy="56" r="50" 
                            stroke={reliabilityScore > 60 ? '#10b981' : reliabilityScore > 40 ? '#f59e0b' : '#ef4444'} 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray={314}
                            strokeDashoffset={314 - (314 * reliabilityScore) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{reliabilityScore}%</span>
                    </div>
                </div>
                <h4 className={`text-xs font-black uppercase tracking-widest ${config.color} mb-1`}>{config.label}</h4>
                <p className="text-[9px] text-gray-400 font-bold leading-tight uppercase tracking-tighter italic">Keep improving! Consistency is the key.</p>
            </div>

            <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-5 rounded-2xl border shadow-sm flex items-center justify-between`}>
                <div>
                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Overall Consistency</h3>
                    <div className={`text-2xl font-black ${getConsistencyColor(summary.overallConsistency)}`}>
                        {summary.overallConsistency.toFixed(0)}%
                    </div>
                </div>
                <div className="flex-1 max-w-[150px] space-y-1.5 ml-8">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Consistency Guide</p>
                    <div className="flex items-center gap-2 text-[8px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-gray-500">80% - 100%</span>
                        <span className="text-green-600 uppercase ml-auto">Reliable</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-500">50% - 79%</span>
                        <span className="text-yellow-600 uppercase ml-auto">Moderate</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-gray-500">0% - 49%</span>
                        <span className="text-red-600 uppercase ml-auto">Poor</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* DAILY DETAILS TABLE */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} rounded-2xl border shadow-sm overflow-hidden`}>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} px-5 py-3`}>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Daily Details</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] font-black uppercase tracking-wider border-b ${
              isDark ? 'text-gray-500 border-gray-800 bg-[#252833]' : 'text-gray-400 border-gray-100 bg-gray-50'
            }`}>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-center">Avg Confidence</th>
              <th className="px-5 py-3 text-center">Highest Confidence</th>
              <th className="px-5 py-3 text-center">Attempts</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Consistency Score</th>
              <th className="px-5 py-3 text-right">Reliability Score</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-50'}`}>
            {dailyDetails.map((day, idx) => (
              <tr key={idx} className={`${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                <td className={`px-5 py-3 text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.date}</td>
                <td className={`px-5 py-3 text-[11px] font-black text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.avgConfidence.toFixed(2)}</td>
                <td className={`px-5 py-3 text-[11px] font-black text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.highestConfidence.toFixed(2)}</td>
                <td className={`px-5 py-3 text-[11px] font-black text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.attempts}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    day.status === 'Present' ? (isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50') : 
                    day.status === 'Partial' ? (isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-50') : 
                    (isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50')
                  }`}>
                    {day.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                    <span className={`text-[11px] font-black ${getConsistencyColor(day.consistencyScore)}`}>
                        {day.consistencyScore.toFixed(0)}%
                    </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className={`h-full rounded-full ${day.reliability > 60 ? 'bg-green-500' : day.reliability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${day.reliability}%` }}></div>
                    </div>
                    <span className={`text-[11px] font-black w-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day.reliability}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NOTE */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold italic uppercase tracking-tighter">
        <Info size={14} />
        Note: Confidence is calculated based on face verification attempts. More consistency in attempts with higher confidence leads to a better reliability score.
      </div>
    </div>
  )
}

function StatMiniCard({ label, value, subValue, icon, theme }: any) {
  const isDark = theme === 'dark'
  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-center relative overflow-hidden group transition-colors ${
      isDark ? 'bg-[#252833] border-gray-800 hover:border-indigo-500/50' : 'bg-gray-50 border-gray-100 hover:border-blue-200'
    }`}>
      <div className="absolute -right-2 -top-2 opacity-10 scale-150 group-hover:scale-[1.7] transition-transform duration-500">{icon}</div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">{label}</p>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        {subValue && <span className="text-[10px] font-bold text-green-600">{subValue}</span>}
      </div>
    </div>
  )
}
