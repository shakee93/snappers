import type { NextConfig } from "next";
import path from "path";
import { siteConfig } from "./site.config";

const apiHostname = new URL(siteConfig.url.api).hostname;
const cdnHostname = new URL(siteConfig.url.cdn).hostname;

const nextConfig: NextConfig = {
  output: "standalone",
  // Flat URL scheme:
  //   /shop              product archive       /categories      category archive
  //   /brands            brand archive         /:slug           product, category, or brand
  // Redirect every legacy URL shape to its new home so old links keep their rank.
  async redirects() {
    return [
      // Previous flat-prefix routes → root slug
      { source: "/p/:slug", destination: "/:slug", permanent: true },
      { source: "/c/:slug", destination: "/:slug", permanent: true },
      { source: "/brand/:slug", destination: "/:slug", permanent: true },
      // Archive index moves
      { source: "/c", destination: "/categories", permanent: true },
      { source: "/products/all", destination: "/shop", permanent: true },
      // Legacy /collections/* (pre-/categories)
      { source: "/collections", destination: "/categories", permanent: true },
      { source: "/collections/all", destination: "/shop", permanent: true },
      { source: "/collections/:slug", destination: "/:slug", permanent: true },
      // Previous /categories/* listings (single slug pages only; index handled above)
      { source: "/categories/all", destination: "/categories", permanent: true },
      { source: "/categories/:slug", destination: "/:slug", permanent: true },
      // Removed FAQ page - keep old links and indexed URLs working
      { source: "/faq", destination: "/return-policy", permanent: true },
    ];
  },
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
