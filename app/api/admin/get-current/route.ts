import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get email from cookies
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...rest] = c.trim().split('=')
        return [key, rest.join('=')]
      })
    )

    const adminUserCookie = cookies.adminUser
    if (!adminUserCookie) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    let adminData
    try {
      adminData = JSON.parse(decodeURIComponent(adminUserCookie))
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid cookie data' },
        { status: 400 }
      )
    }

    const email = adminData.email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email not found in cookie' },
        { status: 400 }
      )
    }

    // Find admin by email from database
    const admin = await Admin.findOne(
      { email: email.toLowerCase() },
      { email: 1, status: 1, edit: 1, isDisabled: 1 }
    ).lean()

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        email: admin.email,
        status: admin.status,
        edit: admin.edit,
        isDisabled: admin.isDisabled
      }
    })

  } catch (err) {
    console.error('Get current admin error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
