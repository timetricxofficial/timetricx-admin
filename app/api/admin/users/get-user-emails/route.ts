import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const users = await User.find({
            isEmailVerified: true,
            role: 'user',
            isActive: true
        }).select('name email _id')

        return NextResponse.json({
            success: true,
            data: users
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch user emails'
            },
            { status: 500 }
        )
    }
}
