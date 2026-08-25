import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai"],
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;