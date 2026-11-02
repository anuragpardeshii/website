import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { id } from "./db.mjs";
const derive = promisify(scrypt);
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 3,
    maxmem: 64 * 1024 * 1024,
  });
  return "scrypt:32768:8:3:" + salt + ":" + hash.toString("hex");
}
export async function validPassword(password, stored = "") {
  const parts = stored.split(":");
  const modern = parts.length === 6 && parts[0] === "scrypt";
  const [salt, hash] = modern ? parts.slice(4) : parts;
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const actual = await derive(
    password,
    salt,
    64,
    modern ? { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 } : undefined,
  );
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const dummyPasswordHash = await hashPassword(
  randomBytes(32).toString("hex"),
);
export function sessionToken(req) {
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("sleektech_session="));
  return cookie?.slice("sleektech_session=".length) || "";
}
export async function signIn(db, res, user) {
  const token = randomBytes(32).toString("hex");
  await db.remove("sessions", { expires_at: { $lt: new Date() } });
  await db.insert("sessions", {
    token_hash: digest(token),
    user_id: user.id,
    last_seen_at: new Date(),
    expires_at: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie("sleektech_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400000,
    path: "/",
  });
  return publicUser(user);
}
export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    profile: u.profile || {},
  };
}
export async function hasPersonalStaff(db) {
  return Boolean(
    await db.findOne(
      "users",
      {
        role: { $in: ["super_admin", "admin", "sales", "recruiter"] },
        email: { $ne: "team@demo.sleektech.test" },
      },
      { projection: { id: 1 } },
    ),
  );
}
// Socket heartbeats and delivery checks must not extend an idle session.
export async function authenticatedUser(db, req, { touch = false } = {}) {
  const token = sessionToken(req);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.findOne("sessions", {
    token_hash: digest(token),
    expires_at: { $gt: new Date() },
  });
  if (!session) return null;
  const idle =
    Date.now() - new Date(session.last_seen_at || session.created_at).getTime();
  if (!Number.isFinite(idle) || idle >= 60 * 60000) return null;
  const user = await db.findOne("users", {
    id: session.user_id,
    disabled: { $ne: true },
  });
  if (
    !user ||
    (user.email === "team@demo.sleektech.test" && (await hasPersonalStaff(db)))
  )
    return null;
  if (touch && idle > 5 * 60000)
    await db.update(
      "sessions",
      { token_hash: session.token_hash },
      { $set: { last_seen_at: new Date() } },
    );
  return user;
}
export function authentication(db) {
  return async (req, res, next) => {
    req.user = await authenticatedUser(db, req, { touch: true });
    next();
  };
}
export function allow(...roles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ error: "Please sign in to continue." });
    if (
      roles.length &&
      !roles.includes(req.user.role) &&
      !(req.user.role === "super_admin" && roles.includes("admin"))
    )
      return res.status(403).json({
        error: "Your account does not have access to this workspace.",
      });
    next();
  };
}
export async function createUser(
  db,
  { email, name, password, role = "candidate" },
) {
  return db.insert("users", {
    id: id(),
    email: email.toLowerCase().trim(),
    name: name,
    password_hash: await hashPassword(password),
    role: role,
  });
}
