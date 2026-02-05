/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚀 关键：构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
