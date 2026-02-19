import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // basePath: "/НАЗВАНИЕ_РЕПО",  // Раскомментировать если репозиторий не username.github.io
  images: {
    unoptimized: true, // Нужно для статического экспорта
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
