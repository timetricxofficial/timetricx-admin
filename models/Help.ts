import mongoose, { Schema, Document } from "mongoose";

export interface IHelpTicket extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;

  subject: string;
  message: string;

  priority: "low" | "medium" | "high";
  category: "technical" | "attendance" | "account" | "other";

  status: "open" | "in_progress" | "resolved" | "closed";

  adminReply?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const HelpTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String },

    subject: { type: String, required: true },
    message: { type: String, required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    category: {
      type: String,
      enum: ["technical", "attendance", "account", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    adminReply: String,
    resolvedAt: Date,
  },
  { timestamps: true }
);

export const HelpTicket =
  mongoose.models.HelpTicket ||
  mongoose.model<IHelpTicket>("HelpTicket", HelpTicketSchema);
