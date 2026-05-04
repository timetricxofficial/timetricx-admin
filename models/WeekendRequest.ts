import mongoose, { Schema, Document } from "mongoose";

export interface IWeekendRequest extends Document {
    userEmail: string;
    userName: string;
    date: string;            // "2026-03-01" (the weekend date)
    dayName: string;         // "Saturday" or "Sunday"
    entryTime: string;       // "10:05:30 AM"
    exitTime?: string;       // "06:30:00 PM"
    workedHours?: number;
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;     // admin email who approved
    approvedAt?: Date;
    reason?: string;         // optional reason from admin
    createdAt: Date;
    updatedAt: Date;
}

const WeekendRequestSchema = new Schema<IWeekendRequest>(
    {
        userEmail: {
            type: String,
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        dayName: {
            type: String,
            required: true,
            enum: ["Saturday", "Sunday"],
        },
        entryTime: {
            type: String,
            required: true,
        },
        exitTime: {
            type: String,
            default: null,
        },
        workedHours: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvedBy: {
            type: String,
            default: null,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        reason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate requests for same user on same date
WeekendRequestSchema.index({ userEmail: 1, date: 1 }, { unique: true });

export const WeekendRequest =
    mongoose.models.WeekendRequest ||
    mongoose.model<IWeekendRequest>("WeekendRequest", WeekendRequestSchema);
