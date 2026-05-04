import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Leave } from '@/models/TakeLeave'
import { User } from '@/models/User'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
        }

        await connectDB()

        const leave = await Leave.findById(id).lean()
        if (!leave) {
            return NextResponse.json({ success: false, message: 'Leave request not found' }, { status: 404 })
        }

        // Fetch user details for profile picture
        const user = await User.findOne({ email: leave.userEmail }).lean()

        return NextResponse.json({
            success: true,
            data: {
                ...leave,
                profilePicture: user?.profilePicture || null,
                designation: user?.workingRole || 'Employee'
            }
        })

    } catch (error) {
        console.error('Fetch Leave Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}
