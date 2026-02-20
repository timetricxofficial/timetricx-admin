import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/utils/generateToken'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    // Get all admins and find matching password
    const admins = await Admin.find().select('+password')

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No admins found' },
        { status: 404 }
      )
    }

    // Find admin with matching password
    let matchedAdmin = null
    for (const admin of admins) {
      const isMatch = await bcrypt.compare(password, admin.password)
      if (isMatch) {
        matchedAdmin = admin
        break
      }
    }

    if (!matchedAdmin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (matchedAdmin.isDisabled) {
      return NextResponse.json(
        { success: false, message: 'Admin account is disabled' },
        { status: 403 }
      )
    }

    const token = generateToken({
      userId: matchedAdmin._id,
      email: matchedAdmin.email,
      role: 'admin'
    })

    const adminObj = matchedAdmin.toObject()
    delete adminObj.password

    return NextResponse.json({
      success: true,
      user: adminObj,
      token
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
