import mongoose, {
  Schema,
  Document
} from "mongoose";

export interface IDisabledIdRequest
  extends Document {

  userId: mongoose.Types.ObjectId;

  userName: string;

  userEmail: string;

  reason:
    | "account_disabled"
    | "wrong_deactivation"
    | "project_pending"
    | "internship_continuation"
    | "employee_return"
    | "access_required"
    | "other";

  message: string;

  status:
    | "pending"
    | "approved"
    | "rejected";


  reviewedBy?: mongoose.Types.ObjectId;
  adminReply?: string;


  resolvedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const DisabledIdRequestSchema =
  new Schema<IDisabledIdRequest>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      userName: {
        type: String,
        required: true,
        trim: true,
      },

      userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      reason: {
        type: String,
        required: true,
        enum: [
          "account_disabled",
          "wrong_deactivation",
          "project_pending",
          "internship_continuation",
          "employee_return",
          "access_required",
          "other",
        ],
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
        index: true,
      },

      adminReply: {
        type: String,
        default: null,
      },


      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },

      resolvedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

if (
  mongoose.models.DisabledIdRequest
) {
  delete mongoose.models
    .DisabledIdRequest;
}

export const DisabledIdRequest =
  mongoose.models.DisabledIdRequest ||
  mongoose.model<IDisabledIdRequest>(
    "DisabledIdRequest",
    DisabledIdRequestSchema
  );