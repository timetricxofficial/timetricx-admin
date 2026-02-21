import mongoose, { Schema, Document } from "mongoose";

export interface IProjectLiveLink extends Document {
  projectId: mongoose.Types.ObjectId;
  projectName: string;

  submittedBy: mongoose.Types.ObjectId;
  submittedByEmail: string;

  liveUrl: string;

  status: "pending" | "approved" | "rejected";

  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectLiveLinkSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    projectName: String,

    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    submittedByEmail: {
      type: String,
      required: true,
      index: true,
    },

    liveUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  { timestamps: true }
);
delete mongoose.models.ProjectLiveLink;

export const ProjectLiveLink =
  mongoose.models.ProjectLiveLink ||
  mongoose.model<IProjectLiveLink>(
    "ProjectLiveLink",
    ProjectLiveLinkSchema
  );
