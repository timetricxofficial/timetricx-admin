import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'
import Chat from '../../../../../models/Chat'
import { FaceAttendance } from '../../../../../models/FaceAttendance'
import { HelpTicket } from '../../../../../models/Help'
import { HolidayWorkRequest } from '../../../../../models/HolidayWorkRequest'
import InternDocument from '../../../../../models/InternDocument'
import { Project } from '../../../../../models/Project'
import { ProjectLiveLink } from '../../../../../models/ProjectsLiveLinks'
import { Meeting } from '../../../../../models/Meeting'
import { Leave } from '../../../../../models/TakeLeave'
import { WeekendRequest } from '../../../../../models/WeekendRequest'

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    await connectDB()

    // 1. Delete the user first
    const user = await User.findOneAndDelete({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // 2. Anonymize chat messages (keep messages but change email to anonymous)
    await Chat.updateMany(
      { senderEmail: email },
      { $set: { senderEmail: 'anonymous@deleted.com' } }
    )

    // 3. Delete related records from all other collections
    await Promise.all([
      // Face Attendance records
      FaceAttendance.deleteMany({ userEmail: email }),

      // Help tickets
      HelpTicket.deleteMany({ userEmail: email }),

      // Holiday work requests
      HolidayWorkRequest.deleteMany({ userEmail: email }),

      // Intern documents
      InternDocument.deleteMany({ internEmail: email }),

      // Project live links
      ProjectLiveLink.deleteMany({ submittedByEmail: email }),

      // Leave requests
      Leave.deleteMany({ userEmail: email }),

      // Weekend work requests
      WeekendRequest.deleteMany({ userEmail: email }),

      // Meetings where user is host
      Meeting.deleteMany({ hostEmail: email }),

      // Remove user from meeting participants
      Meeting.updateMany(
        { participants: email },
        { $pull: { participants: email } }
      ),

      // Remove user from project team emails
      Project.updateMany(
        { teamEmails: email },
        { $pull: { teamEmails: email } }
      )
    ])

    return NextResponse.json({
      success: true,
      message: 'User deleted permanently with all related data cleaned'
    })

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

/* BLOCK METHODS */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}
