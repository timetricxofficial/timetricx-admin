import mongoose from 'mongoose';

const HolidayWorkRequestSchema = new mongoose.Schema(
    {
        userEmail: {
            type: String,
            required: true,
            index: true,
        },
        holidayId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CompanyHoliday',
            required: true,
        },
        holidayDate: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reason: {
            type: String,
            required: true,
            default: 'No reason provided'
        },
        requestCount: {
            type: Number,
            default: 1,
        },
        approvedBy: {
            type: String,
            default: null,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const HolidayWorkRequest =
    mongoose.models.HolidayWorkRequest ||
    mongoose.model('HolidayWorkRequest', HolidayWorkRequestSchema);
