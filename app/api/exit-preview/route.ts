import { NextRequest, NextResponse } from 'next/server';

/**
 * Exit Preview Mode
 * 
 * Clears preview cookies and redirects to homepage
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Clear preview cookies
  response.cookies.delete('preview');
  response.cookies.delete('preview-secret');
  
  return response;
}



