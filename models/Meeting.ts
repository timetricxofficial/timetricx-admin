import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  projectId: mongoose.Types.ObjectId;
  projectName: string;

  hostEmail: string;
  participants: string[];

  meetingLink: string;

  startTime: Date;
  endTime: Date;

  status: "scheduled" | "completed" | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    projectName: {
      type: String,
      required: true,
    },

    hostEmail: {
      type: String,
      required: true,
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

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export const Meeting =
  mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
