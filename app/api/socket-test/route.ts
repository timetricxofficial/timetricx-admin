import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if socket server is running on the expected port
    const socketServerUrl = process.env.NEXT_PUBLIC_USER_SIDE_URL || 'http://localhost:3002'
    const response = await fetch(`${socketServerUrl}/api/socket`, {
      method: 'GET',
    }).catch(() => null)
    
    if (response) {
      return NextResponse.json({ 
        success: true, 
        message: `Socket server reachable at ${socketServerUrl}`,
        status: response.status 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Socket server NOT reachable at ${socketServerUrl}. Is user side running?` 
      }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
