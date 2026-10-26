/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Re-enabled: helps detect side-effect bugs and deprecated APIs
  output: process.env.VERCEL ? undefined : "standalone",
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [
      // Google avatars (OAuth login)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Cloudinary / S3 — add your actual CDN host here
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
