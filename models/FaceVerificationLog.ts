import mongoose, { Schema, Document } from "mongoose";

export interface IAttempt {
  attemptNo: number;
  time: Date;
  status: "success" | "fail" | "partial";
  confidence?: number;
}

export interface ISession {
  scheduledAt: Date;
  nextRetryAt?: Date;
  finalStatus: "pending" | "success" | "suspicious" | "missed";
  interruptedReason?: string;
  attempts: IAttempt[];
}

export interface IFaceVerificationLog extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  date: string; // YYYY-MM-DD (IST)
  sessions: ISession[];
}

const AttemptSchema = new Schema<IAttempt>({
  attemptNo: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "fail", "partial"], required: true },
  confidence: { type: Number },
});

const SessionSchema = new Schema<ISession>({
  scheduledAt: { type: Date, required: true },
  nextRetryAt: { type: Date },
  finalStatus: { 
    type: String, 
    enum: ["pending", "success", "suspicious", "missed"], 
    default: "pending" 
  },
  interruptedReason: { type: String },
  attempts: [AttemptSchema],
});

const FaceVerificationLogSchema = new Schema<IFaceVerificationLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  date: { type: String, required: true },
  sessions: [SessionSchema],
}, { timestamps: true });

// Index for faster queries
FaceVerificationLogSchema.index({ userEmail: 1, date: 1 });

export const FaceVerificationLog = mongoose.models.FaceVerificationLog || 
  mongoose.model<IFaceVerificationLog>("FaceVerificationLog", FaceVerificationLogSchema);
