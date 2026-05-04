import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { HolidayWorkRequest } from '@/models/HolidayWorkRequest'

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { id, action, rejectionReason } = await req.json()

        if (!id || !['approved', 'rejected'].includes(action)) {
            return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
        }

        await connectDB()

        const request = await (HolidayWorkRequest as any).findById(id)
        if (!request) {
            return NextResponse.json({ success: false, message: 'Holiday request not found' }, { status: 404 })
        }

        // Action already taken previously?
        if (request.status === action) {
            return NextResponse.json({ success: true, message: `Already ${action}` })
        }

        request.status = action
        if (action === 'rejected' && rejectionReason) {
            request.reason = `${request.reason} (Admin Rejection Reason: ${rejectionReason})`
        }

        await request.save()

        return NextResponse.json({
            success: true,
            message: `Request successfully ${action}`
        })

    } catch (error) {
        console.error('Holiday Quick Action Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}
