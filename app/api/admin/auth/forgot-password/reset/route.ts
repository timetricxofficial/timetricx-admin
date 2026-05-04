import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'
import { Otp } from '@/models/Otp'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, newPassword, token } = body

        if (!email || !newPassword || !token) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        await connectDB()

        // Verify that a verified OTP exists for this email
        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            purpose: 'reset-password',
            isUsed: true
        })

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: 'Security verification required' },
                { status: 400 }
            )
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase()
        })

        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Admin account not found' },
                { status: 404 }
            )
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        admin.password = hashedPassword
        await admin.save()

        // Cleanup used OTPs
        await Otp.deleteMany({
            email: email.toLowerCase(),
            purpose: 'reset-password'
        })

        return NextResponse.json({
            success: true,
            message: 'Admin password reset successfully'
        })

    } catch (error) {
        console.error('Admin password reset error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
