import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CMSAdapter from "@/lib/cms-adapter";

// Get service data by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Try Strapi first if enabled
    const strapiData = await CMSAdapter.getServiceBySlug(slug);
    if (strapiData) {
      return NextResponse.json({ success: true, data: strapiData, source: 'strapi' });
    }
    
    // If no data found
    return NextResponse.json(
      { success: false, error: `Service '${slug}' not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service data" },
      { status: 500 }
    );
  }
}

// Update service data (for admin)
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, updates go through Strapi admin panel
    return NextResponse.json(
      { success: false, error: "Please use Strapi admin panel to update services" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update service data" },
      { status: 500 }
    );
  }
}
