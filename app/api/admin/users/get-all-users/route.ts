import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const skip = (page - 1) * limit

    const total = await User.countDocuments({
      isEmailVerified: true,
      role: 'user'
    })

    const users = await User.find({
      isEmailVerified: true,
      role: 'user' // 👈 sirf normal users
    })
      .select('name email mobileNumber isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
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
