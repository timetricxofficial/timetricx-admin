import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }, {
      name: 1,
      email: 1,
      designation: 1,
      mobileNumber: 1,
      edit: 1,
      status: 1,
      isDisabled: 1,
      createdAt: 1,
      updatedAt: 1
    }).lean()

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

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin' },
      { status: 500 }
    )
  }
}
