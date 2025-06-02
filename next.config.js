/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/calc',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 