import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'
import { Otp } from '@/models/Otp'
import { sendOtpMail } from '@/utils/sendEmail'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            )
        }

        await connectDB()

        const admin = await Admin.findOne({
            email: email.toLowerCase()
        })

        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Admin not found with this email' },
                { status: 404 }
            )
        }

        // Delete old reset OTPs for this email
        await Otp.deleteMany({
            email: admin.email,
            purpose: 'reset-password'
        })

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await Otp.create({
            userId: admin._id,
            email: admin.email,
            otp,
            purpose: 'reset-password',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
        })

        // Send OTP to admin email
        await sendOtpMail(admin.email, otp)

        // Generate a secure reset token for frontend tracking
        const resetToken = crypto.randomBytes(32).toString('hex')

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully to your admin email',
            token: resetToken
        })

    } catch (error) {
        console.error('Admin forgot password error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
