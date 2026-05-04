import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { Admin } from '../../../../models/Admin'
import { hashPassword } from '../../../../utils/hashPassword'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { name, email, password, designation, mobileNumber, edit, status } = body

    // Validation
    if (!name || !email || !password || !designation || !mobileNumber) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, designation and mobile number are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create admin
    const newAdmin = new Admin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      designation: designation?.trim() || '',
      mobileNumber: mobileNumber?.trim() || '',
      edit: edit || false,
      status: status || 'admin'
    })

    await newAdmin.save()

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully'
    })

  } catch (err) {
    console.error('Error creating admin:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to create admin' },
      { status: 500 }
    )
  }
}
