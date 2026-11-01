import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./tailwind.css";
import "./styles.css";
import "./cinematic.css";
import "./intelligence.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing app root");
const app = (
  <React.StrictMode>
    <App path={window.location.pathname} />
  </React.StrictMode>
);
const path = window.location.pathname.replace(/\/$/, "") || "/";
if (root.querySelector("main") && root.dataset.pagePath === path)
  hydrateRoot(root, app);
else createRoot(root).render(app);
