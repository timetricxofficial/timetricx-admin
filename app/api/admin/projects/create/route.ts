import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'
import { User } from '../../../../../models/User'

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
      assignedUserEmail,
      tasks,
      descriptionDriveLink
    } = body

    let finalTeamEmails = [...(teamEmails || [])]

    // If assignedUserEmail is provided, find the user and add their primary email
    if (assignedUserEmail) {
      const matchedUser = await User.findOne({
        $or: [
          { email: assignedUserEmail },
          { 'authProviders.google.email': assignedUserEmail }
        ]
      })

      if (!matchedUser) {
        return NextResponse.json(
          { success: false, message: 'No user found with the provided email' },
          { status: 404 }
        )
      }

      // Add the user's primary email to the team if not already present
      if (!finalTeamEmails.includes(matchedUser.email)) {
        finalTeamEmails.push(matchedUser.email)
      }
    }

    if (!name || !finalTeamEmails.length) {
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
      for (const email of finalTeamEmails) {
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
      teamEmails: finalTeamEmails,
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
