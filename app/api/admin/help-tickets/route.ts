import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { HelpTicket } from '@/models/Help'

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

// GET - List all help tickets (admin only)
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
    const status = searchParams.get('status') || 'all'
    const skip = (page - 1) * limit

    const filter: any = {}
    if (status !== 'all') {
      filter.status = status
    }

    const tickets = await HelpTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await HelpTicket.countDocuments(filter)

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + tickets.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching help tickets:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch help tickets' }, { status: 500 })
  }
}

// PUT - Reply to help ticket (admin only)
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, adminReply, status } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Ticket ID is required' }, { status: 400 })
    }

    await connectDB()

    const updateData: any = {}
    if (adminReply !== undefined) updateData.adminReply = adminReply
    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date()
      }
    }

    const updated = await HelpTicket.findByIdAndUpdate(id, updateData, { new: true })

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updated
    })
  } catch (error) {
    console.error('Error updating help ticket:', error)
    return NextResponse.json({ success: false, message: 'Failed to update ticket' }, { status: 500 })
  }
}

// DELETE - Delete help ticket (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Ticket ID is required' }, { status: 400 })
    }

    await connectDB()

    const ticket = await HelpTicket.findById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
    }

    // Permanent delete from database
    await HelpTicket.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting help ticket:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete ticket' }, { status: 500 })
  }
}
