import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const envFile = fileURLToPath(new URL(".env.local", root));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const [workspace, command] = process.argv.slice(2);
if (!["backend", "crm", "careers"].includes(workspace) || !command)
  throw new Error("Choose a workspace and package script.");
const result = spawnSync("npm", ["run", command], {
  cwd: fileURLToPath(new URL(workspace + "/", root)),
  stdio: "inherit",
  env: process.env,
});
if (result.error) throw result.error;
process.exit(result.status || 0);
