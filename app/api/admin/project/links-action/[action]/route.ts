import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { ProjectLiveLink } from '@/models/ProjectsLiveLinks'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    await connectDB()

    const { action } = await params
    const body = await req.json()
    const { linkId } = body

    if (!linkId) {
      return NextResponse.json(
        { success: false, message: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Validate action
    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      )
    }

    // Handle delete action
    if (action === 'delete') {
      const deletedLink = await ProjectLiveLink.findByIdAndDelete(linkId)

      if (!deletedLink) {
        return NextResponse.json(
          { success: false, message: 'Project link not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Project link deleted successfully'
      })
    }

    // Handle approve/reject actions
    const status = action === 'approve' ? 'approved' : 'rejected'

    const updatedLink = await ProjectLiveLink.findByIdAndUpdate(
      linkId,
      {
        status,
        reviewedAt: new Date()
      },
      { new: true }
    )

    if (!updatedLink) {
      return NextResponse.json(
        { success: false, message: 'Project link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Project link ${status} successfully`,
      data: updatedLink
    })

  } catch (err) {
    console.error('Project link action error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
