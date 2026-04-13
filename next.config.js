/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Stability improvements
  experimental: {
    // Disable features that can cause file system issues
    turbo: {
      // Configure turbopack for better stability
      resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
  },
  
  // Webpack configuration for better file handling
  webpack: (config, { dev, isServer }) => {
    // Increase file system cache stability
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  
  // Disable image optimization in dev to reduce file operations
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;
