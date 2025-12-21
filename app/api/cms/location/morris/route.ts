import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import MorrisLocation from "@/models/MorrisLocation";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultData = {
  heroSection: {
    title: "Morris County",
    subtitle: "Professional Cleaning Services in Morris County, NJ",
    backgroundImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920",
    ctaButton1: "SCHEDULE SERVICE",
    ctaButton2: "CALL US NOW"
  },
  contactSection: {
    title: "Contact Information",
    phone: "973-555-4567",
    email: "morris@clensy.com",
    address: "321 Morris Ave, Morristown, NJ 07960",
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
    "Morristown", "Parsippany", "Dover", "Madison", "Chatham",
    "Denville", "Rockaway", "Morris Plains", "Boonton", "Chester",
    "Randolph", "Florham Park", "Mountain Lakes"
  ],
  aboutSection: {
    title: "About Our Morris County Services",
    description: "Serving Morris County with top-quality cleaning services for both residential and commercial properties."
  },
  seo: {
    title: "Professional Cleaning Services in Morris County, NJ | Clensy",
    description: "Clensy offers professional cleaning services in Morris County, NJ.",
    keywords: ["cleaning services Morris County", "house cleaning Morristown"]
  }
};

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getLocationBySlug('morris');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let data = await MorrisLocation.findOne().sort({ updatedAt: -1 });
    
    if (!data) {
      data = await MorrisLocation.create(defaultData);
    }
    
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Morris location data" },
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
    
    const updatedData = await MorrisLocation.findOneAndUpdate(
      {},
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Morris location data updated successfully",
      data: updatedData 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Morris location data" },
      { status: 500 }
    );
  }
}
