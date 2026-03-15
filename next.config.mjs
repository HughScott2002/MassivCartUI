/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    return [
      // Keep Next.js API routes (pois, admin) — do NOT proxy these
      {
        source: "/api/pois",
        destination: "/api/pois",
      },
      {
        source: "/api/admin/:path*",
        destination: "/api/admin/:path*",
      },
      // Everything else under /api goes to Express
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
