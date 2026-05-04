import mongoose, { Schema, Document } from 'mongoose'

/* =======================
   ANNOUNCEMENT INTERFACE
======================= */
export interface IAnnouncement extends Document {
  title: string
  description: string
  link?: string
  linkText: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  startAt: Date
  endAt: Date
  isActive: boolean
  targetAudienceType: 'all' | 'selected' | 'workingRole'
  targetAudienceData: string[]  // emails for 'selected', workingRoles for 'workingRole'
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

/* =======================
   ANNOUNCEMENT SCHEMA
======================= */
const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    link: {
      type: String,
      trim: true,
      default: null
    },

    linkText: {
      type: String,
      default: 'View',
      trim: true,
      maxlength: 50
    },

    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'urgent'],
      default: 'info'
    },

    startAt: {
      type: Date,
      required: true
    },

    endAt: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    targetAudienceType: {
      type: String,
      enum: ['all', 'selected', 'workingRole'],
      default: 'all'
    },

    targetAudienceData: {
      type: [String],
      default: []
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

/* =======================
   INDEXES FOR PERFORMANCE
======================= */
AnnouncementSchema.index({ isActive: 1, startAt: 1, endAt: 1 })
AnnouncementSchema.index({ targetAudienceType: 1, createdAt: -1 })

/* =======================
   EXPORT MODEL
======================= */
export const Announcement =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)
