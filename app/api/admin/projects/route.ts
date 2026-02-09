import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Admin projects API" });
}

export async function POST() {
  return NextResponse.json({ message: "Admin projects POST API" });
}