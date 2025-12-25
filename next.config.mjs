/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  serverExternalPackages: ['mongoose', 'mongodb'],
  trailingSlash: true,
  // Remove output export to enable server-side features
  // This allows API routes, SSR, and other server features
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize mongoose and mongodb to avoid bundling issues
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('mongoose', 'mongodb');
      } else {
        config.externals = [config.externals, 'mongoose', 'mongodb'];
      }
    }
    return config;
  },
  // Add headers for Strapi preview iframe embedding
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:1337 https://*.railway.app https://*.up.railway.app https://strapi-production-8d56.up.railway.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
