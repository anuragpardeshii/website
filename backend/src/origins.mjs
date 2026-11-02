const defaults = {
  CRM_ORIGIN: "http://localhost:3001",
  TALENT_ORIGIN: "http://localhost:3002",
  MARKETING_ORIGIN: "http://localhost:5173",
};
// HTTP CORS, CSRF and sockets share the same exact configured origin policy.
// In development only, accept loopback aliases on the selected ports.
export function allowedOrigins(
  keys = Object.keys(defaults),
  env = process.env,
) {
  const origins = new Set();
  for (const key of keys) {
    const value = env[key] || defaults[key];
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error(
        `${key} must be an HTTP(S) origin without credentials, path, query or fragment.`,
      );
    origins.add(url.origin);
    if (
      env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ) {
      for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) {
        const alias = new URL(url);
        alias.hostname = hostname;
        origins.add(alias.origin);
      }
    }
  }
  return origins;
}
