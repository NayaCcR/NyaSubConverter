/** @type {import('next').NextConfig} */
const backend = process.env.NYA_API_BACKEND || "";

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Media is served through the API; Next's optimizer is not used.
    unoptimized: true,
  },
  // Only bundled public rule assets are cross-origin readable. No credentials.
  async headers() {
    return [{ source: "/rules/:path*", headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Cache-Control", value: "no-cache" },
    ] }];
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
