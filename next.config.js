/** @type {import('next').NextConfig} */

const path = require('path')
 
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },

}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/*/**',
      },
      {
        protocol: 'http',
        hostname: '52.45.14.64',
        port: '',
        pathname: '/*/**',
      },
      {
        protocol: 'https',
        hostname: 'gq.freshpixl.com',
        port: '',
        pathname: '/*/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10013',
        pathname: '/*/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/id/*/**',
      },
    ],
  }
}

module.exports = nextConfig
