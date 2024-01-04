/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    domains: ["res.cloudinary.com"]
  },
  eslint: {
    // Warning: This will disable ESLint checks during production builds.
    // It's not recommended as it may allow serious issues to go unnoticed.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
