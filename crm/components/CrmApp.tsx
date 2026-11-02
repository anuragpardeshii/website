"use client";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import {
  AuthGate,
  Shell,
  PageHeading,
  Loading,
  Empty,
  useAction,
  type Row,
} from "@sleektech/ui";
import { useCrmNavigation, sections } from "./crm-navigation";
import { PipelineBoard } from "./PipelineBoard";
import { Overview, Directory } from "./CrmLists";
import { RecordScreen } from "./CrmRecords";
import { CrmMessages } from "./CrmMessages";
import { Integrations } from "./Integrations";
import { NotificationBell, NotificationsPage } from "./Collaboration";
import { NotificationProvider } from "./NotificationProvider";
import { UserAdmin } from "./UserAdmin";
const nav = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "pipeline", label: "Sales pipeline", icon: "pipeline" },
  { id: "leads", label: "All leads", icon: "users" },
  { id: "clients", label: "Customers", icon: "clients" },
  { id: "projects", label: "Active projects", icon: "projects" },
  { id: "tasks", label: "Tasks & follow-ups", icon: "tasks" },
  { id: "messages", label: "Communications", icon: "messages" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "settings", label: "Integrations", icon: "settings" },
];
const headings: Record<string, [string, string]> = {
  overview: ["Overview", "Your pipeline, customers and delivery at a glance."],
  pipeline: [
    "Sales pipeline",
    "Drag an opportunity to change its stage. Won creates a customer.",
  ],
  leads: ["Leads", "Manage contacts and the next steps toward a partnership."],
  clients: ["Customers", "Account context, relationships and delivery."],
  projects: ["Projects", "Keep delivery, ownership and milestones on track."],
  tasks: ["Tasks & follow-ups", "Priorities, owners and upcoming commitments."],
  messages: [
    "Communications",
    "Conversations, outreach and delivery tracking.",
  ],
  users: ["Users & access", "Manage roles and account recovery."],
  notifications: [
    "Notifications",
    "Mentions and assignments that need your attention.",
  ],
  settings: ["Integrations", "Connect the tools your team works with."],
};
export default function CrmApp() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthGate allowedRoles={["admin", "sales"]}>
        {(user, demo, logout) => (
          <NotificationProvider key={user.id}>
            <Workspace user={user} demo={demo} logout={logout} />
          </NotificationProvider>
        )}
      </AuthGate>
    </Suspense>
  );
}
function Workspace({
  user,
  demo,
  logout,
}: {
  user: Row;
  demo: boolean;
  logout: () => Promise<void>;
}) {
  const { view, id, pathname, params, router, href } = useCrmNavigation();
  const action = useAction();
  useEffect(() => {
    const legacy = params.get("view");
    if (pathname === "/" && legacy && sections[legacy])
      router.replace(sections[legacy]);
  }, [pathname, params, router]);
  const items = [
    ...nav,
    ...(user.role === "super_admin"
      ? [{ id: "users", label: "Users & access", icon: "users" }]
      : []),
  ].map((item) => ({ ...item, href: sections[item.id] }));
  const type = view === "clients" ? "customers" : view;
  return (
    <Shell
      product="CRM"
      user={user}
      demo={demo}
      items={items}
      view={view}
      onView={(next: string) => router.push(sections[next] || "/")}
      onLogout={() => action.run(logout)}
      topbarActions={<NotificationBell />}
    >
      {!id && (
        <PageHeading
          eyebrow="SLEEKTECH / WORKSPACE"
          title={headings[view]?.[0]}
          description={headings[view]?.[1]}
        >
          {["overview", "leads", "pipeline"].includes(view) && (
            <Link className="button" href={href("/leads/new")}>
              New lead
            </Link>
          )}
          {view === "projects" && (
            <Link className="button" href={href("/projects/new")}>
              New project
            </Link>
          )}
          {view === "tasks" && (
            <Link className="button" href={href("/tasks/new")}>
              Add task
            </Link>
          )}
        </PageHeading>
      )}
      {view === "overview" && <Overview />}
      {["leads", "clients", "projects", "tasks"].includes(view) &&
        (id ? (
          <RecordScreen key={pathname} type={type} user={user} />
        ) : (
          <Directory type={type} />
        ))}
      {view === "pipeline" && <PipelineBoard />}
      {view === "messages" && <CrmMessages key={pathname} demo={demo} />}
      {view === "settings" && <Integrations />}
      {view === "notifications" && <NotificationsPage />}
      {view === "users" &&
        (user.role === "super_admin" ? (
          <UserAdmin key={pathname} currentUser={user} />
        ) : (
          <Empty title="Super admin access required">
            Contact your super admin to manage account access.
          </Empty>
        ))}
    </Shell>
  );
}
