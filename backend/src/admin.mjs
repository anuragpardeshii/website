import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { database } from "./db.mjs";
import { createUser } from "./auth.mjs";
import { z } from "zod";
let hidden = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!hidden) process.stdout.write(chunk);
    callback();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
let db;
try {
  const email = z.email().parse(await rl.question("Staff email: "));
  const name = z
    .string()
    .min(2)
    .parse(await rl.question("Full name: "));
  const role = z
    .enum(["super_admin", "admin", "sales", "recruiter"])
    .parse(
      (await rl.question("Role (super_admin/admin/sales/recruiter): ")).trim(),
    );
  process.stdout.write("Password (at least 15 characters; hidden): ");
  hidden = true;
  const password = z
    .string()
    .min(15)
    .max(128)
    .parse(await rl.question(""));
  hidden = false;
  process.stdout.write("\n");
  db = await database();
  await createUser(db, { email, name, password, role });
  console.log("Staff account created.");
} catch {
  console.error(
    "Could not create account. Check the entries and whether the email already exists.",
  );
  process.exitCode = 1;
} finally {
  rl.close();
  if (db) await db.close();
}
