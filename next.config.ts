import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  output: 'standalone',
  
  // Image optimization settings
  images: {
    unoptimized: true, // Set to false when using external image optimization service
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression for API responses
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'date-fns',
    ],
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
