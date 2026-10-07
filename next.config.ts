import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Substack post cover images (from the RSS feed's <enclosure>) live on S3,
    // and Substack's own resizer proxies them through substackcdn.com.
    remotePatterns: [
      { protocol: 'https', hostname: 'substack-post-media.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'substackcdn.com' },
      { protocol: 'https', hostname: '*.substack.com' },
    ],
  },
  async redirects() {
    // The blog section used to live at /thoughts; keep old links working.
    return [
      { source: '/thoughts', destination: '/writings', permanent: true },
      { source: '/thoughts/:path*', destination: '/writings/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
