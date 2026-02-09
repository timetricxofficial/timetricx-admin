import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET(req: NextRequest) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const skill = searchParams.get('skill')

  if (!skill) {
    return NextResponse.json({ success: true, data: [] })
  }

  const users = await User.find({
    skills: { $regex: skill, $options: 'i' },
    isActive: true
  }).select('name email')

  return NextResponse.json({
    success: true,
    data: users
  })
}
