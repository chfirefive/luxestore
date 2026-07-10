// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    // Add external image domains as needed
    domains: []
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|ico|css|js)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};
module.exports = nextConfig;
