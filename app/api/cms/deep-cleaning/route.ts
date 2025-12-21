import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import DeepCleaning from "@/models/DeepCleaning";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get deep cleaning data
export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug('deep-cleaning');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let deepCleaningData = await DeepCleaning.findOne().sort({ updatedAt: -1 });

    // If no data exists, create default data
    if (!deepCleaningData) {
      deepCleaningData = await DeepCleaning.create({});
    }

    return NextResponse.json({ success: true, data: deepCleaningData, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deep cleaning data" },
      { status: 500 }
    );
  }
}

// Update deep cleaning data
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

    const updatedData = await DeepCleaning.findOneAndUpdate(
      {},
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Deep cleaning data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update deep cleaning data" },
      { status: 500 }
    );
  }
}
