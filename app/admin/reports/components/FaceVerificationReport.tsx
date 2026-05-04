'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ArrowLeft, Calendar, Download, FileText, Layout, Info } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

// Components
import ReportHeader from './ReportHeader'
import ReportStats from './ReportStats'
import ConfidenceBreakdown from './ConfidenceBreakdown'
import ReportTable from './ReportTable'
import ReportInsights from './ReportInsights'
import MultiDaySummary from './MultiDaySummary'
import ConsistencyAnalysis from './ConsistencyAnalysis'

interface FaceVerificationReportProps {
  user: any
  onBack: () => void
}

export default function FaceVerificationReport({ user, onBack }: FaceVerificationReportProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const reportRef = useRef<HTMLDivElement>(null)
  
  // Date states
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(todayStr)
  const [toDate, setToDate] = useState(todayStr)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rawData, setRawData] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setIsMultiDay(fromDate !== toDate)
    fetchData()
  }, [fromDate, toDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/face-verification?email=${user.email}&fromDate=${fromDate}&toDate=${toDate}`)
      const data = await res.json()
      if (data.success) {
        setRawData(data.data.sessions)
      }
    } catch (error) {
      console.error('Fetch data error:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- MATHEMATICAL LOGIC ---
  const calculateConsistency = (values: number[]) => {
    if (values.length === 0) return { score: 0, stdDev: 0, cv: 0 }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    
    // Standard Deviation
    const squareDiffs = values.map(v => Math.pow(v - avg, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(avgSquareDiff)
    
    // Coefficient of Variation (CV)
    const cv = avg > 0 ? stdDev / avg : 0
    
    // Consistency Score (1 - CV) * 100, clamped 0-100
    let score = (1 - cv) * 100
    score = Math.max(0, Math.min(100, score))
    
    return { score, stdDev, cv }
  }

  // --- DATA PROCESSING LOGIC ---

  const processSingleDay = () => {
    const attempts = rawData.flatMap(s => s.attempts || []).map(a => {
      // Robust date parsing
      const timestamp = new Date(a.time);
      const timeStr = isNaN(timestamp.getTime()) ? 'N/A' : timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
      
      return {
        time: timeStr,
        confidence: a.confidence,
        category: getCategory(a.confidence),
        status: a.confidence >= 0.5 ? 'SUCCESS' : a.confidence >= 0.25 ? 'PARTIAL' : 'FAILED' as any
      };
    })

    const confValues = attempts.map(a => a.confidence)
    const consistency = calculateConsistency(confValues)

    const avgConfidence = attempts.length > 0 ? attempts.reduce((acc, curr) => acc + curr.confidence, 0) / attempts.length : 0
    const highestConfidence = attempts.length > 0 ? Math.max(...attempts.map(a => a.confidence)) : 0
    
    // Status Logic: ≥0.5 Present, multiple ≥0.25 Partial, else Absent
    let status: 'Present' | 'Partial' | 'Absent' = 'Absent'
    if (attempts.some(a => a.confidence >= 0.5)) status = 'Present'
    else if (attempts.filter(a => a.confidence >= 0.25).length >= 2) status = 'Partial'

    // Breakdown
    const categories = [
      { label: 'Strong', range: '≥ 0.60', min: 0.6, color: '#00695c' },
      { label: 'Verified', range: '0.50 - 0.60', min: 0.5, color: '#00897b' },
      { label: 'Lenient', range: '0.40 - 0.50', min: 0.4, color: '#4db6ac' },
      { label: 'Weak', range: '0.25 - 0.40', min: 0.25, color: '#b2dfdb' },
      { label: 'No Detection', range: '< 0.25', min: 0, color: '#ef5350' }
    ]

    const breakdown = categories.map(cat => {
      const count = attempts.filter(a => {
        if (cat.label === 'Strong') return a.confidence >= 0.6
        if (cat.label === 'No Detection') return a.confidence < 0.25
        const nextCat = categories[categories.indexOf(cat) - 1]
        return a.confidence >= cat.min && a.confidence < (nextCat ? nextCat.min : 1.1)
      }).length
      return {
        category: cat.label,
        range: cat.range,
        count,
        percent: attempts.length > 0 ? (count / attempts.length) * 100 : 0,
        color: cat.color
      }
    })

    // Behavior Tag: Based on Fail Ratio (failed / total)
    const totalAttempts = attempts.length
    const failedAttempts = attempts.filter(a => a.status === 'FAILED').length
    const failRatio = totalAttempts > 0 ? (failedAttempts / totalAttempts) * 100 : 0

    let behavior: 'Reliable' | 'Inconsistent' | 'Suspicious' = 'Reliable'
    if (failRatio > 50) behavior = 'Suspicious'
    else if (failRatio >= 30) behavior = 'Inconsistent'
    else behavior = 'Reliable'

    // Insights
    const insights: any[] = []
    if (status === 'Present') insights.push({ type: 'success', text: `User was detected multiple times with moderate to high confidence.` })
    if (attempts.some(a => a.confidence < 0.4 && a.confidence >= 0.25)) insights.push({ type: 'warning', text: 'Some attempts have low confidence. Ensure proper lighting and front face.' })
    if (avgConfidence >= 0.5) insights.push({ type: 'info', text: 'Overall presence is acceptable but consistency can be improved.' })

    return { attempts, avgConfidence, highestConfidence, status, breakdown, behavior, insights, consistency }
  }

  const processMultiDay = () => {
    // Group rawData by date
    const daysMap = new Map()
    rawData.forEach(session => {
        const timestamp = new Date(session.startTime);
        if (isNaN(timestamp.getTime())) return;
        const date = timestamp.toLocaleDateString()
        if (!daysMap.has(date)) daysMap.set(date, [])
        daysMap.get(date).push(session)
    })

    const dailyDetails = Array.from(daysMap.entries()).map(([date, sessions]) => {
        const attempts = sessions.flatMap((s: any) => s.attempts || [])
        const confValues = attempts.map((a: any) => a.confidence)
        const consistency = calculateConsistency(confValues)

        const avgConf = attempts.length > 0 ? attempts.reduce((acc: any, curr: any) => acc + curr.confidence, 0) / attempts.length : 0
        const highConf = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.confidence)) : 0
        
        let status: 'Present' | 'Partial' | 'Absent' = 'Absent'
        if (attempts.some((a: any) => a.confidence >= 0.5)) status = 'Present'
        else if (attempts.filter((a: any) => a.confidence >= 0.25).length >= 2) status = 'Partial'

        return {
            date,
            avgConfidence: avgConf,
            highestConfidence: highConf,
            attempts: attempts.length,
            status,
            reliability: Math.round(avgConf * 100),
            consistencyScore: consistency.score
        }
    })

    const totalDays = dailyDetails.length || 1
    const presentDays = dailyDetails.filter(d => d.status === 'Present').length
    const partialDays = dailyDetails.filter(d => d.status === 'Partial').length
    const absentDays = dailyDetails.filter(d => d.status === 'Absent').length
    const avgConfidence = dailyDetails.length > 0 ? dailyDetails.reduce((acc, curr) => acc + curr.avgConfidence, 0) / dailyDetails.length : 0
    const overallConsistency = dailyDetails.length > 0 ? dailyDetails.reduce((acc, curr) => acc + curr.consistencyScore, 0) / dailyDetails.length : 0
    const reliabilityScore = Math.round((presentDays / totalDays) * 100)
    
    // Multi-day Behavior Tag based on overall fail ratio
    const allAttempts = rawData.flatMap(s => s.attempts || [])
    const totalAllAttempts = allAttempts.length
    const failedAllAttempts = allAttempts.filter(a => a.confidence < 0.25).length // Using 0.25 as FAILED threshold
    const overallFailRatio = totalAllAttempts > 0 ? (failedAllAttempts / totalAllAttempts) * 100 : 0

    let behavior: 'Reliable' | 'Inconsistent' | 'Suspicious' = 'Reliable'
    if (overallFailRatio > 50) behavior = 'Suspicious'
    else if (overallFailRatio >= 30) behavior = 'Inconsistent'
    else behavior = 'Reliable'
    
    const trendData = dailyDetails.map(d => ({ date: d.date.split('/')[0] + '/' + d.date.split('/')[1], confidence: d.avgConfidence }))

    return { summary: { totalDays, presentDays, partialDays, absentDays, avgConfidence, overallConsistency }, trendData, dailyDetails, reliabilityScore, behavior }
  }

  const getCategory = (conf: number) => {
    if (conf >= 0.6) return 'Strong (≥ 0.60)'
    if (conf >= 0.5) return 'Verified (0.50 - 0.60)'
    if (conf >= 0.4) return 'Lenient (0.40 - 0.50)'
    if (conf >= 0.25) return 'Weak Presence (0.25 - 0.40)'
    return 'No Detection (< 0.25)'
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setIsExporting(true)
    
    // Give state time to update to light theme
    setTimeout(async () => {
      try {
        const element = reportRef.current
        
        // --- Aggressive "lab" Error Fix ---
        // 1. Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '1200px';
        document.body.appendChild(tempContainer);

        // 2. Clone the content and manually strip "lab(" strings from the entire HTML
        let sanitizedHtml = element!.innerHTML;
        // This regex removes any style property containing lab( followed by anything up to the closing )
        sanitizedHtml = sanitizedHtml.replace(/lab\([^)]*\)/g, 'rgb(0,0,0)');
        
        const sanitizedElement = element!.cloneNode(true) as HTMLElement;
        sanitizedElement.innerHTML = sanitizedHtml;
        sanitizedElement.style.padding = '40px';
        sanitizedElement.style.backgroundColor = '#ffffff';
        sanitizedElement.style.color = '#000000';
        sanitizedElement.style.width = '1200px';
        sanitizedElement.style.borderRadius = '0';
        
        tempContainer.appendChild(sanitizedElement);

        const canvas = await html2canvas(sanitizedElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1200
        });

        // Cleanup
        document.body.removeChild(tempContainer);
        
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        let heightLeft = imgHeight
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pdfHeight
        }
        
        pdf.save(`Presence_Report_${user.name}_${fromDate}.pdf`)
      } catch (err) {
        console.error("PDF Export failed:", err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  }

  const singleDayData = !isMultiDay ? processSingleDay() : null
  const multiDayData = isMultiDay ? processMultiDay() : null

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6 p-6 pb-20 report-page-container">
        
        {/* TOP SELECTOR & ACTIONS */}
        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border shadow-sm no-print ${
          isDark ? 'bg-[#1a1c23] border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
              <button 
                  onClick={onBack}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Back to list"
              >
                  <ArrowLeft size={20} />
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isDark ? 'bg-[#252833] border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <Calendar size={18} className="text-gray-400" />
                  <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={`bg-transparent text-sm font-bold focus:outline-none ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  />
                  <span className="text-gray-300 font-bold">to</span>
                  <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`bg-transparent text-sm font-bold focus:outline-none ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                  />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Layout size={14} />
                  Mode: <span className="text-indigo-600">{isMultiDay ? 'Multi Day' : 'Single Day'}</span>
              </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Download size={18} /> {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* MAIN REPORT - LIGHT THEME (Display matches theme, PDF forces light) */}
        <div 
          ref={reportRef}
          id="presence-report-content"
          className={`p-10 rounded-[2.5rem] shadow-2xl transition-colors duration-300 border ${
            isExporting || !isDark 
              ? 'bg-white border-gray-100 text-gray-900 shadow-black/5' 
              : 'bg-[#1a1c23] border-gray-800 text-white shadow-black/20'
          }`}
        >
        <ReportHeader 
          type={isMultiDay ? 'MULTIPLE' : 'SINGLE'} 
          dateRange={isMultiDay ? `${fromDate} to ${toDate}` : fromDate} 
          user={user} 
          theme={isExporting ? 'light' : theme}
        />

        {loading ? (
            <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Generating Report...</p>
            </div>
        ) : (
            <>
                {!isMultiDay && singleDayData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ReportStats 
                            status={singleDayData.status}
                            avgConfidence={singleDayData.avgConfidence}
                            highestConfidence={singleDayData.highestConfidence}
                            totalAttempts={singleDayData.attempts.length}
                            theme={isExporting ? 'light' : theme}
                        />

                        <ConfidenceBreakdown 
                            breakdown={singleDayData.breakdown}
                            timelineData={singleDayData.attempts}
                            totalAttempts={singleDayData.attempts.length}
                            theme={isExporting ? 'light' : theme}
                        />

                        <div className="grid grid-cols-3 gap-6 items-start">
                            <div className="col-span-2 flex flex-col gap-6">
                                <ReportTable 
                                    attempts={singleDayData.attempts} 
                                    theme={isExporting ? 'light' : theme}
                                />
                            </div>
                            <div className="col-span-1">
                                <ReportInsights 
                                    avgConfidence={singleDayData.avgConfidence}
                                    behavior={singleDayData.behavior}
                                    insights={singleDayData.insights}
                                    theme={isExporting ? 'light' : theme}
                                />
                            </div>
                        </div>

                        <ConsistencyAnalysis 
                            score={singleDayData.consistency.score}
                            stdDev={singleDayData.consistency.stdDev}
                            cv={singleDayData.consistency.cv}
                            theme={isExporting ? 'light' : theme}
                        />
                    </div>
                ) : multiDayData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <MultiDaySummary 
                            summary={multiDayData.summary}
                            trendData={multiDayData.trendData}
                            dailyDetails={multiDayData.dailyDetails}
                            reliabilityScore={multiDayData.reliabilityScore}
                            behavior={multiDayData.behavior}
                            theme={isExporting ? 'light' : theme}
                        />
                    </div>
                ) : null}

                {/* FOOTER - Moved outside of the main content flow if necessary or ensured clear separation */}
                <div className={`mt-10 pt-8 border-t flex flex-col md:flex-row justify-between items-center md:items-end gap-6 ${isDark && !isExporting ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark && !isExporting ? 'bg-gray-800' : 'bg-gray-900'}`}>
                            <img src="/Timetricx logo.svg" alt="Logo" className="w-6 h-6 brightness-0 invert" />
                        </div>
                        <div>
                            <p className={`text-xs font-black ${isDark && !isExporting ? 'text-white' : 'text-gray-900'}`}>Cybershoora AI System</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Secure Presence Intelligence</p>
                        </div>
                    </div>
                    
                    <div className="text-center md:text-right space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Report Generated On</p>
                        <p className={`text-xs font-black ${isDark && !isExporting ? 'text-white' : 'text-gray-900'}`}>{new Date().toLocaleString()}</p>
                        <p className="text-[9px] text-indigo-500 font-bold uppercase">Generated by Cybershoora Intelligence</p>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
    </div>
  )
}
