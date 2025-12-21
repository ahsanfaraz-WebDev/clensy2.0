import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import EssexLocation from "@/models/EssexLocation";
import CMSAdapter from "@/lib/cms-adapter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultData = {
  heroSection: {
    title: "Essex County",
    subtitle: "Professional Cleaning Services in Essex County, NJ",
    backgroundImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920",
    ctaButton1: "SCHEDULE SERVICE",
    ctaButton2: "CALL US NOW"
  },
  contactSection: {
    title: "Contact Information",
    phone: "973-555-7890",
    email: "essex@clensy.com",
    address: "456 Essex Ave, Essex County, NJ 07000",
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
    "Newark", "Montclair", "Bloomfield", "West Orange", "East Orange",
    "Maplewood", "South Orange", "Livingston", "Millburn", "Nutley",
    "Belleville", "Irvington", "Glen Ridge", "Caldwell", "Cedar Grove"
  ],
  aboutSection: {
    title: "About Our Essex County Services",
    description: "Serving Essex County with top-quality cleaning services for both residential and commercial properties."
  },
  seo: {
    title: "Professional Cleaning Services in Essex County, NJ | Clensy",
    description: "Clensy offers professional cleaning services in Essex County, NJ.",
    keywords: ["cleaning services Essex County", "house cleaning Essex County"]
  }
};

export async function GET() {
  try {
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getLocationBySlug('essex');
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // Fallback to MongoDB
    await connectToDatabase();
    let data = await EssexLocation.findOne().sort({ updatedAt: -1 });
    
    if (!data) {
      data = await EssexLocation.create(defaultData);
    }
    
    return NextResponse.json({ success: true, data, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Essex location data" },
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
    
    const updatedData = await EssexLocation.findOneAndUpdate(
      {},
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Essex location data updated successfully",
      data: updatedData 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update Essex location data" },
      { status: 500 }
    );
  }
}
