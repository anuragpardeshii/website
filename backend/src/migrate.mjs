import { readdir, readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";
export const migrationDirectory = new URL("../migrations/", import.meta.url);
export async function migrationFiles(directory = migrationDirectory) {
  const files = (await readdir(directory))
    .filter((name) => /^V\d+__[a-z0-9_]+\.mjs$/.test(name))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  const versions = new Set();
  return Promise.all(
    files.map(async (file) => {
      const version = parseInt(file.slice(1));
      if (versions.has(version))
        throw new Error("Duplicate migration version: " + version);
      versions.add(version);
      const url = new URL(file, directory);
      return {
        version,
        file,
        url,
        checksum: createHash("sha256")
          .update(await readFile(url))
          .digest("hex"),
      };
    }),
  );
}
export async function runMigrations(
  db,
  { directory = migrationDirectory, statusOnly = false } = {},
) {
  const files = await migrationFiles(directory);
  const history = db.collection("_migrations");
  const applied = await history.find({}).toArray();
  for (const entry of applied) {
    const local = files.find((f) => f.version === entry.version);
    if (!local || local.checksum !== entry.checksum)
      throw new Error(
        "Applied migration was removed or modified: " + entry.file,
      );
  }
  const status = files.map((f) => ({
    version: f.version,
    file: f.file,
    status: applied.some((a) => a.version === f.version)
      ? "applied"
      : "pending",
  }));
  if (statusOnly) return status;
  const owner = randomUUID(),
    locks = db.collection("_migration_locks");
  // No automatic lock expiry: a second migrator must never steal a slow migration.
  // An interrupted process leaves a lock that an operator reviews before unlocking.
  try {
    await locks.insertOne({ _id: "schema", owner, started_at: new Date() });
  } catch (e) {
    if (e.code === 11000)
      throw new Error(
        "Another migration holds the schema lock. Check _migration_locks before retrying.",
      );
    throw e;
  }
  try {
    await history.createIndex({ version: 1 }, { unique: true });
    const current = await history.find({}).toArray();
    for (const file of files) {
      const existing = current.find((a) => a.version === file.version);
      if (existing) {
        if (existing.checksum !== file.checksum)
          throw new Error("Migration checksum mismatch: " + file.file);
        continue;
      }
      if (current.some((a) => a.version > file.version))
        throw new Error("Out-of-order migration: " + file.file);
      const { up } = await import(file.url.href);
      await up(db);
      await history.insertOne({
        version: file.version,
        file: file.file,
        checksum: file.checksum,
        applied_at: new Date(),
      });
    }
  } finally {
    await locks.deleteOne({ _id: "schema", owner });
  }
  return status;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const client = new MongoClient(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true",
  );
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE || "sleektech");
    const statusOnly = process.argv.includes("--status");
    await runMigrations(db, { statusOnly });
    console.table(await runMigrations(db, { statusOnly: true }));
  } finally {
    await client.close();
  }
}
