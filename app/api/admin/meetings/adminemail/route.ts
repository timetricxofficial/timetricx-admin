import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function GET() {
  try {
    await connectDB()

    const admins = await Admin.find({}).select('email name')

    return NextResponse.json({
      success: true,
      data: admins.map(a => ({
        email: a.email,
        name: a.name
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin emails' },
      { status: 500 }
    )
  }
}
