// File: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'styles.redditmedia.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.redditstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.redd.it',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.reddit.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;