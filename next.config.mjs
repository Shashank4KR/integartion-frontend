/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
