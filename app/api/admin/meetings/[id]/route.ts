import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import { Meeting } from "@/models/Meeting"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await req.json()
    
    const { 
      hostEmail, 
      projectId, 
      projectName, 
      workingRole,
      date, 
      startTime, 
      endTime, 
      meetingLink, 
      status 
    } = body

    if (!hostEmail || !date || !startTime || !endTime || !meetingLink) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!projectId && !workingRole) {
      return NextResponse.json(
        { success: false, message: "Select project or working role" },
        { status: 400 }
      )
    }

    // Combine date and time
    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    const updateData: any = {
      hostEmail,
      startTime: startDateTime,
      endTime: endDateTime,
      meetingLink,
      status: status || 'scheduled'
    }

    if (projectId) {
      updateData.projectId = projectId
      updateData.projectName = projectName || ''
      updateData.workingRole = null
    } else if (workingRole) {
      updateData.workingRole = workingRole
      updateData.projectId = null
      updateData.projectName = null
    }

    const updated = await Meeting.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Meeting updated successfully",
      data: updated
    })
    
  } catch (err) {
    console.error("Update meeting error:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
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
    
    const deleted = await Meeting.findByIdAndDelete(id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Meeting deleted successfully"
    })
    
  } catch (err) {
    console.error("Delete meeting error:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
