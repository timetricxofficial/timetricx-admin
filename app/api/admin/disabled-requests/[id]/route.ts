import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { DisabledIdRequest } from "@/models/DisabledIdRequest";
import { Admin } from "@/models/Admin";
import { sendEmail } from "@/utils/sendEmailDisabled";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(
    process.env.MONGODB_URI || ""
  );
};

export async function PATCH(
  request: Request
) {
  try {
    await connectDB();

    const {
      status,
      adminEmail,
      userEmail,
      replyMessage,
    } = await request.json();

    // ==========================
    // VALIDATIONS
    // ==========================

    if (
      !status ||
      !adminEmail ||
      !userEmail ||
      !replyMessage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status, Admin Email, User Email and Reply Message are required.",
        },
        { status: 400 }
      );
    }

    if (
      !["approved", "rejected"].includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status.",
        },
        { status: 400 }
      );
    }

    // ==========================
    // VERIFY ADMIN
    // ==========================

    const adminUser =
      await Admin.findOne({
        email: adminEmail
          .toLowerCase()
          .trim(),
      });

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin account not found.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // FIND USER REQUEST
    // ==========================

    const existingRequest =
      await DisabledIdRequest.findOne({
        userEmail: userEmail
          .toLowerCase()
          .trim(),
        status: "pending",
      });

    if (!existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No pending disabled ID request found for this user.",
        },
        { status: 404 }
      );
    }

    // ==========================
    // UPDATE REQUEST
    // ==========================

    existingRequest.status = status;

    existingRequest.reviewedBy =
      adminUser._id;

    existingRequest.adminReply =
      replyMessage.trim();

    existingRequest.resolvedAt =
      new Date();

    await existingRequest.save();

    // ==========================
    // EMAIL CONTENT
    // ==========================

    const isApproved =
      status === "approved";

    const emailSubject =
      isApproved
        ? "🔓 Timetricx Disabled ID Request Approved"
        : "🔒 Timetricx Disabled ID Request Rejected";

    const emailHtml = `
      <div style="background:#050814;padding:40px 20px;font-family:Segoe UI,Arial,sans-serif;color:#e2e8f0;">
        
        <div style="max-width:650px;margin:auto;background:#07101f;border-radius:16px;padding:30px;border:1px solid rgba(255,255,255,0.08);">

          <h2 style="margin-top:0;color:${
            isApproved
              ? "#10b981"
              : "#ef4444"
          };">
            Hello ${existingRequest.userName},
          </h2>

          <p style="line-height:1.7;color:#cbd5e1;">
            Your disabled account request has been reviewed by our administration team.
          </p>

          <div style="
            margin-top:20px;
            background:#0f172a;
            padding:20px;
            border-radius:12px;
            border-left:4px solid ${
              isApproved
                ? "#10b981"
                : "#ef4444"
            };
          ">

            <p style="margin:0 0 10px 0;">
              <strong>Status:</strong>
              ${status.toUpperCase()}
            </p>

            <p style="margin:0;">
              <strong>Admin Reply:</strong><br/>
              ${replyMessage}
            </p>

          </div>

          <p style="margin-top:25px;color:#94a3b8;">
            Reviewed By:
            <strong>
              ${adminUser.name}
            </strong>
          </p>

          <p style="font-size:12px;color:#64748b;">
            Timetricx Security & Compliance Team
          </p>

        </div>

      </div>
    `;

    // ==========================
    // SEND EMAIL
    // ==========================

    const emailResult =
      await sendEmail({
        to: userEmail,
        subject: emailSubject,
        text: replyMessage,
        html: emailHtml,
      });

    console.log(
      "Email Result:",
      emailResult
    );

    // ==========================
    // SUCCESS RESPONSE
    // ==========================

    return NextResponse.json(
      {
        success: true,
        message:
          "Request reviewed successfully.",
        data: existingRequest,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Disabled Request Review Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}