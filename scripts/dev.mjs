import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { developmentConfig } from "./dev-config.mjs";

const root = new URL("../", import.meta.url);
for (const relative of [".env.local", "backend/.env.local"]) {
  const path = fileURLToPath(new URL(relative, root));
  if (existsSync(path)) process.loadEnvFile(path);
}
const children = [];
let stopping = false,
  config;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  await config?.release();
  await Promise.all(
    children.map(({ child, exited }) => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      // Signal the supervisor once: Next and the API watcher close their own children.
      // Sending to both a supervisor and its child caused duplicate watcher cleanup.
      child.kill("SIGTERM");
      const force = setTimeout(() => {
        try {
          process.kill(
            process.platform === "win32" ? child.pid : -child.pid,
            "SIGKILL",
          );
        } catch {}
      }, 7000);
      return exited.finally(() => clearTimeout(force));
    }),
  );
  process.exitCode = code;
}
process.on("SIGINT", () => {
  void stop();
});
process.on("SIGTERM", () => {
  void stop();
});
function start(name, folder, binary, args, extra = {}) {
  if (stopping) return;
  const child = spawn(process.execPath, [binary, ...args], {
    cwd: fileURLToPath(new URL(folder + "/", root)),
    stdio: "inherit",
    detached: process.platform !== "win32",
    env: {
      ...process.env,
      ...config.env,
      PORT: String(config.ports[name]),
      ...extra,
    },
  });
  const exited = new Promise((resolve) => {
    child.once("error", (error) => {
      console.error(`${name}: ${error.message}`);
      resolve();
      void stop(1);
    });
    child.once("exit", (code, signal) => {
      resolve();
      if (!stopping) {
        console.error(`${name} stopped (${signal || code}).`);
        void stop(code || 1);
      }
    });
  });
  children.push({ child, exited });
}
try {
  const website = existsSync(new URL("simptech-site/package.json", root));
  config = await developmentConfig(process.env, { website });
  if (stopping) {
    await config.release();
  } else {
    console.log("\nSleektech local development — selected URLs:");
    for (const [name, label] of [
      ["website", "Website"],
      ["crm", "CRM"],
      ["careers", "Careers"],
      ["backend", "API"],
    ]) {
      if (!website && name === "website") continue;
      const shifted = config.ports[name] !== config.preferredPorts[name];
      console.log(
        `${label}: ${config.urls[name]}${shifted ? ` (${config.preferredPorts[name]} occupied; using ${config.ports[name]})` : ""}`,
      );
    }
    console.log(`Recruitment: ${config.urls.careers}/manage\n`);
    const nextRequire = createRequire(new URL("crm/package.json", root));
    await config.leases.backend.release();
    start(
      "backend",
      "backend",
      fileURLToPath(new URL("backend/scripts/dev.mjs", root)),
      [],
    );
    for (const name of ["crm", "careers"]) {
      await config.leases[name].release();
      start(
        name,
        name,
        nextRequire.resolve("next/dist/bin/next"),
        [
          "dev",
          "--webpack",
          "--port",
          String(config.ports[name]),
          "--hostname",
          config.host,
        ],
        { SLEEKTECH_DEV_PORT: String(config.ports[name]) },
      );
    }
    if (website) {
      await config.leases.website.release();
      const vite = fileURLToPath(
        new URL("simptech-site/node_modules/vite/bin/vite.js", root),
      );
      start("website", "simptech-site", vite, [
        "--host",
        config.host,
        "--port",
        String(config.ports.website),
        "--strictPort",
      ]);
    }
  }
} catch (error) {
  console.error("Unable to start local apps: " + error.message);
  await stop(1);
}
