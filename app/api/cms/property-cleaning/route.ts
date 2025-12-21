import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db/mongodb";
import PropertyCleaning from "@/models/PropertyCleaning";
import CMSAdapter from "@/lib/cms-adapter";

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug('property-cleaning');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();

    let data = await PropertyCleaning.findOne();

    if (!data) {
      data = await PropertyCleaning.create({});
    }

    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Error fetching property cleaning data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { _id, __v, ...updateData } = body;

    const updatedData = await PropertyCleaning.findOneAndUpdate(
      {},
      { ...updateData, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Error updating property cleaning data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update data" },
      { status: 500 }
    );
  }
}
