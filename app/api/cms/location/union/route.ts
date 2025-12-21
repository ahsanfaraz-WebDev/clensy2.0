import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import UnionLocation from "@/models/UnionLocation";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultData = {
  heroSection: {
    title: "Union County",
    subtitle: "Professional Cleaning Services in Union County, NJ",
    backgroundImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920",
    ctaButton1: "SCHEDULE SERVICE",
    ctaButton2: "CALL US NOW"
  },
  contactSection: {
    title: "Contact Information",
    phone: "908-555-2345",
    email: "union@clensy.com",
    address: "987 Union Ave, Elizabeth, NJ 07208",
    hours: [
      { day: "Monday", hours: "8:00 am - 6:00 pm" },
      { day: "Tuesday", hours: "8:00 am - 6:00 pm" },
      { day: "Wednesday", hours: "8:00 am - 6:00 pm" },
      { day: "Thursday", hours: "8:00 am - 6:00 pm" },
      { day: "Friday", hours: "8:00 am - 6:00 pm" },
      { day: "Saturday", hours: "9:00 am - 3:00 pm" },
      { day: "Sunday", hours: "Closed" }
    ]
  },
  serviceAreas: [
    "Elizabeth", "Union", "Linden", "Plainfield", "Westfield",
    "Cranford", "Summit", "Rahway", "Scotch Plains", "Springfield",
    "Roselle", "Roselle Park", "Clark", "Kenilworth", "Mountainside"
  ],
  aboutSection: {
    title: "About Our Union County Services",
    description: "Serving Union County with top-quality cleaning services for both residential and commercial properties."
  },
  seo: {
    title: "Professional Cleaning Services in Union County, NJ | Clensy",
    description: "Clensy offers professional cleaning services in Union County, NJ.",
    keywords: ["cleaning services Union County", "house cleaning Elizabeth"]
  }
};

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getLocationBySlug('union');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let data = await UnionLocation.findOne().sort({ updatedAt: -1 });
    
    if (!data) {
      data = await UnionLocation.create(defaultData);
    }
    
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Union location data" },
      { status: 500 }
    );
  }
}

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
    
    const updatedData = await UnionLocation.findOneAndUpdate(
      {},
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Union location data updated successfully",
      data: updatedData 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Union location data" },
      { status: 500 }
    );
  }
}
