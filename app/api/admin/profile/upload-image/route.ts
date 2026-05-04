import { NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { Admin } from '@/models/Admin'
import cloudinary from '@/lib/cloudinary'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    await connectDB()

    // Get admin user from cookie
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')?.value

    if (!adminUserCookie) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse admin user data
    let adminData
    try {
      adminData = JSON.parse(adminUserCookie)
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid admin data' },
        { status: 401 }
      )
    }

    const adminEmail = adminData.email

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin email not found' },
        { status: 401 }
      )
    }

    // Get current admin to check for old profile picture
    const currentAdmin = await Admin.findOne({ email: adminEmail }).select('profilePicture')
    const oldImageUrl = currentAdmin?.profilePicture

    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Max 5MB allowed.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPG, PNG, WebP allowed.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary using SDK
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: 'admin-profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    })

    const imageUrl = uploadResult.secure_url

    // Delete old image from Cloudinary if exists
    if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
        const urlParts = oldImageUrl.split('/')
        const filenameWithExt = urlParts[urlParts.length - 1]
        const filename = filenameWithExt.split('.')[0]
        const folder = urlParts[urlParts.length - 2]
        const publicId = `${folder}/${filename}`

        await cloudinary.uploader.destroy(publicId)
        console.log('Old profile picture deleted from Cloudinary:', publicId)
      } catch (deleteError) {
        // Log error but don't fail the request
        console.error('Failed to delete old profile picture:', deleteError)
      }
    }

    // Update admin profile picture
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: adminEmail },
      {
        profilePicture: imageUrl,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password')

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: imageUrl
      }
    })
  } catch (error) {
    console.error('Upload profile picture error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload profile picture' },
      { status: 500 }
    )
  }
}
