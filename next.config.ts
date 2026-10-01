import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "coin-images.coingecko.com" },
    ],
  },
  allowedDevOrigins: ["172.20.10.5"],
};

export default nextConfig;
