import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import { Project } from "@/models/Project"
import { Meeting } from "@/models/Meeting"
import { User } from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    const {
      hostEmail,
      projectName,
      workingRole,
      startTime,
      endTime,
      meetingLink
    } = body

    /* ---------- VALIDATION ---------- */
    if (
      !hostEmail ||
      (!projectName && !workingRole) ||
      !startTime ||
      !endTime ||
      !meetingLink
    ) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      )
    }

    /* ---------- FIND PROJECT (if projectName provided) ---------- */
    let project = null
    let participantGoogleEmails: string[] = []

    if (projectName) {
      project = await Project.findOne({ name: projectName })
      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found" },
          { status: 404 }
        )
      }

      /* ---------- FIND USERS FROM TEAM EMAILS ---------- */
      const users = await User.find({
        email: { $in: project.teamEmails }
      })

      /* ---------- EXTRACT GOOGLE EMAILS ---------- */
      participantGoogleEmails = users
        .map((u) => u.authProviders?.google?.email)
        .filter(Boolean) // remove undefined/null
    }

    /* ---------- FIND USERS BY WORKING ROLE (if workingRole provided) ---------- */
    if (workingRole) {
      const usersByRole = await User.find({
        workingRole: workingRole
      })

      /* ---------- EXTRACT GOOGLE EMAILS FROM ROLE USERS ---------- */
      const roleEmails = usersByRole
        .map((u) => u.authProviders?.google?.email)
        .filter(Boolean)

      /* ---------- MERGE WITH PROJECT EMAILS (avoid duplicates) ---------- */
      participantGoogleEmails = [...new Set([...participantGoogleEmails, ...roleEmails])]
    }

    if (participantGoogleEmails.length === 0) {
      return NextResponse.json(
        { success: false, message: "No Google accounts linked" },
        { status: 400 }
      )
    }

    /* ---------- SAVE MEETING ---------- */
    const meeting = await Meeting.create({
      projectName: project?.name || workingRole,
      hostEmail: hostEmail.toLowerCase(),

      // 👇 IMPORTANT
      participants: participantGoogleEmails,

      meetingLink,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: "scheduled"
    })

    return NextResponse.json({
      success: true,
      data: meeting
    })

  } catch (err) {
    console.error("Meeting create error:", err)

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
