import { database } from "./db.mjs";
import { createApp } from "./app.mjs";
import { attachNotificationSocket } from "./notification-socket.mjs";
import { seedDemo } from "./seed.mjs";
const production = process.env.NODE_ENV === "production";
const host = process.env.HOST || (production ? "0.0.0.0" : "127.0.0.1");
if (production) {
  if (!process.env.MONGODB_URI)
    throw new Error("Production requires MONGODB_URI.");
  for (const key of ["CRM_ORIGIN", "TALENT_ORIGIN", "MARKETING_ORIGIN"])
    if (!process.env[key]?.startsWith("https://"))
      throw new Error(key + " must use HTTPS in production.");
}
const demo = !production && process.env.ENABLE_DEMO === "true";
const db = await database();
if (demo) await seedDemo(db);
const app = createApp(db, { demo });
const server = app.listen(
  Number(process.env.PORT || 4000),
  host,
  () =>
    console.log(
      "SleekTech API: http://" +
        host +
        ":" +
        (process.env.PORT || 4000) +
        (demo ? " (local demo)" : ""),
    ),
);
const notifications = await attachNotificationSocket(server, db);
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await notifications.close();
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
