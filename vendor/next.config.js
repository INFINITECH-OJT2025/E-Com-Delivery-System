/** @type {import('next').NextConfig} */
const nextConfig = {     typescript: {
  ignoreBuildErrors: true, // Ignores TypeScript errors in production
},
 reactStrictMode: false, // 🔥 Turn this off
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "127.0.0.1",
          port: "8000",
          pathname: "/storage/**", // ✅ Allow all images in storage
        },
        {
          protocol: "https",
          hostname: "indigo-goat-875822.hostingersite.com",
          pathname: "/storage/**", // ✅ This was missing
        },
        {
          protocol: "https",
          hostname: "infinitech-api2.site", // ✅ should NOT have https://
          pathname: "/storage/**",
        }
         
      ],
  },};

module.exports = nextConfig;
