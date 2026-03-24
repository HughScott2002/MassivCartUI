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
      // Next.js API routes (not Express): command + chat proxy/fallback in-repo
      {
        source: "/api/command",
        destination: "/api/command",
      },
      {
        source: "/api/chat",
        destination: "/api/chat",
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
