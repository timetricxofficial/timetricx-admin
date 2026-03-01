import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'
import { sendLeaveStatusMail } from '@/utils/sendLeaveUserEmail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, action, rejectionReason } = body

    if (!id || !action) {
      return NextResponse.json({ success: false, message: 'Missing ID or action.' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Action must be approved or rejected.' }, { status: 400 })
    }

    await connectDB()

    // Find and update the leave request status directly
    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: action, rejectionReason: rejectionReason || '' },
      { new: true }
    )

    if (!leave) {
      return NextResponse.json({ success: false, message: 'Leave request not found.' }, { status: 404 })
    }

    // 📩 Trigger email directly to the user saying their leave is approved/rejected
    sendLeaveStatusMail(
      leave.userEmail,
      leave.userName,
      action as 'approved' | 'rejected',
      leave.fromDate,
      leave.toDate,
      leave.totalDays,
      leave.reason,
      rejectionReason
    )

    return NextResponse.json({
      success: true,
      data: leave
    })

  } catch (error) {
    console.error('Email Quick Action POST Error:', error)
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
  }
}
