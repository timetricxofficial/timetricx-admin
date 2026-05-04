import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;

  fromDate: Date;
  toDate: Date;
  totalDays: number;

  reason: string;

  status: "pending" | "approved" | "rejected";

  approvedBy?: mongoose.Types.ObjectId;
  approvedByEmail?: string;
  approvedAt?: Date;

  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true, index: true },
    userName: String,

    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    totalDays: { type: Number, required: true },

    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedByEmail: String,
    approvedAt: Date,

    rejectionReason: String,
  },
  { timestamps: true }
);

export const Leave =
  mongoose.models.Leave ||
  mongoose.model<ILeave>("Leave", LeaveSchema);
