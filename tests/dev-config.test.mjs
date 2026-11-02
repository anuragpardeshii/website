import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { developmentConfig } from "../scripts/dev-config.mjs";
const listen = (port = 0) =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
const close = (server) => new Promise((resolve) => server.close(resolve));
test("occupied preferred ports move to available distinct ports and every app URL is synchronized", async () => {
  const blockers = await Promise.all(Array.from({ length: 4 }, () => listen()));
  let config;
  try {
    const [api, crm, careers, website] = blockers.map(
      (server) => server.address().port,
    );
    config = await developmentConfig({
      API_PORT: api,
      CRM_PORT: crm,
      CAREERS_PORT: careers,
      WEBSITE_PORT: website,
    });
    for (const key of ["backend", "crm", "careers", "website"]) {
      assert.ok(config.ports[key] > config.preferredPorts[key]);
      await assert.rejects(listen(config.ports[key]), { code: "EADDRINUSE" });
    }
    assert.equal(new Set(Object.values(config.ports)).size, 4);
    assert.equal(config.env.CRM_ORIGIN, config.urls.crm);
    assert.equal(config.env.NEXT_PUBLIC_CRM_URL, config.urls.crm);
    assert.equal(config.env.TALENT_ORIGIN, config.urls.careers);
    assert.equal(config.env.NEXT_PUBLIC_TALENT_URL, config.urls.careers);
    assert.equal(config.env.VITE_CAREERS_PORTAL_URL, config.urls.careers);
    assert.equal(config.env.MARKETING_ORIGIN, config.urls.website);
    assert.equal(config.env.NEXT_PUBLIC_MARKETING_URL, config.urls.website);
    assert.equal(config.env.API_URL, config.urls.backend);
    await config.release();
    // Release is idempotent and makes all chosen ports reusable.
    const reusable = await Promise.all(
      Object.values(config.ports).map((port) => listen(port)),
    );
    await Promise.all(reusable.map(close));
  } finally {
    await config?.release();
    await Promise.all(blockers.map(close));
  }
});
test("duplicate preferences do not assign the same port to two applications", async () => {
  const holder = await listen();
  const port = holder.address().port;
  await close(holder);
  const config = await developmentConfig({
    API_PORT: port,
    CRM_PORT: port,
    CAREERS_PORT: port,
    WEBSITE_PORT: port,
  });
  try {
    assert.equal(new Set(Object.values(config.ports)).size, 4);
  } finally {
    await config.release();
  }
});
test("invalid development ports fail before any child process is started", async () => {
  for (const value of ["bad", "-1", "99999", "3001.2", "80"])
    await assert.rejects(
      developmentConfig({ CRM_PORT: value }),
      /Invalid development port/,
    );
});
