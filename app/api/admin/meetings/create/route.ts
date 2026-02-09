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
      projectId,
      date,
      startTime,
      endTime,
      meetingLink
    } = body

    /* ---------- VALIDATION ---------- */
    if (
      !hostEmail ||
      !projectId ||
      !date ||
      !startTime ||
      !endTime ||
      !meetingLink
    ) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      )
    }

    /* ---------- FIND PROJECT ---------- */
    const project = await Project.findById(projectId)
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
    const participantGoogleEmails = users
      .map((u) => u.authProviders?.google?.email)
      .filter(Boolean) // remove undefined/null

    if (participantGoogleEmails.length === 0) {
      return NextResponse.json(
        { success: false, message: "No Google accounts linked" },
        { status: 400 }
      )
    }

    /* ---------- CREATE DATETIME ---------- */
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)

    /* ---------- SAVE MEETING ---------- */
    const meeting = await Meeting.create({
      projectId: project._id,
      projectName: project.name,
      hostEmail: hostEmail.toLowerCase(),

      // 👇 IMPORTANT
      participants: participantGoogleEmails,

      meetingLink,
      startTime: startDateTime,
      endTime: endDateTime,
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
