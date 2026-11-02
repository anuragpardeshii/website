"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const sections: Record<string, string> = {
  overview: "/",
  pipeline: "/pipeline",
  leads: "/leads",
  clients: "/customers",
  projects: "/projects",
  tasks: "/tasks",
  messages: "/communications",
  settings: "/integrations",
  users: "/users",
  notifications: "/notifications",
};

export function useCrmNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const segments = pathname.split("/").filter(Boolean);
  const view =
    Object.keys(sections).find(
      (key) => sections[key] === "/" + (segments[0] || ""),
    ) || "overview";
  const currentURL = pathname + (params.size ? "?" + params.toString() : "");
  const fallback = sections[view];
  let backHref = fallback;
  // Only allow return links within known CRM routes, never arbitrary destinations.
  const from = params.get("from");
  if (from?.startsWith("/") && !from.startsWith("//")) {
    try {
      const url = new URL(from, "https://crm.invalid");
      if (
        url.origin === "https://crm.invalid" &&
        /^\/(?:pipeline|leads|customers|projects|tasks|communications|integrations|users|notifications)?(?:\/[a-zA-Z0-9-]+)*(?:\/brief)?$/.test(
          url.pathname,
        )
      ) {
        backHref = url.pathname + url.search;
      }
    } catch {
      /* Invalid return links fall back to the record directory. */
    }
  }
  const href = (path: string) =>
    path +
    (path.includes("?") ? "&" : "?") +
    new URLSearchParams({ from: currentURL });
  const filter = (name: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    value ? next.set(name, value) : next.delete(name);
    if (name !== "page") next.delete("page");
    window.history.replaceState(
      null,
      "",
      pathname + (next.size ? "?" + next : ""),
    );
  };
  return {
    router,
    pathname,
    params,
    view,
    id: segments[1],
    isBrief: segments[2] === "brief",
    backHref,
    href,
    filter,
  };
}
