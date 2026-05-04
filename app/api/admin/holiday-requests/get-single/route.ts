import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { HolidayWorkRequest } from '@/models/HolidayWorkRequest'
import { CompanyHoliday } from '@/models/CompanyHoliday'
import { User } from '@/models/User'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
        }

        await connectDB()

        const request = await (HolidayWorkRequest as any).findById(id).lean()
        if (!request) {
            return NextResponse.json({ success: false, message: 'Holiday request not found' }, { status: 404 })
        }

        // Fetch user details
        const user = await User.findOne({ email: request.userEmail }).lean()

        // Fetch holiday details
        const holiday = await CompanyHoliday.findById(request.holidayId).lean()

        return NextResponse.json({
            success: true,
            data: {
                ...request,
                userName: user?.name,
                holidayTitle: holiday?.title,
                profilePicture: user?.profilePicture || null,
                designation: user?.workingRole || 'Employee'
            }
        })

    } catch (error) {
        console.error('Fetch Holiday Request Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}
