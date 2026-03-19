import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { User } from '@/models/User'
import { FaceAttendance } from '@/models/FaceAttendance'
import { Project } from '@/models/Project'
import { Contact } from '@/models/Contact'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Get all counts in parallel
    const [totalUsers, verifiedUsers, totalAttendance, totalProjects, totalContacts] = await Promise.all([
      // Total all users
      User.countDocuments({ role: 'user' }),

      // Total verified users
      User.countDocuments({
        isEmailVerified: true,
        role: 'user'
      }),

      // Total face attendance records
      FaceAttendance.countDocuments(),

      // Total projects
      Project.countDocuments(),

      // Total contact/help requests
      Contact.countDocuments()
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: totalUsers,
        verifiedUsers: verifiedUsers,
        attendance: totalAttendance,
        projects: totalProjects,
        contacts: totalContacts
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
