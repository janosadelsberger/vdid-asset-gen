/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/vdid-asset-gen',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

