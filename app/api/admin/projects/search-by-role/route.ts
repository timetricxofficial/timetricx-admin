import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function GET(req: NextRequest) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  let query: any = { isActive: true }

  if (role) {
    query.workingRole = { $regex: role, $options: 'i' }
  }

  const users = await User.find(query)
    .select('name email designation workingRole')

  return NextResponse.json({
    success: true,
    data: users
  })
}
