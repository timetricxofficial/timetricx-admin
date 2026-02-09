import { NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function GET() {
  try {
    await connectDB()

    const projects = await Project.find(
      {},
      {
        name: 1,
        status: 1,
        progress: 1
      }
    )
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: projects
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
