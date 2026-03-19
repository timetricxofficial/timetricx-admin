import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { User } from '@/models/User'
import { FaceAttendance } from '@/models/FaceAttendance'
import { Project } from '@/models/Project'
import { Contact } from '@/models/Contact'
import { Leave } from '@/models/TakeLeave'
import { Meeting } from '@/models/Meeting'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Generate last 7 days array
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    // Get user registration data (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const userGrowthRaw = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Fill missing dates with 0
    const userGrowth = dates.map(date => ({
      _id: date,
      count: userGrowthRaw.find((u: any) => u._id === date)?.count || 0
    }))

    // DEBUG: Check FaceAttendance structure
    const sampleDoc = await FaceAttendance.findOne()
    console.log('Sample FaceAttendance:', JSON.stringify(sampleDoc, null, 2))

    // Get attendance data - Query by actual attendance dates in nested array
    const attendanceDataRaw = await FaceAttendance.aggregate([
      { $unwind: '$months' },
      { $unwind: '$months.records' },
      {
        $match: {
          'months.records.date': { $in: dates }
        }
      },
      {
        $group: {
          _id: '$months.records.date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    console.log('Attendance query dates:', dates)
    console.log('Attendance raw results:', attendanceDataRaw)

    // Fill missing dates with 0
    const attendanceData = dates.map(date => ({
      _id: date,
      count: attendanceDataRaw.find((a: any) => a._id === date)?.count || 0
    }))

    // Get project status distribution
    const projectStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get leave status distribution
    const leaveStatus = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get meeting status distribution
    const meetingStatus = await Meeting.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent activities (last 5 of each type)
    const recentUsers = await User.find({ isEmailVerified: true })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get recent attendance - simplified without populate
    const recentAttendance = await FaceAttendance.find()
      .select('userEmail createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    const recentContacts = await Contact.find()
      .select('fullName subject status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        userGrowth,
        attendanceData,
        projectStatus,
        leaveStatus,
        meetingStatus,
        recentActivities: {
          users: recentUsers,
          attendance: recentAttendance,
          contacts: recentContacts
        },
        dates
      }
    })
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
