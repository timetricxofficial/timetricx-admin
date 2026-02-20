import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { email, name, designation, mobileNumber, status, edit } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (designation) updateData.designation = designation.trim()
    if (mobileNumber) updateData.mobileNumber = mobileNumber.trim()
    if (status) updateData.status = status
    if (typeof edit === 'boolean') updateData.edit = edit

    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updateData },
      { new: true }
    )

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully'
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to update admin' },
      { status: 500 }
    )
  }
}
