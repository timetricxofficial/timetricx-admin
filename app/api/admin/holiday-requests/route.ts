import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { HolidayWorkRequest } from "../../../../models/HolidayWorkRequest";
import { CompanyHoliday } from "../../../../models/CompanyHoliday";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const total = await (HolidayWorkRequest as any).countDocuments({});

        const requests = await (HolidayWorkRequest as any).find({})
            .populate({ path: 'holidayId', model: CompanyHoliday, select: 'title date' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: requests,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + requests.length < total
            }
        }, { status: 200 });
    } catch (err) {
        console.error("HOLIDAY REQUESTS GET ERROR:", err);
        return NextResponse.json({
            success: false,
            message: "Server error",
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        await connectDB();

        const updatedRequest = await (HolidayWorkRequest as any).findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return NextResponse.json({
                success: false,
                message: "Request not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Request ${status} successfully`,
            data: updatedRequest,
        });
    } catch (err) {
        console.error("HOLIDAY REQUEST PUT ERROR:", err);
        return NextResponse.json({
            success: false,
            message: "Server error",
        }, { status: 500 });
    }
}
