import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db/mongodb";
import OfficeCleaning from "@/models/OfficeCleaning";
import CMSAdapter from "@/lib/cms-adapter";

// Get office cleaning data
export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug('office-cleaning');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();

    let data = await OfficeCleaning.findOne();

    if (!data) {
      data = await OfficeCleaning.create({});
    }

    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch office cleaning data" },
      { status: 500 }
    );
  }
}

// Update office cleaning data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectToDatabase();

    const { _id, __v, ...updateData } = data;

    const updatedData = await OfficeCleaning.findOneAndUpdate(
      {},
      { ...updateData, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Office cleaning data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update office cleaning data" },
      { status: 500 }
    );
  }
}
