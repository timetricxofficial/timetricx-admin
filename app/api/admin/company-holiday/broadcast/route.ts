import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'
import { CompanyHoliday } from '../../../../../models/CompanyHoliday'
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
    try {
        const { target, userIds } = await req.json()

        await connectDB()

        // 1. Fetch all upcoming holidays
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcomingHolidays = await CompanyHoliday.find({ date: { $gte: today } }).sort({ date: 1 })

        if (upcomingHolidays.length === 0) {
            return NextResponse.json({ success: false, message: 'No upcoming holidays found to broadcast.' }, { status: 400 })
        }

        // 2. Fetch target emails
        let emails: string[] = []
        if (target === 'all') {
            const users = await User.find({ isEmailVerified: true, role: 'user', isActive: true }).select('email')
            emails = users.map(u => u.email)
        } else if (target === 'individual' && userIds?.length > 0) {
            const users = await User.find({ _id: { $in: userIds } }).select('email')
            emails = users.map(u => u.email)
        }

        if (emails.length === 0) {
            return NextResponse.json({ success: false, message: 'No recipients selected.' }, { status: 400 })
        }

        // 3. Send Multi-Holiday Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: { rejectUnauthorized: false }
        });

        await transporter.verify();

        const holidayRows = upcomingHolidays.map(h => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #1e293b; color: #f43f5e; font-weight: bold;">
                ${new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1;">
                ${h.title}
            </td>
        </tr>
    `).join('')

        await transporter.sendMail({
            from: `"Timetricx Holiday Desk" <${process.env.SMTP_FROM}>`,
            to: process.env.SMTP_FROM,
            bcc: emails,
            subject: `Upcoming Company Holidays List | Timetricx`,
            html: `
        <div style="background:#0f172a; padding:40px; font-family:Arial, sans-serif;">
            <div style="max-width:520px; margin:auto; background:#020617; border-radius:32px; padding:40px; color:white; border: 1px solid #1e293b;">
                <h1 style="margin:0 0 10px; color:white; font-size:24px; text-align:center;">📅 Holiday Calendar</h1>
                <p style="color:#94a3b8; font-size:14px; margin-bottom:30px; text-align:center;">
                    Here is the list of upcoming company holidays for your reference.
                </p>

                <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border-radius: 16px; overflow: hidden;">
                    <thead>
                        <tr style="background: rgba(244, 63, 94, 0.1);">
                            <th style="padding: 12px; text-align: left; color: #f43f5e; font-size: 12px; text-transform: uppercase;">Date</th>
                            <th style="padding: 12px; text-align: left; color: #f43f5e; font-size: 12px; text-transform: uppercase;">Holiday</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${holidayRows}
                    </tbody>
                </table>

                <p style="color:#475569; font-size:12px; text-align:center; margin-top:30px;">
                    © ${new Date().getFullYear()} Timetricx Admin
                </p>
            </div>
        </div>
        `
        })

        return NextResponse.json({ success: true, message: 'Broadcast sent successfully!' })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: 'Failed to broadcast holidays' }, { status: 500 })
    }
}
