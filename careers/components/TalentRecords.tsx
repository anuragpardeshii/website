"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Icon,
  Loading,
  Notice,
  PageHeading,
  date,
  useData,
} from "@sleektech/ui";
import { RoleForm } from "./RoleForm";
export type TalentSelection = { type: "jobs" | "applications"; id: string };
export function TalentRecord({
  title,
  subtitle,
  fallback,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  fallback: "jobs" | "candidates";
  actions?: ReactNode;
  children: ReactNode;
}) {
  const params = useSearchParams();
  let back = "/manage?view=" + fallback;
  const from = params.get("from");
  if (from?.startsWith("/manage")) {
    try {
      const url = new URL(from, "https://careers.invalid");
      if (
        url.origin === "https://careers.invalid" &&
        url.pathname === "/manage"
      )
        back = url.pathname + url.search;
    } catch {
      /* Use the known directory when a return link is invalid. */
    }
  }
  const view =
    new URL(back, "https://careers.invalid").searchParams.get("view") ||
    "overview";
  const label: Record<string, string> = {
    overview: "hiring overview",
    jobs: "role management",
    candidates: "candidates",
    decisions: "hiring outcomes",
    interviews: "interview schedule",
  };
  return (
    <section className="talent-record">
      <Link className="talent-record-back" href={back}>
        <Icon name="back" size={15} />
        Back to {label[view] || "hiring overview"}
      </Link>
      <PageHeading
        eyebrow="SLEEKTECH / TALENT"
        title={title}
        description={subtitle}
      >
        {actions}
      </PageHeading>
      <div className="talent-record-content">{children}</div>
    </section>
  );
}
export function JobRecord({ id }: { id: string }) {
  const { data: job, error, reload } = useData("/talent/jobs/" + id);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <TalentRecord
      title={job?.title || "Role details"}
      subtitle={
        job ? job.department + " · " + job.location : "Recruitment requisition"
      }
      fallback="jobs"
      actions={
        job &&
        !editing && (
          <Button
            icon="edit"
            onClick={() => {
              setNotice("");
              setEditing(true);
            }}
          >
            Edit role
          </Button>
        )
      }
    >
      <Notice error>{error}</Notice>
      <Notice>{notice}</Notice>
      {!job ? (
        error ? (
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        ) : (
          <Loading />
        )
      ) : editing ? (
        <RoleForm
          job={job}
          onCancel={() => setEditing(false)}
          onSaved={async () => {
            await reload();
            setEditing(false);
            setNotice("Role updated.");
          }}
        />
      ) : (
        <>
          <div className="talent-record-status">
            <Badge>{job.status}</Badge>
            <span>{job.applicants} applications received</span>
          </div>
          <dl className="talent-facts">
            {[
              ["Department", job.department],
              ["Location", job.location],
              ["Employment type", job.employment_type],
              ["Working arrangement", job.work_mode],
              ["Compensation", job.salary || "Not specified"],
              ["Created", date(job.created_at)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section className="talent-description">
            <h2>About the role</h2>
            <p>{job.description}</p>
          </section>
          <section className="talent-description">
            <h2>What you will bring</h2>
            <p>{job.requirements}</p>
          </section>
          <div className="form-actions">
            <Link
              className="button secondary"
              href={
                "/manage?" +
                new URLSearchParams({
                  view: "candidates",
                  role: id,
                  layout: "List",
                })
              }
            >
              View applications
            </Link>
            {job.status === "Published" && (
              <Link className="button secondary" href={"/jobs/" + job.slug}>
                Public listing
              </Link>
            )}
          </div>
        </>
      )}
    </TalentRecord>
  );
}
