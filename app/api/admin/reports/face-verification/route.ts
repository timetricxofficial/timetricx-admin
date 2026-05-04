import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { FaceVerificationLog } from '@/models/FaceVerificationLog'
import { User } from '@/models/User'
import { FaceAttendance } from '@/models/FaceAttendance'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const fromDate = searchParams.get('fromDate') // YYYY-MM-DD
    const toDate = searchParams.get('toDate')     // YYYY-MM-DD

    // If no email, return list of all interns with summary
    if (!email) {
      const users = await User.find({ role: 'user' }).select('name email workingRole profilePicture')
      
      // ✅ Fix Timezone: Get IST Date and Month
      const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      
      // Format: YYYY-MM-DD in IST
      const year = istDate.getFullYear()
      const month = String(istDate.getMonth() + 1).padStart(2, '0')
      const day = String(istDate.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`

      // Format: "April 2026" in IST
      const fullMonthName = istDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      const shortMonthName = istDate.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
      
      console.log('IST Debug - Today:', today)
      console.log('IST Debug - Months:', [fullMonthName, shortMonthName])

      const logs = await FaceVerificationLog.find({ date: today })

      const attendance = await FaceAttendance.find({
        'months.monthName': { $in: [fullMonthName, shortMonthName] }
      })

      const usersWithStats = users.map(user => {
        const userLog = logs.find(log => log.userEmail === user.email)
        let stats = { total: 0, success: 0, suspicious: 0, missed: 0, partial: 0 }
        
        if (userLog) {
          userLog.sessions.forEach((s: any) => {
            stats.total++
            if (s.finalStatus === 'success') stats.success++
            else if (s.finalStatus === 'suspicious') stats.suspicious++
            else if (s.finalStatus === 'missed') stats.missed++
          })
        }

        // Check if user is checked in today and within 6 hours
        const userAttendance = attendance.find(a => a.userEmail === user.email)
        
        // Find month in either full or short format
        const currentMonth = userAttendance?.months.find(m => 
          m.monthName === fullMonthName || m.monthName === shortMonthName
        )
        
        const todayRecord = currentMonth?.records.find(r => r.date === today)
        
        if (user.email === 'aabhashsingh2004@gmail.com') {
          console.log('Debug - User Aabhash Found:', !!userAttendance)
          console.log('Debug - Month Found:', !!currentMonth, currentMonth?.monthName)
          console.log('Debug - Today Record:', todayRecord)
        }

        let isCheckedIn = false
        const hasExit = todayRecord?.exitTime && todayRecord.exitTime !== 'null' && todayRecord.exitTime !== ''

        if (todayRecord && todayRecord.entryTime && !hasExit) {
          try {
            const timeStr = todayRecord.entryTime.toLowerCase()
            const parts = timeStr.split(' ')
            const timePart = parts[0]
            const modifier = parts[1] || (timeStr.includes('am') ? 'am' : timeStr.includes('pm') ? 'pm' : '')
            
            let [hours, minutes, seconds] = timePart.replace(/[apm]/g, '').split(':').map(Number)

            if (modifier === 'pm' && hours < 12) hours += 12
            if (modifier === 'am' && hours === 12) hours = 0

            const entryDateTime = new Date(today)
            entryDateTime.setHours(hours, minutes || 0, seconds || 0)
            
            const nowIst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
            const diffInHours = (nowIst.getTime() - entryDateTime.getTime()) / (1000 * 60 * 60)
            
            // Reverted to 6 hours as requested, but using IST for 'now'
            isCheckedIn = diffInHours >= 0 && diffInHours <= 6
          } catch (e) {
            isCheckedIn = true
          }
        }

        return {
          ...user.toObject(),
          todayStats: stats,
          isCheckedIn
        }
      })

      return NextResponse.json({ success: true, data: usersWithStats })
    }

    // Detailed report for a specific user
    const query: any = { userEmail: email }
    if (fromDate && toDate) {
      query.date = { $gte: fromDate, $lte: toDate }
    } else {
      // Default to current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      query.date = { $gte: startOfMonth, $lte: endOfMonth }
    }

    const logs = await FaceVerificationLog.find(query).sort({ date: -1 })
    
    // Aggregating all sessions across selected dates
    let allSessions: any[] = []
    let totalStats = { total: 0, success: 0, suspicious: 0, missed: 0, partial: 0 }
    let totalFailAttempts = 0
    let totalSuccessAttempts = 0
    let totalPartialAttempts = 0

    logs.forEach(log => {
      log.sessions.forEach((s: any) => {
        totalStats.total++
        
        // Detailed attempt analysis for insight
        const attempts = s.attempts || []
        const sessionFailures = attempts.filter((a: any) => a.status === 'fail').length
        const sessionSuccess = attempts.filter((a: any) => a.status === 'success').length
        const sessionPartial = attempts.filter((a: any) => a.status === 'partial').length
        
        totalFailAttempts += sessionFailures
        totalSuccessAttempts += sessionSuccess
        totalPartialAttempts += sessionPartial

        if (s.finalStatus === 'success') {
          // If a session succeeded but had too many fails (e.g. 3+), it's actually suspicious
          if (sessionFailures >= 3) {
            totalStats.suspicious++
          } else {
            totalStats.success++
          }
        }
        else if (s.finalStatus === 'suspicious') totalStats.suspicious++
        else if (s.finalStatus === 'missed') totalStats.missed++
        
        // Count partial matches in total stats
        if (sessionPartial > 0) totalStats.partial++
        
        allSessions.push({
          date: log.date,
          ...s.toObject(),
          failureCount: sessionFailures // track for UI
        })
      })
    })

    // Sort sessions by date and time descending
    allSessions.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

    // Enhanced Analysis: "Acha" vs "Bura" behavior
    const sessionSuccessRate = totalStats.total > 0 ? (totalStats.success / totalStats.total) * 100 : 0
    const attemptFailRate = (totalSuccessAttempts + totalFailAttempts) > 0 
      ? (totalFailAttempts / (totalSuccessAttempts + totalFailAttempts)) * 100 
      : 0

    let insight: 'Good' | 'Suspicious' | 'Neutral' = "Neutral"
    
    // Logic: 
    // 1. Success rate should be high (>85%)
    // 2. Failure attempt rate should be low (<20%)
    if (sessionSuccessRate > 85 && attemptFailRate < 20) {
      insight = "Good"
    } else if (sessionSuccessRate < 60 || attemptFailRate > 40 || totalStats.suspicious > (totalStats.total * 0.2)) {
      insight = "Suspicious"
    }

    return NextResponse.json({
      success: true,
      data: {
        userEmail: email,
        totalStats,
        insight,
        sessions: allSessions
      }
    })

  } catch (error) {
    console.error('Face Verification Report Error:', error)
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
  }
}
