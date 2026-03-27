import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import InternDocument from '@/models/InternDocument'
import cloudinary from '@/lib/cloudinary'

// Extract public_id from Cloudinary URL
const extractPublicId = (url: string): string | null => {
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<public_id>.<ext>
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    
    // Find 'upload' index
    const uploadIndex = pathParts.indexOf('upload')
    if (uploadIndex === -1) return null
    
    // Get parts after 'upload' (skip version folder like v123456)
    const afterUpload = pathParts.slice(uploadIndex + 1)
    
    // Skip version folder if exists (starts with v followed by numbers)
    const publicIdParts = afterUpload[0]?.startsWith('v') 
      ? afterUpload.slice(1) 
      : afterUpload
    
    // Join remaining parts and remove extension
    const publicIdWithExt = publicIdParts.join('/')
    const lastDotIndex = publicIdWithExt.lastIndexOf('.')
    
    return lastDotIndex !== -1 
      ? publicIdWithExt.substring(0, lastDotIndex)
      : publicIdWithExt
  } catch {
    return null
  }
}

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
    const documentUrl = doc[documentKey]
    if (!documentUrl) {
      return NextResponse.json(
        { success: false, message: 'Document type not found' },
        { status: 404 }
      )
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(documentUrl)
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId)
        console.log('Cloudinary file deleted:', publicId)
      } catch (cloudError) {
        console.error('Cloudinary delete error:', cloudError)
        // Continue even if Cloudinary delete fails (file might be already deleted)
      }
    }

    // Unset the specific document field from MongoDB
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
