/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://nk-store-frontend.vercel.app",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,DELETE,PUT,POST,PATCH",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token,X-Requested-With,Accept, Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version,Content-Type, ",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
