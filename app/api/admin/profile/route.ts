import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Get admin user from cookie
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')?.value

    if (!adminUserCookie) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse admin user data
    let adminData
    try {
      adminData = JSON.parse(adminUserCookie)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid admin data' },
        { status: 401 }
      )
    }

    const adminEmail = adminData.email

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin email not found' },
        { status: 401 }
      )
    }

    const admin = await Admin.findOne({ email: adminEmail }).select('-password')

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: admin
    })
  } catch (error) {
    console.error('Get admin profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin profile' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB()

    // Get admin user from cookie
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')?.value

    if (!adminUserCookie) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse admin user data
    let adminData
    try {
      adminData = JSON.parse(adminUserCookie)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid admin data' },
        { status: 401 }
      )
    }

    const adminEmail = adminData.email

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin email not found' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, designation, mobileNumber } = body

    // Validate required fields
    if (!name || !designation) {
      return NextResponse.json(
        { success: false, message: 'Name and designation are required' },
        { status: 400 }
      )
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: adminEmail },
      {
        name,
        designation,
        mobileNumber,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password')

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    })
  } catch (error) {
    console.error('Update admin profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
