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
    const { id, adminReply, message, isEdit, status } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Ticket ID is required' }, { status: 400 })
    }

    await connectDB()

    // Handle admin reply / message. Support legacy `adminReply` and new `message` field.
    const replyText = message ?? adminReply

    // If only status update is sent, handle that separately
    if (replyText === undefined && status !== undefined) {
      const updateData: any = { status }
      if (status === 'resolved' || status === 'closed') updateData.resolvedAt = new Date()
      const updated = await HelpTicket.findByIdAndUpdate(id, updateData, { new: true })
      if (!updated) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
      return NextResponse.json({ success: true, message: 'Ticket updated successfully', data: updated })
    }

    // If replyText provided
    if (replyText !== undefined) {
      if (isEdit) {
        // For edit: load ticket, update last admin message, save
        const ticket = await HelpTicket.findById(id)
        if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })

        const msgs = ticket.messages || []
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].sender === 'admin') {
            msgs[i].text = replyText
            msgs[i].createdAt = new Date()
            break
          }
        }
        ticket.messages = msgs
        ticket.lastMessage = replyText
        ticket.lastMessageAt = new Date()
        ticket.readBy = [] // reset readBy so user gets notified of edit
        console.log('readBy reset to empty on admin edit:', ticket.readBy)
        const updated = await ticket.save()
        return NextResponse.json({ success: true, message: 'Ticket updated successfully', data: updated })
      } else {
        // For new reply: use atomic $push and $set
        const pushObj = { sender: 'admin', text: replyText, createdAt: new Date() }
        const updateObj: any = {
          $push: { messages: pushObj },
          $set: {
            lastMessage: replyText,
            lastMessageAt: new Date(),
            readBy: []
          }
        }
        const updated = await HelpTicket.findByIdAndUpdate(id, updateObj, { new: true })
        if (!updated) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 })
        return NextResponse.json({ success: true, message: 'Ticket updated successfully', data: updated })
      }
    }

    // No changes provided
    return NextResponse.json({ success: false, message: 'No update data provided' }, { status: 400 })

    return NextResponse.json({ success: true, message: 'Ticket updated successfully',  })
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
