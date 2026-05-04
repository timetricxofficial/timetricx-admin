// models/Contact.ts

import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  fullName: string
  email: string
  phone?: string
  company?: string

  subject: string
  message: string
  category: 'support' | 'sales' | 'feedback' | 'bug' | 'other'

  status: 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'

  adminReply?: string
  repliedAt?: Date

  createdAt: Date
  updatedAt: Date
}

const ContactSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    company: {
      type: String,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ['support', 'sales', 'feedback', 'bug', 'other'],
      default: 'support',
    },

    status: {
      type: String,
      enum: ['pending', 'resolved', 'closed'],
      default: 'pending',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    adminReply: {
      type: String,
    },

    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

export const Contact =
  mongoose.models.Contact ||
  mongoose.model<IContact>('Contact', ContactSchema)
