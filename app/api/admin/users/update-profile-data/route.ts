import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      email,
      name,
      mobileNumber,
      role,
      bio,
      website,
      location,
      gender,

      linkedin,
      twitter,
      instagram,
      facebook,

      githubId,
      githubUsername,
      githubEmail
    } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    /* ---------- BASIC ---------- */
    if (name) user.name = name
    if (mobileNumber) user.mobileNumber = mobileNumber
    if (role) user.role = role
    /* ---------- PROFILE ---------- */
    if (!user.profile) user.profile = {}

    if (bio) user.profile.bio = bio
    if (website) user.profile.website = website
    if (location) user.profile.location = location
    if (gender) user.profile.gender = gender

    /* ---------- SOCIAL ---------- */
    if (!user.socialLinks) user.socialLinks = {}

    if (linkedin) user.socialLinks.linkedin = linkedin
    if (twitter) user.socialLinks.twitter = twitter
    if (instagram) user.socialLinks.instagram = instagram
    if (facebook) user.socialLinks.facebook = facebook

    /* ---------- GITHUB ---------- */
    if (!user.authProviders) user.authProviders = {}
    if (!user.authProviders.github)
      user.authProviders.github = {
        id: '',
        username: '',
        email: ''
      }

    if (githubId) user.authProviders.github.id = githubId
    if (githubUsername)
      user.authProviders.github.username = githubUsername
    if (githubEmail)
      user.authProviders.github.email = githubEmail

    await user.save()

    const resUser = user.toObject()
    delete resUser.password

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: resUser
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
