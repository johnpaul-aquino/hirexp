import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable server-side features
  // (API routes, database connections, authentication)
  images: {
    unoptimized: true,
  },
}

export default nextConfig