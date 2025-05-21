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
      {
        source: "/fabrics/:path*/images/:rest*",
        destination: "/images/:rest*",
      },
      {
        source: "/products/:path*/images/:rest*",
        destination: "/images/:rest*",
      },
    ]
  },
}

export default nextConfig
