/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '10013',
                pathname: '*',
            },
        ],
    },
}

module.exports = nextConfig
