import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { CompanyHoliday } from '@/models/CompanyHoliday'
import { User } from '@/models/User'
import cloudinary from '@/lib/cloudinary'
import { sendHolidayNotificationMail } from '@/utils/sendHolidayNotificationMail'

async function sendHolidayEmails(target: 'all' | 'individual' | 'none', userIds: string[], title: string, date: string) {
    if (target === 'none') return;

    try {
        let emails: string[] = [];
        if (target === 'all') {
            const users = await User.find({ isEmailVerified: true, role: 'user', isActive: true }).select('email');
            emails = users.map(u => u.email);
        } else if (target === 'individual' && userIds.length > 0) {
            const users = await User.find({ _id: { $in: userIds } }).select('email');
            emails = users.map(u => u.email);
        }

        if (emails.length > 0) {
            await sendHolidayNotificationMail(emails, title, date);
        }
    } catch (err) {
        console.error('Failed to send holiday emails:', err);
    }
}

export async function GET() {
    try {
        await connectDB()

        // 🧹 AUTOMATIC CLEANUP: Delete animations from past months
        const today = new Date()
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const expiredHolidays = await CompanyHoliday.find({
            date: { $lt: startOfCurrentMonth },
            animationPublicId: { $exists: true, $ne: null }
        })

        if (expiredHolidays.length > 0) {
            console.log(`🧹 Cleaning up ${expiredHolidays.length} expired holiday animations...`)
            for (const h of expiredHolidays) {
                try {
                    if (h.animationPublicId) {
                        await cloudinary.uploader.destroy(h.animationPublicId, {
                            resource_type: h.animationResourceType || 'image'
                        });
                    }
                    h.animationUrl = undefined;
                    h.animationPublicId = undefined;
                    h.animationResourceType = undefined;
                    await h.save();
                } catch (delErr) {
                    console.error('Error deleting animation from Cloudinary:', delErr)
                }
            }
        }

        const holidays = await CompanyHoliday.find().sort({ date: 1 })
        return NextResponse.json({ success: true, data: holidays })
    } catch (error) {
        console.error('Fetch Company Holidays Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { title, date, animationUrl, animationPublicId, animationResourceType, notifyTarget, selectedUserIds } = await req.json()

        if (!title || !date) {
            return NextResponse.json({ success: false, message: 'Title and Date are required' }, { status: 400 })
        }

        await connectDB()

        const existing = await CompanyHoliday.findOne({ date: new Date(date) })
        if (existing) {
            return NextResponse.json({ success: false, message: 'A holiday for this date already exists!' }, { status: 400 })
        }

        const newHoliday = await CompanyHoliday.create({
            title,
            date: new Date(date),
            animationUrl,
            animationPublicId,
            animationResourceType: animationResourceType || 'image'
        })

        // 📧 Background notification
        if (notifyTarget && notifyTarget !== 'none') {
            await sendHolidayEmails(notifyTarget, selectedUserIds || [], title, date);
        }

        return NextResponse.json({ success: true, data: newHoliday })
    } catch (error) {
        console.error('Create Company Holiday Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
        }

        await connectDB()
        const holiday = await CompanyHoliday.findById(id)
        if (holiday?.animationPublicId) {
            await cloudinary.uploader.destroy(holiday.animationPublicId, {
                resource_type: holiday.animationResourceType || 'image'
            })
        }
        await CompanyHoliday.findByIdAndDelete(id)

        return NextResponse.json({ success: true, message: 'Holiday removed' })
    } catch (error) {
        console.error('Delete Company Holiday Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, title, animationUrl, animationPublicId, animationResourceType, notifyTarget, selectedUserIds } = await req.json()

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
        }

        await connectDB()
        const holiday = await CompanyHoliday.findById(id)
        if (!holiday) {
            return NextResponse.json({ success: false, message: 'Holiday not found' }, { status: 404 })
        }

        // If new animation is uploaded, delete old one from Cloudinary
        if (animationPublicId && holiday.animationPublicId && animationPublicId !== holiday.animationPublicId) {
            try {
                await cloudinary.uploader.destroy(holiday.animationPublicId, {
                    resource_type: holiday.animationResourceType || 'image'
                })
            } catch (delErr) {
                console.error('Delete old animation error:', delErr)
            }
        }

        holiday.title = title || holiday.title
        if (animationUrl !== undefined) {
            holiday.animationUrl = animationUrl
            holiday.animationPublicId = animationPublicId
            holiday.animationResourceType = animationResourceType
        }

        await holiday.save()

        // 📧 Background notification
        if (notifyTarget && notifyTarget !== 'none') {
            await sendHolidayEmails(notifyTarget, selectedUserIds || [], holiday.title, holiday.date.toISOString());
        }

        return NextResponse.json({ success: true, data: holiday })
    } catch (error) {
        console.error('Update Company Holiday Error:', error)
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
    }
}
