import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import InternDocument from '@/models/InternDocument'

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const { email, documentKey } = await req.json()

    if (!email || !documentKey) {
      return NextResponse.json(
        { success: false, message: 'Email and document key are required' },
        { status: 400 }
      )
    }

    // Find the document
    const doc = await InternDocument.findOne({ internEmail: email.toLowerCase() })
    
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document exists
    if (!doc[documentKey]) {
      return NextResponse.json(
        { success: false, message: 'Document type not found' },
        { status: 404 }
      )
    }

    // Unset the specific document field
    await InternDocument.updateOne(
      { internEmail: email.toLowerCase() },
      { $unset: { [documentKey]: 1 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
