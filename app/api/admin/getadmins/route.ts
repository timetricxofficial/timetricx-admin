import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const total = await Admin.countDocuments()

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
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: admins,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + admins.length < total
      }
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}
