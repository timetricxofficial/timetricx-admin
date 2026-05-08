import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  projectName?: string;
  projectId?: string;
  workingRole?: string;

  hostEmail: string;
  participants: string[];

  meetingLink: string;

  startTime: Date;
  endTime: Date;

  isPinned?: boolean;

  status: "scheduled" | "ongoing" | "completed" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema(
  {
    projectName: {
      type: String,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    workingRole: {
      type: String,
    },

    hostEmail: {
      type: String,
      required: true,
      index: true,
    },

    participants: [String],

    meetingLink: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
)
delete mongoose.models.Meeting;


export const Meeting =
  mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
