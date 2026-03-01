import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyHoliday extends Document {
    title: string;
    date: Date;
    themeColor?: string;
    animationUrl?: string;
    animationPublicId?: string;
    animationResourceType?: 'image' | 'video';
    createdAt: Date;
    updatedAt: Date;
}

const CompanyHolidaySchema = new Schema(
    {
        title: { type: String, required: true },
        date: { type: Date, required: true, unique: true },
        themeColor: { type: String, default: '#f43f5e' },
        animationUrl: { type: String },
        animationPublicId: { type: String },
        animationResourceType: { type: String, enum: ['image', 'video'], default: 'image' }
    },
    { timestamps: true }
);

export const CompanyHoliday =
    mongoose.models.CompanyHoliday || mongoose.model<ICompanyHoliday>("CompanyHoliday", CompanyHolidaySchema);
