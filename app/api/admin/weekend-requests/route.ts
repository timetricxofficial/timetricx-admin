import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { WeekendRequest } from "../../../../models/WeekendRequest";
import { FaceAttendance } from "../../../../models/FaceAttendance";
import { User } from "../../../../models/User";

// 🔥 Auto-sync: find weekend attendance records that don't have a WeekendRequest
async function syncMissingWeekendRequests() {
    try {
        const allAttendance = await FaceAttendance.find({}).lean();

        for (const doc of allAttendance) {
            for (const month of (doc as any).months || []) {
                for (const record of month.records || []) {
                    // Parse date and check if it's a weekend
                    const dateObj = new Date(record.date + "T00:00:00+05:30");
                    const dayOfWeek = dateObj.getDay();

                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        // Check if WeekendRequest already exists
                        const exists = await WeekendRequest.findOne({
                            userEmail: (doc as any).userEmail,
                            date: record.date,
                        });

                        if (!exists) {
                            // Get user name
                            const user = await User.findOne({ email: (doc as any).userEmail }).select("name");
                            const dayName = dayOfWeek === 0 ? "Sunday" : "Saturday";

                            await WeekendRequest.create({
                                userEmail: (doc as any).userEmail,
                                userName: user?.name || (doc as any).userEmail,
                                date: record.date,
                                dayName,
                                entryTime: record.entryTime,
                                exitTime: record.exitTime || null,
                                workedHours: record.workedHours || 0,
                                status: "pending",
                            });

                            console.log(`✅ Auto-synced weekend request: ${(doc as any).userEmail} - ${record.date}`);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error("Weekend sync error:", err);
    }
}

// GET — List all weekend requests (with optional status filter)
export async function GET(req: Request) {
    try {
        await connectDB();

        // 🔥 Auto-sync missing weekend requests first
        await syncMissingWeekendRequests();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // "pending" | "approved" | "rejected" | null (all)
        const email = searchParams.get("email");

        const filter: any = {};
        if (status) filter.status = status;
        if (email) filter.userEmail = email;

        const requests = await WeekendRequest.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: requests,
            count: requests.length,
        });
    } catch (err) {
        console.error("WEEKEND REQUESTS LIST ERROR:", err);
        return NextResponse.json({
            success: false,
            message: "Server error",
        });
    }
}

// PATCH — Approve or reject a weekend request
export async function PATCH(req: Request) {
    try {
        const { requestId, action, adminEmail, reason } = await req.json();

        if (!requestId || !action || !adminEmail) {
            return NextResponse.json({
                success: false,
                message: "requestId, action, and adminEmail are required",
            });
        }

        if (!["approved", "rejected"].includes(action)) {
            return NextResponse.json({
                success: false,
                message: "Action must be 'approved' or 'rejected'",
            });
        }

        await connectDB();

        const request = await WeekendRequest.findByIdAndUpdate(
            requestId,
            {
                status: action,
                approvedBy: adminEmail,
                approvedAt: new Date(),
                reason: reason || null,
            },
            { new: true }
        );

        if (!request) {
            return NextResponse.json({
                success: false,
                message: "Request not found",
            });
        }

        return NextResponse.json({
            success: true,
            message: `Weekend request ${action}`,
            data: request,
        });
    } catch (err) {
        console.error("WEEKEND REQUEST ACTION ERROR:", err);
        return NextResponse.json({
            success: false,
            message: "Server error",
        });
    }
}
