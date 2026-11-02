import { readdir, writeFile } from "node:fs/promises";
const name = process.argv[2];
if (!/^[a-z][a-z0-9_]*$/.test(name || ""))
  throw new Error(
    "Use NAME=profile_changes (lowercase letters, numbers, underscores).",
  );
const directory = new URL("../backend/migrations/", import.meta.url);
const versions = (await readdir(directory))
  .map((n) => /^V(\d+)__/.exec(n)?.[1])
  .filter(Boolean)
  .map(Number);
const file = `V${Math.max(0, ...versions) + 1}__${name}.mjs`;
await writeFile(
  new URL(file, directory),
  "// Implement an idempotent, forward-only migration before applying.\nexport async function up(db) {\n  throw new Error('Migration not implemented');\n}\n",
  { flag: "wx" },
);
console.log("Created backend/migrations/" + file);
