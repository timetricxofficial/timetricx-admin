import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Announcement } from '@/models/Announcement'

export const dynamic = 'force-dynamic'

// Helper to get current admin from cookies
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

    const adminData = JSON.parse(decodeURIComponent(adminUserCookie))
    return adminData
  } catch {
    return null
  }
}

// GET - List all announcements (admin only)
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Announcement.countDocuments({})

    return NextResponse.json({
      success: true,
      data: announcements,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + announcements.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST - Create new announcement (admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, link, linkText, type, startAt, endAt, targetAudienceType, targetAudienceData } = body

    // Validation
    if (!title || !description || !startAt || !endAt) {
      return NextResponse.json({
        success: false,
        message: 'Title, description, startAt, and endAt are required'
      }, { status: 400 })
    }

    // Validate link URL if provided
    if (link) {
      try {
        new URL(link)
      } catch {
        return NextResponse.json({
          success: false,
          message: 'Invalid URL format for link'
        }, { status: 400 })
      }
    }

    // Validate dates
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date format'
      }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({
        success: false,
        message: 'End date must be after start date'
      }, { status: 400 })
    }

    await connectDB()

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

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ success: false, message: 'Failed to create announcement' }, { status: 500 })
  }
}
