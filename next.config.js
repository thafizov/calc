/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath: '/calc', // Временно отключаем для development
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 