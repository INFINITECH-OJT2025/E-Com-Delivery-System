/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,  // Ignores TypeScript errors in production
      },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "8000",
                pathname: "/storage/**", // ✅ Allow all images in storage
            },
        ],
    },
};

module.exports = nextConfig;
