// next.config.js
const nextConfig = {
  reactStrictMode: false, // Disable to prevent double rendering issues
  poweredByHeader: false,
  compress: true,
  
  // Image configuration for external domains
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Optimize for development stability
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Prevent memory leaks
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;