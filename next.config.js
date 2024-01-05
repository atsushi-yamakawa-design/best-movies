/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Next.js アプリ内のAPIエンドポイント
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://best-movies-sand.vercel.app/"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,POST"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
