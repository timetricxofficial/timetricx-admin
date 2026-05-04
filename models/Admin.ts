import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  designation: string;
  mobileNumber: string;
  profilePicture: string;
  password: string;
  edit: boolean; // permission for editing
  status: 'admin' | 'superadmin';
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    mobileNumber: {
      type: String,
      trim: true,
      maxlength: 15
    },
    profilePicture: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      unique: true,
      required: true,
      minlength: 6,
      select: false // 🔐 password API se hide rahega
    },
    edit: {
      type: Boolean,
      default: false // edit permission (true = can edit)
    },
    isDisabled: {
      type: Boolean,
      default: false // disable permission (true = disabled)
    },
    status: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin'
    },
    
  },
  {
    timestamps: true
  }
);

export const Admin =
  mongoose.models.Admin ||
  mongoose.model<IAdmin>('Admin', AdminSchema);
