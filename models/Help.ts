import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: "user" | "admin";

  text: string;

  createdAt: Date;
}

export interface IHelpTicket extends Document {
  ticketId: string;

  userId: mongoose.Types.ObjectId;

  userEmail: string;

  userName: string;

  subject: string;

  priority: "low" | "medium" | "high";

  category: "technical" | "attendance" | "account" | "other";

  status: "open" | "in_progress" | "resolved" | "closed";

  messages: IMessage[];

  lastMessage?: string;

  lastMessageAt?: Date;
  readBy: string[];

  resolvedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HelpTicketSchema = new Schema<IHelpTicket>(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      index: true,
    },

    userName: String,

    subject: {
      type: String,
      required: true,
    },

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

    messages: {
      type: [MessageSchema],
      default: [],
    },

    lastMessage: String,

    lastMessageAt: Date,
    readBy: {
      type: [String],
      default: [],
      index: true,
    },

    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);
if (mongoose.models.HelpTicket) {
  delete mongoose.models.HelpTicket;
}


export const HelpTicket =
  mongoose.models.HelpTicket ||
  mongoose.model<IHelpTicket>(
    "HelpTicket",
    HelpTicketSchema
  );