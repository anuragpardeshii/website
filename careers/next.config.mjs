const config = {
  devIndicators: false,
  ...(process.env.NODE_ENV === "development" &&
  /^\d{4,5}$/.test(process.env.SLEEKTECH_DEV_PORT || "")
    ? { distDir: ".next-local-" + process.env.SLEEKTECH_DEV_PORT }
    : {}),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  transpilePackages: ["@sleektech/ui"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          (process.env.API_URL || "http://127.0.0.1:4000") + "/api/:path*",
      },
    ];
  },
};
export default config;
