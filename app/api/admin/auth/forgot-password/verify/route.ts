import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Otp } from '@/models/Otp'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, otp, token } = body

        if (!email || !otp || !token) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            )
        }

        await connectDB()

        const otpRecord = await Otp.findOne({
            email: email.toLowerCase(),
            otp,
            purpose: 'reset-password',
            isUsed: false
        })

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, message: 'Invalid or incorrect OTP' },
                { status: 400 }
            )
        }

        if (otpRecord.expiresAt < new Date()) {
            return NextResponse.json(
                { success: false, message: 'OTP has expired' },
                { status: 400 }
            )
        }

        // Mark OTP as used after successful verification
        otpRecord.isUsed = true
        await otpRecord.save()

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully'
        })

    } catch (error) {
        console.error('Admin verify OTP error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
