/** @type {import('next').NextConfig} */
const backend = process.env.NYA_API_BACKEND || "";

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Media is served through the API; Next's optimizer is not used.
    unoptimized: true,
  },
  // Point the frontend at a backend without CORS by proxying /api and /health.
  async rewrites() {
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/health", destination: `${backend}/health` },
    ];
  },
};

export default nextConfig;
