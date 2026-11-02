import { WebSocketServer, WebSocket } from "ws";
import { allowedOrigins } from "./origins.mjs";
import { setTimeout as delay } from "node:timers/promises";
import { authenticatedUser } from "./auth.mjs";
import { crmRoles } from "./record-events.mjs";

export const notificationSocketPath = "/api/collaboration/notifications/socket";

// One committed MongoDB change stream per API process, shared by all its clients.
// Each process sees the same committed writes, including writes from other instances.
export async function attachNotificationSocket(
  server,
  db,
  { heartbeatMs = 25000 } = {},
) {
  const origins = allowedOrigins(["CRM_ORIGIN"]);
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 1024,
    perMessageDeflate: false,
  });
  const requests = new Map();
  const stop = new AbortController();
  let closed = false,
    ready = false,
    stream;
  const send = (socket, type) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    if (socket.bufferedAmount > 16384) return socket.terminate();
    socket.send(JSON.stringify({ type }));
  };
  const authorize = async (socket) => {
    const user = await authenticatedUser(db, socket.request);
    if (!user || user.id !== socket.userId || !crmRoles.includes(user.role)) {
      socket.close(4401, "Session expired or access changed");
      return false;
    }
    return true;
  };
  const deliver = async (change) => {
    const recipient = change?.fullDocument?.recipient_id;
    if (!recipient) return;
    await Promise.all(
      [...wss.clients]
        .filter((socket) => socket.userId === recipient)
        .map(async (socket) => {
          if (await authorize(socket)) send(socket, "notifications:changed");
        }),
    );
  };
  const openStream = async () => {
    stream = db.native.collection("notifications").watch(
      [
        {
          $match: { operationType: { $in: ["insert", "update", "replace"] } },
        },
      ],
      { fullDocument: "updateLookup", maxAwaitTimeMS: 1000 },
    );
    // Initialize the cursor before accepting connections. Reconnect sends a fresh
    // HTTP snapshot, so an outage never relies on an in-memory event backlog.
    await stream.tryNext();
    ready = true;
  };
  const consume = async () => {
    while (!closed) {
      try {
        if (!ready) await openStream();
        const change = await stream.tryNext();
        if (change) await deliver(change);
      } catch {
        if (closed) break;
        ready = false;
        for (const socket of wss.clients)
          socket.close(1012, "Notification stream reconnecting");
        await stream?.close().catch(() => {});
        console.warn("Notification stream unavailable; reconnecting.");
        await delay(1000, undefined, { signal: stop.signal }).catch(() => {});
      }
    }
  };
  function reject(socket, status) {
    socket.end(
      `HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`,
    );
  }
  const upgrade = async (req, socket, head) => {
    socket.on("error", () => {});
    try {
      if (req.url !== notificationSocketPath)
        return reject(socket, "404 Not Found");
      if (!origins.has(req.headers.origin))
        return reject(socket, "403 Forbidden");
      const key = req.socket.remoteAddress;
      let entry = requests.get(key);
      if (!entry || entry.until < Date.now()) {
        if (requests.size >= 10000)
          return reject(socket, "429 Too Many Requests");
        entry = { count: 0, until: Date.now() + 60000 };
        requests.set(key, entry);
      }
      if (++entry.count > 120 || wss.clients.size >= 3000)
        return reject(socket, "429 Too Many Requests");
      if (closed || !ready) return reject(socket, "503 Service Unavailable");
      const user = await authenticatedUser(db, req);
      if (!user) return reject(socket, "401 Unauthorized");
      if (!crmRoles.includes(user.role)) return reject(socket, "403 Forbidden");
      if (
        [...wss.clients].filter((item) => item.userId === user.id).length >= 10
      )
        return reject(socket, "429 Too Many Requests");
      if (socket.destroyed || closed || !ready)
        return reject(socket, "503 Service Unavailable");
      wss.handleUpgrade(req, socket, head, (client) => {
        client.userId = user.id;
        client.request = req;
        client.alive = true;
        client.on("error", () => {});
        client.on("pong", () => {
          client.alive = true;
        });
        // This channel is server-to-client only; subscriptions cannot be supplied
        // by the browser. All mutations retain the HTTP API's CSRF validation.
        client.on("message", () => client.close(1008, "Read-only channel"));
        send(client, "notifications:ready");
      });
    } catch {
      reject(socket, "503 Service Unavailable");
    }
  };
  server.on("upgrade", upgrade);
  let checking = false;
  const heartbeat = setInterval(async () => {
    if (checking || closed) return;
    checking = true;
    try {
      for (const [key, entry] of requests)
        if (entry.until < Date.now()) requests.delete(key);
      await Promise.all(
        [...wss.clients].map(async (socket) => {
          try {
            if (!socket.alive) return socket.terminate();
            if (!(await authorize(socket))) return;
            socket.alive = false;
            socket.ping();
          } catch {
            socket.close(1012, "Session check unavailable");
          }
        }),
      );
    } finally {
      checking = false;
    }
  }, heartbeatMs);
  heartbeat.unref();
  // Keep the REST API available during a stream interruption; sockets retry.
  try {
    await openStream();
  } catch {
    ready = false;
    await stream?.close().catch(() => {});
  }
  const consuming = consume();
  return {
    async close() {
      closed = true;
      ready = false;
      stop.abort();
      clearInterval(heartbeat);
      server.off("upgrade", upgrade);
      for (const socket of wss.clients) socket.terminate();
      await stream?.close().catch(() => {});
      await consuming;
      await new Promise((resolve) => wss.close(resolve));
    },
  };
}
