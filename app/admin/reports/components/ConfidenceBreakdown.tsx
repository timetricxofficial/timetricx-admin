'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

interface BreakdownData {
  category: string
  range: string
  count: number
  percent: number
  color: string
}

interface ConfidenceBreakdownProps {
  breakdown: BreakdownData[]
  timelineData: { time: string; confidence: number }[]
  totalAttempts: number
  theme?: string
}

export default function ConfidenceBreakdown({ breakdown, timelineData, totalAttempts, theme }: ConfidenceBreakdownProps) {
  const isDark = theme === 'dark'
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {/* DONUT CHART */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Confidence Summary</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-40 h-40 relative">
              <PieChart width={160} height={160}>
                <Pie
                  data={breakdown}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-2xl font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalAttempts}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
              <div className="col-span-1">Category</div>
              <div className="text-center">Range</div>
              <div className="text-center">Count</div>
              <div className="text-center">Percent</div>
            </div>
            {breakdown.map((item, idx) => (
              <div key={idx} className={`grid grid-cols-4 items-center text-[10px] font-medium p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  {item.category}
                </div>
                <div className="text-center text-gray-500 font-bold">{item.range}</div>
                <div className={`text-center font-black ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{item.count}</div>
                <div className={`text-center font-black ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{item.percent.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LINE CHART */}
      <div className={`${isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'} p-6 rounded-2xl border shadow-sm`}>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Confidence Over Time</h3>
        <div className="h-40 w-full">
            <LineChart width={450} height={160} data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f0f0f0'} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#9ca3af', fontWeight: 'bold'}} 
              />
              <YAxis 
                domain={[0, 1]} 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#9ca3af', fontWeight: 'bold'}} 
              />
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
              <ReferenceLine y={0.25} stroke="#f59e0b" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#00897b" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#00897b', strokeWidth: 0 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
        </div>
      </div>
    </div>
  )
}
