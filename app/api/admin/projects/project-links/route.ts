import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { ProjectLiveLink } from '@/models/ProjectsLiveLinks'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get projectName from query params
    const { searchParams } = new URL(req.url)
    const projectName = searchParams.get('projectName')

    if (!projectName) {
      return NextResponse.json(
        { success: false, message: 'Project name is required' },
        { status: 400 }
      )
    }

    // Find all project live links with matching project name
    const projectLinks = await ProjectLiveLink.find({
      projectName: projectName
    }).lean()

    if (!projectLinks || projectLinks.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      )
    }

    // Fetch user details for each project link
    const enrichedData = await Promise.all(
      projectLinks.map(async (link) => {
        // Find user by submittedBy ID
        const user = await User.findById(link.submittedBy).lean()

        return {
          _id: link._id,
          projectName: link.projectName,
          liveUrl: link.liveUrl,
          status: link.status,
          reviewedAt: link.reviewedAt,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
          user: user
            ? {
                name: user.name || 'N/A',
                email: user.email || 'N/A',
                profilePicture: user.profilePicture || '',
                mobileNumber: user.mobileNumber || 'N/A',
                workingRole: user.workingRole || 'N/A'
              }
            : {
                name: 'Unknown User',
                email: link.submittedByEmail || 'N/A',
                profilePicture: '',
                mobileNumber: 'N/A',
                workingRole: 'N/A'
              }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedData
    })

  } catch (err) {
    console.error('Fetch project links error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
