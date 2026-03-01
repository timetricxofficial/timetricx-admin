import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { FaceAttendance } from '@/models/FaceAttendance'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    /* ================= GET DATA ================= */

    const total = await FaceAttendance.countDocuments()

    const data = await FaceAttendance.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Attendance fetch error:', error)

    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    )
  }
}
