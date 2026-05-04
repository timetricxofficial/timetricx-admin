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

    if (!name || !teamEmails?.length) {
      return NextResponse.json(
        { success: false, message: 'Project name and team members are required' },
        { status: 400 }
      )
    }

    // Tasks are optional - default to 0 if not provided
    const total = tasks?.total ? Number(tasks.total) : 0

    /* ---------- CHECK DUPLICATE PROJECT ASSIGNMENTS ---------- */
    // Check if any team member already has this project assigned
    const existingProjects = await Project.find({ name })
    const alreadyAssignedEmails: string[] = []

    for (const existingProject of existingProjects) {
      for (const email of teamEmails) {
        if (existingProject.teamEmails.includes(email)) {
          alreadyAssignedEmails.push(email)
        }
      }
    }

    if (alreadyAssignedEmails.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Project already assigned to: ${[...new Set(alreadyAssignedEmails)].join(', ')}` 
        },
        { status: 400 }
      )
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      deadline,
      teamEmails,
      descriptionDriveLink,

      tasks: {
        total: total || 0,
        completed: 0
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
