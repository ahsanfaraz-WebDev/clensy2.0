import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import PassaicLocation from "@/models/PassaicLocation";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultData = {
  heroSection: {
    title: "Passaic County",
    subtitle: "Professional Cleaning Services in Passaic County, NJ",
    backgroundImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920",
    ctaButton1: "SCHEDULE SERVICE",
    ctaButton2: "CALL US NOW"
  },
  contactSection: {
    title: "Contact Information",
    phone: "973-555-8901",
    email: "passaic@clensy.com",
    address: "654 Passaic Ave, Clifton, NJ 07011",
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
    "Clifton", "Paterson", "Passaic", "Wayne", "Little Falls",
    "Totowa", "Haledon", "Hawthorne", "Woodland Park", "Pompton Lakes",
    "Ringwood", "West Milford", "Wanaque"
  ],
  aboutSection: {
    title: "About Our Passaic County Services",
    description: "Serving Passaic County with top-quality cleaning services for both residential and commercial properties."
  },
  seo: {
    title: "Professional Cleaning Services in Passaic County, NJ | Clensy",
    description: "Clensy offers professional cleaning services in Passaic County, NJ.",
    keywords: ["cleaning services Passaic County", "house cleaning Clifton"]
  }
};

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getLocationBySlug('passaic');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let data = await PassaicLocation.findOne().sort({ updatedAt: -1 });
    
    if (!data) {
      data = await PassaicLocation.create(defaultData);
    }
    
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Passaic location data" },
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
    
    const updatedData = await PassaicLocation.findOneAndUpdate(
      {},
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Passaic location data updated successfully",
      data: updatedData 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Passaic location data" },
      { status: 500 }
    );
  }
}
