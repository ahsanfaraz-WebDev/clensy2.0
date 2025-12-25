import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const url = searchParams.get('url');
  const status = searchParams.get('status');

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  const validSecrets = [
    process.env.PREVIEW_SECRET,
    process.env.NEXT_PUBLIC_PREVIEW_SECRET,
    process.env.STRAPI_PREVIEW_SECRET,
    // Fallback for development (should match Strapi default)
    process.env.NODE_ENV === 'development' ? 'your-secret-key' : null,
  ].filter(Boolean);

  if (!secret || !validSecrets.includes(secret)) {
    console.error('Preview secret mismatch:', {
      received: secret,
      expected: validSecrets[0] ? '***' : 'none set',
      env: process.env.NODE_ENV,
    });
    return new Response('Invalid token', { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode();
  if (status === 'published') {
    draft.disable();
  } else {
    draft.enable();
  }

  // Redirect to the path from the fetched post
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  redirect(url || '/');
}


