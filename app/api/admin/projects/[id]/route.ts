import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const body = await req.json()

    const {
      name,
      description,
      status,
      priority,
      deadline,
      teamEmails,
      tasks,
      descriptionDriveLink
    } = body

    // Validate required fields; total tasks is now optional
    if (!name || !teamEmails?.length) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare tasks object, include total only if provided
    const tasksUpdate: any = {
      completed: tasks?.completed || 0
    }
    if (tasks?.total !== undefined && tasks?.total !== null && tasks?.total !== '') {
      tasksUpdate.total = Number(tasks.total)
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        status,
        priority,
        deadline,
        teamEmails,
        descriptionDriveLink,
        tasks: tasksUpdate
      },
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedProject
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const deletedProject = await Project.findByIdAndDelete(id)

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
