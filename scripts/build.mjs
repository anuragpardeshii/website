import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
for (const workspace of ["@sleektech/crm", "@sleektech/careers"]) {
  const result = spawnSync("npm", ["run", "build", "--workspace", workspace], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
