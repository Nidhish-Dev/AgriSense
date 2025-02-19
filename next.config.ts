/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ['images.unsplash.com', 'res.cloudinary.com', 'aceternity.com', 'assets.aceternity.com', 'plus.unsplash.com', 'images.pexels.com']
  },
  // Ignore TypeScript errors during build
  typescript: {
      ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
      ignoreDuringBuilds: true,
  },
  // Optional: Enable React Strict Mode
  reactStrictMode: false, // Can be set to true for stricter error handling
};

export default nextConfig;