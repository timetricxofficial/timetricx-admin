import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import { Meeting } from "@/models/Meeting"

export async function GET() {
  try {
    await connectDB()

    const meetings = await Meeting.find()
      .sort({ startTime: -1 }) // latest first

    return NextResponse.json({
      success: true,
      data: meetings
    })

  } catch (error) {
    console.error("Meeting list error:", error)

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
