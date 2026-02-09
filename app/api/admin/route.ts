import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Admin API" });
}

export async function POST() {
  return NextResponse.json({ message: "Admin POST API" });
}