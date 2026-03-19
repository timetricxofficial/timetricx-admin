import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const page = Number(req.nextUrl.searchParams.get('page')) || 1
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10

    const skip = (page - 1) * limit

    const total = await Leave.countDocuments()

    const leaves = await Leave.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const hasMore = skip + leaves.length < total

    return NextResponse.json({
      success: true,
      data: leaves,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasMore
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
