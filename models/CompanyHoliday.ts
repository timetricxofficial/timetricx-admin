import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyHoliday extends Document {
    title: string;
    date: Date;
    themeColor?: string;
    animationUrl?: string;
    animationPublicId?: string;
    animationResourceType?: 'image' | 'video';
    isDefault?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CompanyHolidaySchema = new Schema(
    {
        title: { type: String, required: true },
        date: { type: Date, default: null },
        themeColor: { type: String, default: '#f43f5e' },
        animationUrl: { type: String },
        animationPublicId: { type: String },
        animationResourceType: { type: String, enum: ['image', 'video'], default: 'image' },
        isDefault: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Delete cached model to force schema refresh (development only)
if (mongoose.models.CompanyHoliday) {
    delete mongoose.models.CompanyHoliday;
}

export const CompanyHoliday =
    mongoose.models.CompanyHoliday || mongoose.model<ICompanyHoliday>("CompanyHoliday", CompanyHolidaySchema);
