import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { leaveId, status, rejectionReason } = body

    if (!leaveId || !status) {
      return NextResponse.json(
        { success: false, message: 'Leave ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      )
    }

    if (status === 'rejected' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Rejection reason is required when rejecting a leave' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date()
      updateData.rejectionReason = null
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason.trim()
      updateData.approvedAt = null
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      updateData,
      { new: true }
    )

    if (!updatedLeave) {
      return NextResponse.json(
        { success: false, message: 'Leave request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: updatedLeave
    })
  } catch (error) {
    console.error('Update leave status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update leave status' },
      { status: 500 }
    )
  }
}
