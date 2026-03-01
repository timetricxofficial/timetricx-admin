import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/database"
import { Contact } from "@/models/Contact"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      fullName,
      email,
      phone,
      company,
      subject,
      message,
      category,
    } = body

    /* ---------------- VALIDATION ---------------- */

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      )
    }

    /* ---------------- DB CONNECT ---------------- */

    await connectDB()

    /* ---------------- CREATE CONTACT ---------------- */

    const newContact = await Contact.create({
      fullName,
      email,
      phone,
      company,
      subject,
      message,
      category: category || "support",
      status: "pending",     // matches your enum
      priority: "medium",    // matches your enum
    })

    return NextResponse.json({
      success: true,
      message: "Message submitted successfully",
      data: {
        id: newContact._id,
      },
    })

  } catch (error) {
    console.error("Contact API Error:", error)

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

/* BLOCK OTHER METHODS */
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  )
}
