/**
 * Strapi CMS Client
 * 
 * Helper functions for fetching content from Strapi headless CMS
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: {
    id: number;
    attributes: T;
  };
  meta?: object;
}

interface StrapiCollectionResponse<T> {
  data: Array<{
    id: number;
    attributes: T;
  }>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Base fetch function with error handling
async function fetchStrapi<T>(
  endpoint: string,
  options: {
    populate?: string | string[] | object;
    filters?: object;
    sort?: string | string[];
    pagination?: { page?: number; pageSize?: number };
    revalidate?: number | false;
  } = {}
): Promise<T | null> {
  const { populate, filters, sort, pagination, revalidate = 60 } = options;
  
  // Build query string
  const params = new URLSearchParams();
  
  // Handle populate
  if (populate) {
    if (typeof populate === 'string') {
      params.append('populate', populate);
    } else if (Array.isArray(populate)) {
      populate.forEach((p, i) => params.append(`populate[${i}]`, p));
    } else {
      params.append('populate', JSON.stringify(populate));
    }
  }
  
  // Handle filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value as object).forEach(([op, val]) => {
          params.append(`filters[${key}][${op}]`, String(val));
        });
      } else {
        params.append(`filters[${key}]`, String(value));
      }
    });
  }
  
  // Handle sort
  if (sort) {
    if (Array.isArray(sort)) {
      sort.forEach((s, i) => params.append(`sort[${i}]`, s));
    } else {
      params.append('sort', sort);
    }
  }
  
  // Handle pagination
  if (pagination) {
    if (pagination.page) params.append('pagination[page]', String(pagination.page));
    if (pagination.pageSize) params.append('pagination[pageSize]', String(pagination.pageSize));
  }
  
  const queryString = params.toString();
  const url = `${STRAPI_URL}/api${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
      },
      next: revalidate === false ? { revalidate: false } : { revalidate },
    });
    
    if (!response.ok) {
      console.error(`Strapi fetch error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Strapi fetch failed for ${endpoint}:`, error);
    return null;
  }
}

// Helper to extract attributes from Strapi response
function extractAttributes<T>(data: { id: number; attributes: T } | null): T | null {
  return data?.attributes || null;
}

function extractCollectionAttributes<T>(
  data: Array<{ id: number; attributes: T }> | null
): Array<T & { id: number }> {
  return data?.map(item => ({ id: item.id, ...item.attributes })) || [];
}

// ============================================
// Typed API Functions
// ============================================

// Global Settings
export async function getGlobalSettings() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/global-setting',
    { populate: '*' }
  );
  return extractAttributes(response?.data);
}

// Hero Section
export async function getHeroSection() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/hero-section',
    { populate: '*' }
  );
  return extractAttributes(response?.data);
}

// FAQ Page
export async function getFAQPage() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/faq-page',
    { populate: ['faqItems', 'stillHaveQuestionsCards', 'trustIndicators', 'seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// About Page
export async function getAboutPage() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/about',
    { populate: ['ourStoryImage', 'differentiators', 'customerTypes', 'whatMakesUsDifferentImage', 'seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// CTA Section
export async function getCTASection() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/cta',
    { populate: ['leftCard', 'rightCard'] }
  );
  return extractAttributes(response?.data);
}

// Reviews Section
export async function getReviewsSection() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/review',
    { populate: ['testimonials'] }
  );
  return extractAttributes(response?.data);
}

// Services
export async function getServices() {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/services',
    { 
      populate: ['cleaningAreas', 'benefits', 'testimonials', 'faqs', 'seo', 'openGraph', 'localSeo', 'heroBackgroundImage', 'featureSectionImage', 'benefitsImage'],
      sort: 'name:asc',
    }
  );
  return extractCollectionAttributes(response?.data);
}

export async function getServiceBySlug(slug: string) {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/services',
    { 
      filters: { slug: { $eq: slug } },
      populate: ['cleaningAreas', 'benefits', 'testimonials', 'faqs', 'seo', 'openGraph', 'localSeo', 'schema', 'scripts', 'heroBackgroundImage', 'featureSectionImage', 'benefitsImage'],
    }
  );
  const services = extractCollectionAttributes(response?.data);
  return services?.[0] || null;
}

// Locations
export async function getLocations() {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/locations',
    { 
      populate: ['operatingHours', 'serviceAreas', 'seo', 'openGraph', 'localSeo', 'heroBackgroundImage'],
      sort: 'name:asc',
    }
  );
  return extractCollectionAttributes(response?.data);
}

export async function getLocationBySlug(slug: string) {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/locations',
    { 
      filters: { slug: { $eq: slug } },
      populate: ['operatingHours', 'serviceAreas', 'seo', 'openGraph', 'localSeo', 'schema', 'scripts', 'heroBackgroundImage'],
    }
  );
  const locations = extractCollectionAttributes(response?.data);
  return locations?.[0] || null;
}

// Blog Posts
export async function getBlogPosts(options?: { page?: number; pageSize?: number }) {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/blog-posts',
    { 
      populate: ['featuredImage', 'seo', 'openGraph'],
      sort: 'publishedDate:desc',
      pagination: options,
    }
  );
  return {
    posts: extractCollectionAttributes(response?.data),
    pagination: response?.meta?.pagination,
  };
}

export async function getBlogPostBySlug(slug: string) {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/blog-posts',
    { 
      filters: { slug: { $eq: slug } },
      populate: ['featuredImage', 'seo', 'openGraph', 'scripts'],
    }
  );
  const posts = extractCollectionAttributes(response?.data);
  return posts?.[0] || null;
}

// Pages (generic)
export async function getPageBySlug(slug: string) {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/pages',
    { 
      filters: { slug: { $eq: slug } },
      populate: ['featuredImage', 'seo', 'openGraph', 'scripts'],
    }
  );
  const pages = extractCollectionAttributes(response?.data);
  return pages?.[0] || null;
}

// Redirects
export async function getRedirects() {
  const response = await fetchStrapi<StrapiCollectionResponse<any>>(
    '/redirects',
    { 
      filters: { isActive: { $eq: true } },
      pagination: { pageSize: 1000 },
    }
  );
  return extractCollectionAttributes(response?.data);
}

// Privacy Policy
export async function getPrivacyPolicy() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/privacy-policy',
    { populate: ['seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// Terms of Service
export async function getTermsOfService() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/terms-of-service',
    { populate: ['seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// Contact Page
export async function getContactPage() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/contact',
    { populate: ['operatingHours', 'seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// Careers Page
export async function getCareersPage() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/careers-page',
    { populate: ['benefits', 'heroBackgroundImage', 'seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// Checklist
export async function getChecklist() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/checklist',
    { populate: ['seo', 'openGraph'] }
  );
  return extractAttributes(response?.data);
}

// Comparison Section
export async function getComparisonSection() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/comparison',
    { populate: '*' }
  );
  return extractAttributes(response?.data);
}

// How It Works
export async function getHowItWorks() {
  const response = await fetchStrapi<StrapiSingleResponse<any>>(
    '/how-it-work',
    { populate: '*' }
  );
  return extractAttributes(response?.data);
}

// ============================================
// SEO Helpers
// ============================================

export interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  keywords?: string;
  h1?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { url: string };
  twitterCard?: string;
}

export function generateMetadata(seo?: SEOData, openGraph?: any, defaults?: any) {
  const title = seo?.metaTitle || defaults?.metaTitle || 'Clensy';
  const description = seo?.metaDescription || defaults?.metaDescription || '';
  
  return {
    title,
    description,
    keywords: seo?.keywords,
    robots: seo?.metaRobots || 'index,follow',
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title: openGraph?.ogTitle || title,
      description: openGraph?.ogDescription || description,
      images: openGraph?.ogImage?.url ? [openGraph.ogImage.url] : undefined,
      type: 'website',
    },
    twitter: {
      card: openGraph?.twitterCard || 'summary_large_image',
      title: openGraph?.ogTitle || title,
      description: openGraph?.ogDescription || description,
      images: openGraph?.ogImage?.url ? [openGraph.ogImage.url] : undefined,
    },
  };
}

// ============================================
// Schema.org Helpers
// ============================================

export function generateLocalBusinessSchema(data: any) {
  return {
    '@context': 'https://schema.org',
    '@type': data.businessType || 'LocalBusiness',
    name: data.businessName || 'Clensy',
    telephone: data.telephone,
    priceRange: data.priceRange,
    address: data.address ? {
      '@type': 'PostalAddress',
      streetAddress: data.address,
    } : undefined,
    openingHours: data.openingHours,
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateServiceSchema(service: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.heroSubheading,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Clensy',
    },
    areaServed: {
      '@type': 'State',
      name: 'New Jersey',
    },
  };
}

export function generateArticleSchema(article: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: article.author ? {
      '@type': 'Person',
      name: article.author,
    } : undefined,
    datePublished: article.publishedDate,
    image: article.featuredImage?.url,
  };
}

