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
    domains: [
      // Reddit image domains
      'b.thumbs.redditmedia.com',
      'a.thumbs.redditmedia.com',
      'styles.redditmedia.com',
      'preview.redd.it',
      'i.redd.it',
      'www.redditstatic.com',
      'thumbs.redditmedia.com',
      'external-preview.redd.it'
    ],
  },
};

module.exports = nextConfig;