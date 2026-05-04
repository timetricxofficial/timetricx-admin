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

// PUT - Update announcement (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { title, description, link, linkText, type, startAt, endAt, targetAudienceType, targetAudienceData, isActive } = body

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

    await connectDB()

    // Check if announcement exists
    const existing = await Announcement.findById(id)
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Announcement not found' }, { status: 404 })
    }

    // Validate dates if provided
    let startDate = existing.startAt
    let endDate = existing.endAt

    if (startAt) {
      startDate = new Date(startAt)
      if (isNaN(startDate.getTime())) {
        return NextResponse.json({ success: false, message: 'Invalid start date' }, { status: 400 })
      }
    }

    if (endAt) {
      endDate = new Date(endAt)
      if (isNaN(endDate.getTime())) {
        return NextResponse.json({ success: false, message: 'Invalid end date' }, { status: 400 })
      }
    }

    if (endDate <= startDate) {
      return NextResponse.json({
        success: false,
        message: 'End date must be after start date'
      }, { status: 400 })
    }

    // Update announcement
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (link !== undefined) updateData.link = link || null
    if (linkText !== undefined) updateData.linkText = linkText
    if (type !== undefined) updateData.type = type
    if (startAt !== undefined) updateData.startAt = startDate
    if (endAt !== undefined) updateData.endAt = endDate
    if (targetAudienceType !== undefined) updateData.targetAudienceType = targetAudienceType
    if (targetAudienceData !== undefined) updateData.targetAudienceData = targetAudienceData
    if (isActive !== undefined) updateData.isActive = isActive

    const updated = await Announcement.findByIdAndUpdate(id, updateData, { new: true })

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json({ success: false, message: 'Failed to update announcement' }, { status: 500 })
  }
}

// DELETE - Soft delete announcement (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return NextResponse.json({ success: false, message: 'Announcement not found' }, { status: 404 })
    }

    // Permanent delete from database
    await Announcement.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete announcement' }, { status: 500 })
  }
}
