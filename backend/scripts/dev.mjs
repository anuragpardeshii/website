import { spawn } from "node:child_process";
import { watch } from "chokidar";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
let child,
  exited = Promise.resolve(),
  stopping = false,
  restarting = false;
let pending = false,
  timer;
const watcher = watch(["src", "migrations", ".env.local"], {
  cwd,
  ignoreInitial: true,
  atomic: true,
  followSymlinks: false,
});
function start() {
  if (stopping) return;
  console.log("Backend: starting with hot reload.");
  child = spawn(
    process.execPath,
    ["--env-file-if-exists=.env.local", "src/server.mjs"],
    { cwd, env: process.env, stdio: "inherit" },
  );
  exited = new Promise((resolve) => {
    child.once("error", (error) => {
      console.error(error.message);
      resolve();
      void stop(1);
    });
    child.once("exit", (code) => {
      resolve();
      if (!stopping && !restarting && code !== 0)
        console.error(
          "Backend exited. Waiting for a source change to restart.",
        );
    });
  });
}
async function endChild() {
  const current = child;
  if (!current || current.exitCode !== null || current.signalCode !== null)
    return;
  current.kill("SIGTERM");
  const force = setTimeout(() => current.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(force);
}
async function restart() {
  if (stopping) return;
  if (restarting) {
    pending = true;
    return;
  }
  restarting = true;
  do {
    pending = false;
    await endChild();
    if (!stopping) start();
  } while (pending && !stopping);
  restarting = false;
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  clearTimeout(timer);
  // Close the watcher exactly once, then wait for the API to release its socket,
  // HTTP listener and MongoDB connection before exiting the supervisor.
  await watcher.close();
  await endChild();
  process.exitCode = code;
}
watcher.on("all", (event, path) => {
  if (
    stopping ||
    !["add", "change", "unlink"].includes(event) ||
    !/\.(mjs|json|local)$/.test(path)
  )
    return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    void restart();
  }, 300);
});
watcher.on("error", (error) => {
  console.error("Backend watcher: " + error.message);
  void stop(1);
});
process.on("SIGINT", () => {
  void stop();
});
process.on("SIGTERM", () => {
  void stop();
});
watcher.once("ready", start);
