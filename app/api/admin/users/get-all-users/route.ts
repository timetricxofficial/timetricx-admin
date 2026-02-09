import { NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET() {
  try {
    await connectDB()

    const users = await User.find({
      isEmailVerified: true,
      role: 'user' // 👈 sirf normal users
    })
      .select('name email mobileNumber isActive createdAt')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users'
      },
      { status: 500 }
    )
  }
}
