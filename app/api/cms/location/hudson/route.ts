import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import HudsonLocation from "@/models/HudsonLocation";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultData = {
  heroSection: {
    title: "Hudson County",
    subtitle: "Professional Cleaning Services in Hudson County, NJ",
    backgroundImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1920",
    ctaButton1: "SCHEDULE SERVICE",
    ctaButton2: "CALL US NOW"
  },
  contactSection: {
    title: "Contact Information",
    phone: "201-555-1234",
    email: "hudson@clensy.com",
    address: "789 Hudson Ave, Jersey City, NJ 07302",
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
    "Jersey City", "Hoboken", "Bayonne", "Union City", "North Bergen",
    "West New York", "Secaucus", "Kearny", "Harrison", "Guttenberg",
    "Weehawken", "East Newark"
  ],
  aboutSection: {
    title: "About Our Hudson County Services",
    description: "Serving Hudson County with top-quality cleaning services for both residential and commercial properties."
  },
  seo: {
    title: "Professional Cleaning Services in Hudson County, NJ | Clensy",
    description: "Clensy offers professional cleaning services in Hudson County, NJ.",
    keywords: ["cleaning services Hudson County", "house cleaning Jersey City"]
  }
};

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getLocationBySlug('hudson');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let data = await HudsonLocation.findOne().sort({ updatedAt: -1 });
    
    if (!data) {
      data = await HudsonLocation.create(defaultData);
    }
    
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Hudson location data" },
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
    
    const updatedData = await HudsonLocation.findOneAndUpdate(
      {},
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Hudson location data updated successfully",
      data: updatedData 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Hudson location data" },
      { status: 500 }
    );
  }
}
