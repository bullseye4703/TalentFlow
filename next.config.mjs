/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Keep API requests working
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
      // Redirect all other routes to the homepage (SPA fallback)
      {
        source: "/:path*",
        destination: "/",
      },
    ]
  },
}

export default nextConfig
