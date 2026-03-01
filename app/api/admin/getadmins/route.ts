import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function GET() {
  try {
    await connectDB()

    const admins = await Admin.find({}, {
      name: 1,
      email: 1,
      designation: 1,
      mobileNumber: 1,
      profilePicture: 1,
      edit: 1,
      status: 1,
      isDisabled: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: admins
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}
