import type { NextConfig } from "next";

// Replit dev domain for cross-origin iframe support
const replitDomain = process.env.REPLIT_DOMAINS ?? "";
const allowedOrigins = replitDomain
  ? [replitDomain, `*.${replitDomain.split(".").slice(1).join(".")}`]
  : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedOrigins,
  output: 'standalone',
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'date-fns',
    ],
  },
  
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
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, must-revalidate',
            },
          ],
        },
      ] : []),
    ];
  },
};

export default nextConfig;
