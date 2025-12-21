import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import HeroSection from "@/models/HeroSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Toggle this to switch between MongoDB and Strapi
const USE_STRAPI = process.env.USE_STRAPI === 'true';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Get hero section data
export async function GET() {
  try {
    // Use Strapi if enabled
    if (USE_STRAPI) {
      console.log('🔵 Fetching from Strapi:', `${STRAPI_URL}/api/hero-section`);
      
      try {
        const response = await fetch(`${STRAPI_URL}/api/hero-section`, {
          cache: 'no-store', // Disable cache for development - see changes immediately
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Strapi API error:', response.status, errorText);
          throw new Error(`Strapi error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Strapi response:', JSON.stringify(result, null, 2));
        
        const strapiData = result.data;
        
        if (!strapiData) {
          console.warn('⚠️ No data in Strapi response, falling back to MongoDB');
          throw new Error('No Strapi data');
        }
        
        // Transform Strapi response to match existing format
        const heroData = {
          topLabel: strapiData?.topLabel || '',
          heading: strapiData?.heading || '',
          subheading: strapiData?.subheading || '',
          buttonText: strapiData?.buttonText || '',
          feature1: strapiData?.feature1 || '',
          feature2: strapiData?.feature2 || '',
          backgroundImage: strapiData?.backgroundImageUrl || strapiData?.backgroundImage?.url || '',
        };
        
        console.log('✅ Returning Strapi data:', heroData.heading);
        return NextResponse.json({ success: true, data: heroData, source: 'strapi' });
      } catch (strapiError) {
        console.error('❌ Strapi fetch failed, falling back to MongoDB:', strapiError);
        // Fall through to MongoDB fallback
      }
    }
    
    // Original MongoDB logic
    await connectToDatabase();
    let heroData = await HeroSection.findOne().sort({ updatedAt: -1 });
    
    // If no data exists, create default data
    if (!heroData) {
      heroData = await HeroSection.create({});
    }
    
    return NextResponse.json({ success: true, data: heroData, source: 'mongodb' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero section data" },
      { status: 500 }
    );
  }
}

// Update hero section data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectToDatabase();
    
    // Update or create the hero section
    const updatedHero = await HeroSection.findOneAndUpdate(
      {}, // Find the first document (or none)
      {
        ...data,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Hero section updated successfully",
      data: updatedHero 
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}