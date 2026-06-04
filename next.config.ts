import type { NextConfig } from "next";
import path from "path";
import { siteConfig } from "./site.config";

const apiHostname = new URL(siteConfig.url.api).hostname;
const cdnHostname = new URL(siteConfig.url.cdn).hostname;

const nextConfig: NextConfig = {
  output: "standalone",
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/photos/*/**",
      },
      {
        protocol: "http",
        hostname: "52.45.14.64",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "10013",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/id/*/**",
      },
      {
        protocol: "https",
        hostname: "payherestorage.blob.core.windows.net",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: apiHostname,
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: cdnHostname,
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

export default nextConfig;
