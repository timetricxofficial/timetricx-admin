import { NextResponse } from "next/server";
import { DisabledIdRequest } from "@/models/DisabledIdRequest"; // Apne model ka sahi path check kar lena
import mongoose from "mongoose";

// Database Connection Helper (Agar aapne global connect function banaya hai to use import karein)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("MongoDB Connected for Admin Fetch");
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
};

export async function GET() {
  try {
    // 1. Database se connect karo
    await connectDB();

    // 2. Fetch Requests (Sirf 'pending' requests nikal rahe hain aur sabse naye requests upar dikhenge)
    const requests = await DisabledIdRequest.find({ status: "pending" })
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Lean se query fast chalti hai kyunki ye plain JSON return karta hai

    // 3. Return Success Response
    return NextResponse.json(
      {
        success: true,
        count: requests.length,
        requests: requests,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error in GET /api/admin/disabled-requests:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error. Failed to fetch requests.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}