import { NextRequest, NextResponse } from 'next/server';

/**
 * Strapi Preview Route
 * 
 * This route handles preview requests from Strapi CMS
 * Strapi will call this with a secret token and content ID
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const contentType = searchParams.get('contentType');
  
  // Verify secret token (should match Strapi preview secret)
  const expectedSecret = process.env.STRAPI_PREVIEW_SECRET || 'your-preview-secret';
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // Redirect to the appropriate page with preview mode
  // For hero section, redirect to homepage
  if (contentType === 'hero-section') {
    return NextResponse.redirect(new URL(`/?preview=true&secret=${secret}`, request.url));
  }
  
  // For other content types, you can add specific routes
  // For now, redirect to homepage
  return NextResponse.redirect(new URL(`/?preview=true&secret=${secret}`, request.url));
}



