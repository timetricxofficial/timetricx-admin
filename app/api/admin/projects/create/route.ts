import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

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

    if (!name || !teamEmails?.length || !tasks?.total) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const total = Number(tasks.total)

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      deadline,
      teamEmails,
      descriptionDriveLink,

      tasks: {
        total,
        completed: 0     // ✅ correct
      },

      progress: 0
    })

    return NextResponse.json({
      success: true,
      data: project
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    )
  }
}
