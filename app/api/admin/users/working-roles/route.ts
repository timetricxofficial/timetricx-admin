import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { User } from '@/models/User'

export const dynamic = 'force-dynamic'

// Helper to get current admin from cookies
async function getCurrentAdmin(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...rest] = c.trim().split('=')
        return [key, rest.join('=')]
      })
    )

    const adminUserCookie = cookies.adminUser
    if (!adminUserCookie) return null

    const adminData = JSON.parse(decodeURIComponent(adminUserCookie))
    return adminData
  } catch {
    return null
  }
}

// GET - Get all unique working roles from users
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get distinct working roles from users
    const workingRoles = await User.distinct('workingRole', { 
      workingRole: { $exists: true, $nin: [null, ''] }
    })

    // Filter out null/empty and sort
    const filteredRoles = workingRoles
      .filter((role): role is string => !!role && role.trim() !== '')
      .sort()

    return NextResponse.json({
      success: true,
      data: filteredRoles
    })
  } catch (error) {
    console.error('Error fetching working roles:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch working roles' }, { status: 500 })
  }
}
