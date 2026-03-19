const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  logging: {
    fetches: {
      fullUrl: true
    }
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
        hostname: "api.gqmobiles.lk",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

module.exports = nextConfig;
