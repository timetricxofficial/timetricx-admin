import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { leaveId } = body

    if (!leaveId) {
      return NextResponse.json(
        { success: false, message: 'Leave ID is required' },
        { status: 400 }
      )
    }

    const deletedLeave = await Leave.findByIdAndDelete(leaveId)

    if (!deletedLeave) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Leave request deleted successfully'
    })
  } catch (error) {
    console.error('Delete leave error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete leave request' },
      { status: 500 }
    )
  }
}
