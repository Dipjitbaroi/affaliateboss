/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
}

module.exports = nextConfig
