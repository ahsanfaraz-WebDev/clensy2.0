import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db/mongodb";
import MedicalCleaning from "@/models/MedicalCleaning";
import CMSAdapter from "@/lib/cms-adapter";

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug('medical-cleaning');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();

    let data = await MedicalCleaning.findOne();

    if (!data) {
      data = await MedicalCleaning.create({});
    }

    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Error fetching medical cleaning data:", error);
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

    const updatedData = await MedicalCleaning.findOneAndUpdate(
      {},
      { ...updateData, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Error updating medical cleaning data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update data" },
      { status: 500 }
    );
  }
}
