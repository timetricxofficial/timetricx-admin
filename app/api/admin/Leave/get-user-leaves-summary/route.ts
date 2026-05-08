import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all' // all | approved | pending | rejected

    const skip = (page - 1) * limit

    /* ================= BUILD USER FILTER ================= */
    const userFilter: any = { role: 'user' }

    /* ================= GET USERS ================= */
    const total = await User.countDocuments(userFilter)

    const users = await User.find(userFilter)
      .select('name email isEmailVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    /* ================= GET LEAVES FOR THESE USERS ================= */
    const emails = users.map((u: any) => u.email)
    
    let leaveFilter: any = { userEmail: { $in: emails } }
    if (status !== 'all') {
      leaveFilter.status = status
    }

    const leaveRecords = await Leave.find(leaveFilter)
      .sort({ createdAt: -1 })
      .lean()

    // Group leaves by email
    const leavesMap: Record<string, any[]> = {}
    leaveRecords.forEach((record: any) => {
      if (!leavesMap[record.userEmail]) {
        leavesMap[record.userEmail] = []
      }
      leavesMap[record.userEmail].push(record)
    })

    // Build combined data
    const data = users.map((user: any) => {
      const userLeaves = leavesMap[user.email] || []
      
      // Calculate statistics
      const totalLeaves = userLeaves.length
      const approvedLeaves = userLeaves.filter((l: any) => l.status === 'approved').length
      const pendingLeaves = userLeaves.filter((l: any) => l.status === 'pending').length
      const rejectedLeaves = userLeaves.filter((l: any) => l.status === 'rejected').length
      const totalLeaveDays = userLeaves
        .filter((l: any) => l.status === 'approved')
        .reduce((sum: number, l: any) => sum + (l.totalDays || 0), 0)

      return {
        _id: user._id,
        userEmail: user.email,
        userName: user.name,
        isEmailVerified: user.isEmailVerified ?? false,
        leaves: userLeaves,
        stats: {
          totalLeaves,
          approvedLeaves,
          pendingLeaves,
          rejectedLeaves,
          totalLeaveDays
        }
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
    console.error('Leave summary fetch error:', error)

    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    )
  }
}
