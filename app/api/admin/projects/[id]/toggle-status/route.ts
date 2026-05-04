import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../../lib/database'
import { Project } from '../../../../../../models/Project'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    // Toggle isDisabled status
    project.isDisabled = !project.isDisabled
    await project.save()

    return NextResponse.json({
      success: true,
      data: project,
      message: `Project ${project.isDisabled ? 'disabled' : 'enabled'} successfully`
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to toggle project status' },
      { status: 500 }
    )
  }
}
