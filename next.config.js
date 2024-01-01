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
            value: "https://hrj37c-5173.csb.app",
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
