/** @type {import('next').NextConfig} */
const nextConfig = {  reactStrictMode: false, // 🔥 Turn this off
    images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },};

module.exports = nextConfig;
