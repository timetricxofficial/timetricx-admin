import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const admin = await Admin.findOne({ email })

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    // Toggle isDisabled status
    admin.isDisabled = !admin.isDisabled
    await admin.save()

    return NextResponse.json({
      success: true,
      message: `Admin ${admin.isDisabled ? 'disabled' : 'enabled'} successfully`
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to toggle admin status' },
      { status: 500 }
    )
  }
}
