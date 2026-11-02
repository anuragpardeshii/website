"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  PageHeading,
  Icon,
  Empty,
  Badge,
  date,
  money,
  type Row,
} from "@sleektech/ui";

export function RecordPage({
  title,
  subtitle,
  backHref,
  backLabel,
  eyebrow = "RELATIONSHIP WORKSPACE",
  aside,
  actions,
  discussion,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
  eyebrow?: string;
  aside?: ReactNode;
  actions?: ReactNode;
  discussion?: ReactNode;
  children: ReactNode;
}) {
  const parts = backHref.split("?")[0].split("/").filter(Boolean);
  const directoryNames: Record<string, string> = {
    leads: "leads",
    customers: "customers",
    projects: "projects",
    communications: "communications",
    tasks: "tasks",
    users: "users",
    notifications: "notifications",
    pipeline: "pipeline",
  };
  const recordNames: Record<string, string> = {
    leads: "opportunity",
    customers: "customer",
    projects: "project",
    tasks: "task",
    users: "user",
    communications: "message",
  };
  const returnLabel =
    backLabel ||
    "Back to " +
      (parts.length > 1
        ? parts[2] === "brief"
          ? "client brief"
          : recordNames[parts[0]] || "workspace"
        : directoryNames[parts[0]] || "overview");
  return (
    <section className="record-page">
      <Link href={backHref} className="record-back">
        <Icon name="back" size={15} />
        {returnLabel}
      </Link>
      <PageHeading eyebrow={eyebrow} title={title} description={subtitle}>
        {actions}
      </PageHeading>
      <div className={"record-layout" + (aside ? " has-aside" : "")}>
        <div className="record-main">
          <div className="record-content">{children}</div>
          {discussion}
        </div>
        {aside && <aside className="record-aside">{aside}</aside>}
      </div>
    </section>
  );
}
export function MissingRecord({ backHref }: { backHref: string }) {
  return (
    <RecordPage
      title="Record unavailable"
      subtitle="This record may have been removed or the link may be incorrect."
      backHref={backHref}
    >
      <Empty title="We couldn’t find this record" icon="search">
        Return to the directory to choose another record.
      </Empty>
    </RecordPage>
  );
}
export function CustomerPage({
  customer,
  leads,
  projects,
  backHref,
  href,
}: {
  customer: Row;
  leads: Row[];
  projects: Row[];
  backHref: string;
  href: (path: string) => string;
}) {
  const lead = leads.find((l) => l.id === customer.lead_id);
  const delivery = projects.filter((p) => p.client_id === customer.id);
  const active = delivery.filter((p) => p.status !== "Completed");
  return (
    <RecordPage
      title={customer.company}
      subtitle="Customer profile, commercial context and delivery commitments."
      backHref={backHref}
      eyebrow="CUSTOMER RELATIONSHIP"
      aside={
        <>
          <p className="eyebrow">ACCOUNT CONTEXT</p>
          <dl className="record-facts">
            <div>
              <dt>Contract value</dt>
              <dd>{money(customer.value)}</dd>
            </div>
            <div>
              <dt>Customer since</dt>
              <dd>{date(customer.created_at)}</dd>
            </div>
            <div>
              <dt>Relationship owner</dt>
              <dd>{lead?.owner || "Unassigned"}</dd>
            </div>
            <div>
              <dt>Active projects</dt>
              <dd>
                {active.length} of {delivery.length}
              </dd>
            </div>
          </dl>
          <div className="record-links">
            {lead && (
              <>
                <Link href={href(`/leads/${lead.id}/brief`)}>
                  Client brief <Icon name="right" size={14} />
                </Link>
                <Link href={href(`/leads/${lead.id}`)}>
                  Original opportunity <Icon name="right" size={14} />
                </Link>
                <Link
                  href={`/communications?lead=${encodeURIComponent(lead.id)}`}
                >
                  Communication history <Icon name="right" size={14} />
                </Link>
              </>
            )}
          </div>
        </>
      }
    >
      <div className="record-section-heading">
        <div>
          <p className="eyebrow">PRIMARY CONTACT</p>
          <h2>{customer.name}</h2>
        </div>
        <Badge tone="green">Customer</Badge>
      </div>
      <dl className="record-facts horizontal">
        <div>
          <dt>Email address</dt>
          <dd>
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{lead?.phone || "Not provided"}</dd>
        </div>
      </dl>
      {lead?.next_action && (
        <div className="record-next">
          <span className="eyebrow">NEXT ACTION</span>
          <p>{lead.next_action}</p>
        </div>
      )}
      <div className="record-section-heading section-space">
        <div>
          <p className="eyebrow">DELIVERY PORTFOLIO</p>
          <h2>Customer projects</h2>
        </div>
        <Link
          className="button secondary"
          href={href(`/projects/new?client=${customer.id}`)}
        >
          <Icon name="plus" size={14} />
          New project
        </Link>
      </div>
      {delivery.length ? (
        <div className="record-related">
          {delivery.map((project) => (
            <Link key={project.id} href={href(`/projects/${project.id}`)}>
              <div>
                <h3>{project.name}</h3>
                <small>
                  {project.owner || "Unassigned"} · Due {date(project.due_date)}
                </small>
              </div>
              <Badge>{project.status}</Badge>
              <span>{project.progress}%</span>
              <Icon name="right" size={16} />
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="Ready for the first delivery" icon="projects">
          Create a project to connect delivery to this customer.
        </Empty>
      )}
    </RecordPage>
  );
}
