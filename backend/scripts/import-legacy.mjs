import { PGlite } from "@electric-sql/pglite";
import { access, cp, mkdir } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { database, collections } from "../src/db.mjs";
const data = resolve(process.env.DATA_DIR || ".data");
const source = resolve(data, "postgres");
await access(source);
const backup = resolve(
  data,
  "legacy-backups",
  new Date().toISOString().replaceAll(":", "-"),
);
await mkdir(backup, { recursive: true, mode: 0o700 });
await cp(source, backup + "/postgres", { recursive: true, errorOnExist: true });
// Work on a copy so the original embedded database remains available for recovery.
const legacy = new PGlite(backup + "/postgres");
const mongo = await database();
try {
  for (const name of collections)
    if (await mongo.count(name))
      throw new Error(
        "Import requires an empty destination. Existing collection: " + name,
      );
  const rows = {};
  for (const name of collections) {
    rows[name] = (await legacy.query('SELECT * FROM "' + name + '"')).rows.map(
      (row) => {
        for (const key of Object.keys(row)) {
          if (key.endsWith("_at") && row[key]) row[key] = new Date(row[key]);
        }
        if (row.value !== undefined) row.value = Number(row.value);
        if (name === "messages" && row.provider_id === null)
          delete row.provider_id;
        if (name === "leads") row.phone = row.phone.replace(/[^+0-9]/g, "");
        if (name === "resumes")
          row.storage_path = resolve(
            data,
            "resumes",
            basename(row.storage_path),
          );
        return row;
      },
    );
  }
  // Never copy old session cookies; accounts remain available with their existing hashes.
  rows.sessions = [];
  await mongo.transaction(async (tx) => {
    for (const name of collections)
      for (const row of rows[name]) await tx.insert(name, row);
  });
  console.table(
    Object.entries(rows).map(([collection, records]) => ({
      collection,
      imported: records.length,
    })),
  );
  console.log("Original PostgreSQL data retained at " + source);
  console.log("Recovery snapshot retained at " + backup);
} finally {
  await legacy.close();
  await mongo.close();
}
