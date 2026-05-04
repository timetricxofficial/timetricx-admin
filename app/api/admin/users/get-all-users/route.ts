import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 1000
    const verified = searchParams.get('verified') || 'all' // all | verified | not-verified

    const skip = (page - 1) * limit

    // Build filter based on verified param
    const filter: any = { role: 'user' }
    if (verified === 'verified') {
      filter.isEmailVerified = true
    } else if (verified === 'not-verified') {
      filter.isEmailVerified = false
    }
    // 'all' → no isEmailVerified filter, shows both

    const total = await User.countDocuments(filter)

    const users = await User.find(filter)
      .select('name email mobileNumber isActive isEmailVerified createdAt workingRole designation skills profile.bio')
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
