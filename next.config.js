/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // 在构建时进行类型检查
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在构建时进行 ESLint 检查
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig