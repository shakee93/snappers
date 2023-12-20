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
    ],
  }
}

module.exports = nextConfig
