import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Announcement } from '@/models/Announcement'
import { User } from '@/models/User'
import { sendAnnouncementEmail } from '@/utils/sendEmailAnnouncement'

export const dynamic = 'force-dynamic'

async function getCurrentAdmin(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...rest] = c.trim().split('=')
        return [key, rest.join('=')]
      })
    )
    const adminUserCookie = cookies.adminUser
    if (!adminUserCookie) return null
    return JSON.parse(decodeURIComponent(adminUserCookie))
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    let { title, description, link, linkText, type, startAt, endAt, targetAudienceType, targetAudienceData } = body

    if (!title || !description || !startAt || !endAt) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    if (link && !/^https?:\/\//i.test(link)) {
      link = `https://${link}`
    }

    const startDate = new Date(startAt)
    const endDate = new Date(endAt)
    if (endDate <= startDate) {
      return NextResponse.json({ success: false, message: 'End date must be after start date' }, { status: 400 })
    }

    await connectDB()

    // 1. DYNAMIC MONGODB FILTER ENGINE
    let userFilter: any = { isActive: true }

    if (targetAudienceType === 'workingRole') {
      userFilter.workingRole = { $in: targetAudienceData }
    } else if (targetAudienceType === 'selected') {
      userFilter.email = { $in: targetAudienceData }
    }

    // 2. FETCH USERS & COMPILE UNIQUE DUAL-EMAILS
    const targetUsers = await User.find(userFilter).lean()
    const distinctEmails = new Set<string>()

    targetUsers.forEach((user: any) => {
      if (user.email) {
        distinctEmails.add(user.email.toLowerCase().trim())
      }
      if (user.authProviders?.google?.email) {
        distinctEmails.add(user.authProviders.google.email.toLowerCase().trim())
      }
    })

    const finalBccList = Array.from(distinctEmails)
    console.log("👉 Target Emails Array:", finalBccList);

    // 3. CREATE ANNOUNCEMENT ENTRY IN MONGO
    const announcement = await Announcement.create({
      title,
      description,
      link: link || null,
      linkText: linkText || 'View',
      type: type || 'info',
      startAt: startDate,
      endAt: endDate,
      targetAudienceType: targetAudienceType || 'all',
      targetAudienceData: targetAudienceData || [],
      isActive: true,
      createdBy: admin.id || admin._id
    })

    // 4. TRIGGER GLOBAL EMAIL UTILITY IN BACKGROUND
    if (finalBccList.length > 0) {
const emailHtmlBody = `

<div style="background:#f3f6fb;padding:30px 15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,.05);">


<!-- Header -->
<div style="background:linear-gradient(135deg,#0f4bd7,#153ea8);padding:24px 30px;">
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td width="60">
        <img
          src="https://timetricx.cybershoora.com/Timetricx%20logo.svg"
          alt="Timetricx"
          style="width:48px;height:48px;background:#fff;border-radius:12px;padding:4px;display:block;"
        />
      </td>
      <td style="padding-left:15px;">
        <div style="font-size:34px;font-weight:800;color:#fff;line-height:1;">
          TIMETRICX
        </div>
        <div style="font-size:16px;color:#dbeafe;margin-top:6px;">
          Workspace Notification Center
        </div>
      </td>
    </tr>
  </table>
</div>

<!-- Body -->
<div style="padding:35px 30px;">

  <!-- Type Badge -->
  <div style="text-align:center;margin-bottom:25px;">
    <span style="
      display:inline-block;
      padding:10px 20px;
      border-radius:999px;
      font-size:14px;
      font-weight:700;
      text-transform:uppercase;

      ${type === 'urgent'
        ? 'background:#fee2e2;color:#b91c1c;'
        : type === 'warning'
        ? 'background:#fef3c7;color:#92400e;'
        : type === 'success'
        ? 'background:#dcfce7;color:#166534;'
        : 'background:#dbeafe;color:#1d4ed8;'}
    ">
      📢 ${type || 'Info'} Notice
    </span>
  </div>

  <!-- Title -->
  <h1 style="
    margin:0 0 25px;
    text-align:center;
    font-size:38px;
    color:#0f172a;
    font-weight:800;
  ">
    📣 ${title}
  </h1>

  <!-- Details Card -->
  <div style="
    border:1px solid #f3d6d6;
    border-radius:16px;
    overflow:hidden;
    margin-bottom:30px;
  ">
    <div style="
      background:#fdf2f2;
      padding:16px 20px;
      font-size:20px;
      font-weight:700;
      color:#111827;
    ">
      📄 Announcement Details
    </div>

    <div style="
      padding:24px 20px;
      font-size:15px;
      line-height:1.8;
      color:#4b5563;
      white-space:pre-line;
    ">
      ${description}
    </div>
  </div>

  ${
    link
      ? `
  <div style="text-align:center;margin-bottom:30px;">
    <a
      href="${link}"
      target="_blank"
      style="
        display:inline-block;
        background:#2563eb;
        color:#fff;
        text-decoration:none;
        padding:16px 34px;
        border-radius:12px;
        font-size:16px;
        font-weight:700;
      "
    >
      Join Meet Link →
    </a>
  </div>
  `
      : ''
  }

  <!-- Info Box -->
  <div style="
    background:#f8fbff;
    border-left:4px solid #2563eb;
    padding:16px 18px;
    border-radius:10px;
    color:#475569;
    font-size:14px;
  ">
    ℹ️ Please review the above information and take necessary action.
  </div>

</div>

<!-- Footer -->
<div style="padding:25px 30px;border-top:1px solid #e5e7eb;text-align:center;">
  <div style="font-size:13px;color:#6b7280;line-height:1.8;">
    This notification was distributed via Timetricx Workspace Engine.
    <br/>
    This is an automated message. Please do not reply directly to this email.
  </div>

  <div style="margin-top:12px;font-size:13px;color:#9ca3af;">
    © ${new Date().getFullYear()} Timetricx Workspace Engine. All rights reserved.
  </div>
</div>

  </div>
</div>
`

      // Fire-and-forget background execution
      // sendEmail option ke andar as a backup parameter hum 'bcc' direct inject kar rahe hain jo nodemailer automatically parse kar lega
      // Use the dedicated announcement email utility
      sendAnnouncementEmail({
        bccList: finalBccList,
        subject: `[Notification] ${title}`,
        text: description,
        html: emailHtmlBody,
      })
      .then(() => console.log(`[Notification Engine] Dispatched to ${finalBccList.length} addresses.`))
      .catch((err) => console.error('[Notification Engine] Dispatch Failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement generated successfully',
      data: announcement
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ success: false, message: 'Failed to create announcement' }, { status: 500 })
  }
}

// ------------------------------------------------------------
// GET handler – returns paginated list of active announcements
// ------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    // Ensure DB connection
    await connectDB()

    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Fetch announcements and total count in parallel
    const [announcements, total] = await Promise.all([
      Announcement.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ isActive: true })
    ])

    const hasMore = skip + announcements.length < total

    return NextResponse.json(
      {
        success: true,
        data: announcements,
        pagination: { page, limit, total, hasMore }
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error fetching announcements:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}