import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { FaceAttendance } from '@/models/FaceAttendance'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const verified = searchParams.get('verified') || 'all' // all | verified | not-verified

    const skip = (page - 1) * limit

    /* ================= BUILD USER FILTER ================= */
    const userFilter: any = { role: 'user' }
    if (verified === 'verified') {
      userFilter.isEmailVerified = true
    } else if (verified === 'not-verified') {
      userFilter.isEmailVerified = false
    }

    /* ================= GET USERS ================= */
    const total = await User.countDocuments(userFilter)

    const users = await User.find(userFilter)
      .select('name email isEmailVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    /* ================= GET ATTENDANCE FOR THESE USERS ================= */
    const emails = users.map((u: any) => u.email)
    const attendanceRecords = await FaceAttendance.find({ userEmail: { $in: emails } }).lean()

    // Map attendance by email
    const attendanceMap: Record<string, any> = {}
    attendanceRecords.forEach((record: any) => {
      attendanceMap[record.userEmail] = record
    })

    // Build combined data
    const data = users.map((user: any) => {
      const attendance = attendanceMap[user.email]
      return {
        _id: attendance?._id || user._id,
        userEmail: user.email,
        userName: user.name,
        isEmailVerified: user.isEmailVerified ?? false,
        months: attendance?.months || [],
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    })

  } catch (error) {
    console.error('Attendance fetch error:', error)

    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    )
  }
}

