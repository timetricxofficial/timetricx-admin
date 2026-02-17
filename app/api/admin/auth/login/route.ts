import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/utils/generateToken'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Admin access only' },
        { status: 403 }
      )
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    })

    const userObj = user.toObject()
    delete userObj.password

    return NextResponse.json({
      success: true,
      user: userObj,
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
