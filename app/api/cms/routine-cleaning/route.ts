import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db/mongodb";
import RoutineCleaning from "@/models/RoutineCleaning";
import CMSAdapter from "@/lib/cms-adapter";

// Get routine cleaning data
export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug('routine-cleaning');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let routineCleaningData = await RoutineCleaning.findOne().sort({
      updatedAt: -1,
    });

    // If no data exists, create default data
    if (!routineCleaningData) {
      routineCleaningData = await RoutineCleaning.create({});
    }

    return NextResponse.json({ success: true, data: routineCleaningData, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routine cleaning data" },
      { status: 500 }
    );
  }
}

// Update routine cleaning data
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
    
    const updatedData = await RoutineCleaning.findOneAndUpdate(
      {},
      {
        ...updateData,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update routine cleaning data" },
      { status: 500 }
    );
  }
}
