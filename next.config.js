/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: 'export',
  basePath: '/calc',
  assetPrefix: '/calc'
}

module.exports = nextConfig 