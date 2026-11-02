import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./tailwind.css";
import "./styles.css";
import "./redesign.css";

const root = document.getElementById("root");
const app = (
  <React.StrictMode>
    <App path={window.location.pathname} />
  </React.StrictMode>
);
const path = window.location.pathname.replace(/\/$/, "") || "/";
if (root.querySelector("main") && root.dataset.pagePath === path)
  hydrateRoot(root, app);
else createRoot(root).render(app);
