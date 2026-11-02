import { createServer } from "node:net";

const host = "127.0.0.1";
function preferred(value, fallback) {
  const number = Number(value || fallback);
  if (!Number.isInteger(number) || number < 1024 || number > 65535)
    throw new Error(
      `Invalid development port: ${value}. Use an integer from 1024 to 65535.`,
    );
  return number;
}
function originPort(value) {
  if (!value) return undefined;
  const url = new URL(value);
  return url.port || (url.protocol === "https:" ? 443 : 80);
}
async function reserve(port) {
  const server = createServer((socket) => socket.destroy());
  return new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(null);
      else reject(error);
    });
    server.listen({ port, host, exclusive: true }, () => {
      let released = false;
      resolve({
        port,
        async release() {
          if (released) return;
          released = true;
          await new Promise((done) => server.close(done));
        },
      });
    });
  });
}
export async function developmentConfig(
  env = process.env,
  { website = true } = {},
) {
  const preferredPorts = {
    backend: preferred(env.API_PORT || env.PORT, 4000),
    crm: preferred(env.CRM_PORT || originPort(env.CRM_ORIGIN), 3001),
    careers: preferred(
      env.CAREERS_PORT || env.TALENT_PORT || originPort(env.TALENT_ORIGIN),
      3002,
    ),
    website: preferred(
      env.WEBSITE_PORT || originPort(env.MARKETING_ORIGIN),
      5173,
    ),
  };
  const leases = {};
  const names = ["backend", "crm", "careers", ...(website ? ["website"] : [])];
  const release = () =>
    Promise.all(Object.values(leases).map((lease) => lease.release()));
  try {
    // Reserve each app's preferred port first, so CRM fallback cannot steal the
    // available careers port. Keep leases until the corresponding child starts.
    for (const name of names) {
      const lease = await reserve(preferredPorts[name]);
      if (lease) leases[name] = lease;
    }
    for (const name of names) {
      if (leases[name]) continue;
      for (
        let offset = 1;
        offset <= 1000 && preferredPorts[name] + offset <= 65535;
        offset++
      ) {
        const lease = await reserve(preferredPorts[name] + offset);
        if (lease) {
          leases[name] = lease;
          break;
        }
      }
      if (!leases[name])
        throw new Error(
          `No available ${name} port near ${preferredPorts[name]}. Set a different preferred port.`,
        );
    }
    const ports = {
      ...preferredPorts,
      ...Object.fromEntries(
        Object.entries(leases).map(([key, value]) => [key, value.port]),
      ),
    };
    const urls = Object.fromEntries(
      Object.entries(ports).map(([key, port]) => [
        key,
        `http://${host}:${port}`,
      ]),
    );
    return {
      host,
      ports,
      urls,
      preferredPorts,
      leases,
      release,
      env: {
        NODE_ENV: "development",
        HOST: host,
        PORT: String(ports.backend),
        API_URL: urls.backend,
        CRM_ORIGIN: urls.crm,
        TALENT_ORIGIN: urls.careers,
        MARKETING_ORIGIN: urls.website,
        NEXT_PUBLIC_CRM_URL: urls.crm,
        NEXT_PUBLIC_TALENT_URL: urls.careers,
        NEXT_PUBLIC_MARKETING_URL: urls.website,
        VITE_CAREERS_API_URL: "/api/public/jobs",
        VITE_CAREERS_PORTAL_URL: urls.careers,
        ENABLE_DEMO: env.ENABLE_DEMO || "false",
      },
    };
  } catch (error) {
    await release();
    throw error;
  }
}
