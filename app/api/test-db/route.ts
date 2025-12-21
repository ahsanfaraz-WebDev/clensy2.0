import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const usersCount = await User.countDocuments();
    
    return NextResponse.json({ 
      message: "Database connection successful", 
      usersCount 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 }
    );
  }
}