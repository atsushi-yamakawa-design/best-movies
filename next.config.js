/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.themoviedb.org/:path*" // プロキシ先のURL
      }
    ];
  }
};

module.exports = nextConfig;
