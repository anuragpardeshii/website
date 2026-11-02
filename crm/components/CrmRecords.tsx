"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Field,
  Notice,
  api,
  money,
  useAction,
  useData,
  type Row,
} from "@sleektech/ui";
import { RecordPage } from "./RecordPage";
import { Discussion } from "./Collaboration";
import {
  Description,
  Facts,
  ReferencePicker,
  LoadState,
  fullDate,
  timestamp,
} from "./crm-ui";
import { useCrmNavigation } from "./crm-navigation";
import { DiscoveryBrief } from "./DiscoveryBrief";
const labels: Record<string, string> = {
  leads: "opportunity",
  customers: "customer",
  projects: "project",
  tasks: "task",
};
const taskStatuses = [
  "To do",
  "In progress",
  "Blocked",
  "Completed",
  "Cancelled",
];
const projectStatuses = [
  "Discovery",
  "In progress",
  "In review",
  "Completed",
  "On hold",
];
function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function RecordEditor({
  type,
  record,
  context,
  user,
  onSave,
  onCancel,
  busy,
  error,
}: {
  type: string;
  record: Row;
  context: Row;
  user: Row;
  onSave: (body: Row) => void;
  onCancel: () => void;
  busy: boolean;
  error: string;
}) {
  const [owner, setOwner] = useState<Row | null>(
    record.owner_id ? { id: record.owner_id, name: record.owner } : null,
  );
  const [customer, setCustomer] = useState<Row | null>(
    context.customer || null,
  );
  useEffect(() => {
    if (context.customer) setCustomer(context.customer);
  }, [context.customer?.id]);
  const creating = !record.id;
  return (
    <form
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        const body: Row = { ...values };
        if (type === "leads" || type === "customers")
          body.value = Number(body.value || 0);
        if (type === "leads") {
          body.whatsapp_consent = body.whatsapp_consent === "on";
          if (record.stage === "Won") delete body.stage;
        }
        if (type === "projects") {
          body.progress = Number(body.progress || 0);
          body.due_date = body.due_date || null;
          if (creating) {
            if (!customer) {
              return;
            }
            body.client_id = customer.id;
          }
        }
        if (type === "tasks") {
          body.owner_id = owner?.id || null;
          body.due_date = body.due_date || null;
        }
        if (!creating) body.expected_version = record.version || 1;
        onSave(body);
      }}
    >
      <Notice error>{error}</Notice>
      <div className="form-grid">
        {(type === "leads" || type === "customers") && (
          <>
            <Field
              label="Contact name"
              name="name"
              minLength={2}
              maxLength={100}
              required
              defaultValue={record.name}
            />
            <Field
              label="Company"
              name="company"
              minLength={2}
              maxLength={160}
              required
              defaultValue={record.company}
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              maxLength={254}
              required
              defaultValue={record.email}
            />
            <Field
              label="Phone"
              name="phone"
              maxLength={24}
              placeholder="+919876543210"
              hint="Include the international country code."
              defaultValue={record.phone}
            />
            <Field
              label={
                type === "leads" ? "Deal value (INR)" : "Contract value (INR)"
              }
              name="value"
              type="number"
              min={0}
              max={1e12}
              step="0.01"
              defaultValue={record.value || 0}
            />
          </>
        )}
        {type === "leads" && (
          <>
            <Field label="Pipeline stage">
              <select
                name="stage"
                defaultValue={record.stage || "New"}
                disabled={record.stage === "Won"}
              >
                {[
                  "New",
                  "Qualified",
                  "Proposal",
                  "Negotiation",
                  "Lost",
                  ...(record.stage === "Won" ? ["Won"] : []),
                ].map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </Field>
            <Field label="Lead source">
              <select name="source" defaultValue={record.source || "Direct"}>
                {[
                  "Direct",
                  "Website",
                  "Referral",
                  "Partner",
                  "LinkedIn",
                  "Event",
                  "Other",
                ].map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Relationship owner"
              name="owner"
              maxLength={100}
              defaultValue={record.owner || user.name}
            />
            <Field
              label="Next action"
              wide
              name="next_action"
              maxLength={300}
              defaultValue={record.next_action}
            />
            <Field label="Relationship notes" wide>
              <textarea
                name="notes"
                rows={5}
                maxLength={6000}
                defaultValue={record.notes}
              />
            </Field>
            <label className="checkbox-field wide">
              <input
                type="checkbox"
                name="whatsapp_consent"
                defaultChecked={record.whatsapp_consent}
              />
              This contact has opted in to WhatsApp business messages.
            </label>
          </>
        )}
        {type === "customers" && (
          <Field label="Customer description" wide>
            <textarea
              name="description"
              rows={6}
              maxLength={10000}
              defaultValue={record.description}
            />
          </Field>
        )}
        {type === "projects" && (
          <>
            {creating && (
              <ReferencePicker
                label="Customer"
                kind="customers"
                value={customer}
                onChange={setCustomer}
                required
              />
            )}
            <Field
              label="Project name"
              name="name"
              minLength={3}
              maxLength={160}
              required
              defaultValue={record.name}
            />
            <Field
              label="Delivery owner"
              name="owner"
              maxLength={100}
              defaultValue={record.owner || user.name}
            />
            <Field
              label="Target delivery"
              name="due_date"
              type="date"
              defaultValue={record.due_date || ""}
            />
            <Field label="Delivery status">
              <select name="status" defaultValue={record.status || "Discovery"}>
                {projectStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Progress (%)"
              name="progress"
              type="number"
              min={0}
              max={100}
              step={1}
              required
              defaultValue={record.progress || 0}
            />
            <Field label="Project description" wide>
              <textarea
                name="description"
                rows={6}
                maxLength={10000}
                defaultValue={record.description}
              />
            </Field>
            <Field label="Remarks" wide>
              <textarea
                name="remarks"
                rows={3}
                maxLength={6000}
                defaultValue={record.remarks}
              />
            </Field>
          </>
        )}
        {type === "tasks" && (
          <>
            <Field
              label="Task title"
              name="title"
              minLength={3}
              maxLength={200}
              required
              wide
              defaultValue={record.title}
            />
            <Field label="Description" wide>
              <textarea
                name="description"
                rows={6}
                maxLength={10000}
                defaultValue={record.description}
              />
            </Field>
            <ReferencePicker
              label="Task owner"
              value={owner}
              onChange={setOwner}
            />
            <Field label="Status">
              <select name="status" defaultValue={record.status || "To do"}>
                {taskStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Deadline"
              name="due_date"
              type="date"
              defaultValue={record.due_date || ""}
            />
            <Field
              label="Assigned date"
              name="assigned_date"
              type="date"
              required
              defaultValue={record.assigned_date || localDate()}
            />
            <Field label="Priority">
              <select
                name="priority"
                defaultValue={record.priority || "Normal"}
              >
                {["Low", "Normal", "High", "Urgent"].map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </Field>
            <Field label="Remarks" wide>
              <textarea
                name="remarks"
                rows={4}
                maxLength={6000}
                defaultValue={record.remarks}
              />
            </Field>
          </>
        )}
      </div>
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={busy || (type === "projects" && creating && !customer)}
        >
          {busy
            ? "Saving…"
            : creating
              ? "Create " + labels[type]
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
export function RecordScreen({ type, user }: { type: string; user: Row }) {
  const { id, params, backHref, href, router, isBrief } = useCrmNavigation();
  const creating = id === "new";
  const { data, error, reload } = useData(
    creating ? null : `/crm/${type}/${id}`,
  );
  const selectedCustomer = useData(
    creating && type === "projects" && params.get("client")
      ? "/crm/customers/" + params.get("client")
      : null,
  );
  const [editing, setEditing] = useState(false);
  const action = useAction();
  const record: Row = data?.record || {};
  const title = creating
    ? "Create " + labels[type]
    : record.company || record.title || record.name || "Record details";
  if (!creating && !data) return <LoadState error={error} retry={reload} />;
  if (isBrief && data)
    return (
      <DiscoveryBrief
        lead={record}
        backHref={backHref}
        onUpdated={reload}
        onCommunications={() =>
          router.push(`/communications?lead=${record.id}`)
        }
      />
    );
  async function save(body: Row) {
    const result = await action.run(
      () =>
        api(`/crm/${type}${creating ? "" : "/" + id}`, {
          method: creating ? "POST" : "PATCH",
          body,
        }),
      "Changes saved.",
    );
    if (result) {
      if (creating)
        router.replace(
          `/${type}/${result.id}?${new URLSearchParams({ from: backHref })}`,
        );
      else {
        await reload();
        setEditing(false);
      }
    }
  }
  const aside = !creating && (
    <>
      <p className="eyebrow">
        {type === "tasks" ? "TASK OVERVIEW" : "RECORD OVERVIEW"}
      </p>
      {record.stage || record.status ? (
        <Badge>{record.stage || record.status}</Badge>
      ) : (
        <Badge tone="green">Customer</Badge>
      )}
      <Facts
        items={
          [
            [
              type === "tasks" ? "Assigned date" : "Created",
              fullDate(
                type === "tasks" ? record.assigned_date : record.created_at,
              ),
            ],
            ["Last updated", timestamp(record.updated_at)],
            ...(type === "tasks"
              ? [
                  ["Priority", record.priority],
                  ["Owner", record.owner || "Unassigned"],
                ]
              : []),
          ] as [string, any][]
        }
      />
      <div className="record-links">
        {type === "leads" && (
          <>
            <Link href={href(`/leads/${id}/brief`)}>Client brief</Link>
            <Link href={`/communications?lead=${id}`}>
              Communication history
            </Link>
            {data?.customer && (
              <Link href={href(`/customers/${data.customer.id}`)}>
                Customer profile
              </Link>
            )}
          </>
        )}
        {type === "customers" && (
          <>
            <Link href={href(`/leads/${record.lead_id}/brief`)}>
              Client brief
            </Link>
            <Link href={href(`/leads/${record.lead_id}`)}>
              Original opportunity
            </Link>
            <Link href={`/communications?lead=${record.lead_id}`}>
              Communication history
            </Link>
          </>
        )}
        {type === "projects" && (
          <Link href={href(`/customers/${record.client_id}`)}>
            Customer profile
          </Link>
        )}
      </div>
    </>
  );
  return (
    <>
      <RecordPage
        title={title}
        subtitle={
          creating
            ? "Add the details your team needs to move forward."
            : type === "tasks"
              ? "Ownership, commitments and the complete activity history."
              : type === "leads"
                ? `${record.name} · ${record.email}`
                : type === "projects"
                  ? data?.customer?.company
                  : "Customer relationship"
        }
        backHref={backHref}
        eyebrow={
          editing
            ? "EDIT " + labels[type].toUpperCase()
            : "SLEEKTECH / " + labels[type].toUpperCase()
        }
        aside={aside}
        discussion={
          !creating && !editing ? (
            <Discussion key={id + ":" + record.version} type={type} id={id!} />
          ) : undefined
        }
        actions={
          !creating &&
          !editing &&
          data?.can_edit && (
            <Button
              icon="edit"
              onClick={() => {
                action.setError("");
                action.setNotice("");
                setEditing(true);
              }}
            >
              Edit {labels[type]}
            </Button>
          )
        }
      >
        <Notice>{action.notice}</Notice>
        <Notice error>{!editing ? action.error : ""}</Notice>
        {creating || editing ? (
          <RecordEditor
            key={id + ":" + record.version}
            type={type}
            record={record}
            context={{
              ...data,
              customer: creating
                ? selectedCustomer.data?.record
                : data?.customer,
            }}
            user={user}
            busy={action.busy}
            error={action.error}
            onCancel={() => {
              action.setError("");
              creating ? router.push(backHref) : setEditing(false);
            }}
            onSave={save}
          />
        ) : (
          <>
            {(type === "leads" || type === "customers") && (
              <>
                <Facts
                  items={
                    [
                      ["Primary contact", record.name],
                      ["Company", record.company],
                      [
                        "Email",
                        <a href={"mailto:" + record.email}>{record.email}</a>,
                      ],
                      ["Phone", record.phone],
                      [
                        type === "leads" ? "Potential value" : "Contract value",
                        money(record.value),
                      ],
                      ...(type === "leads"
                        ? [
                            ["Owner", record.owner],
                            ["Source", record.source],
                            [
                              "WhatsApp consent",
                              record.whatsapp_consent
                                ? "Opted in"
                                : "Not recorded",
                            ],
                          ]
                        : []),
                    ] as [string, any][]
                  }
                />
                <Description
                  label={
                    type === "leads"
                      ? "Relationship notes"
                      : "About this customer"
                  }
                >
                  {type === "leads" ? record.notes : record.description}
                </Description>
                {type === "leads" && (
                  <>
                    <Description label="Next action">
                      {record.next_action}
                    </Description>
                    {!["Won", "Lost"].includes(record.stage) && (
                      <div className="form-actions">
                        <Button
                          disabled={action.busy}
                          onClick={async () => {
                            const customer = await action.run(() =>
                              api(`/crm/leads/${id}/convert`, {
                                method: "POST",
                                body: { expected_version: record.version || 1 },
                              }),
                            );
                            if (customer)
                              router.push(href(`/customers/${customer.id}`));
                          }}
                        >
                          Convert to customer
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {type === "customers" && (
              <section className="record-description">
                <div className="record-section-heading">
                  <h2>Delivery portfolio</h2>
                  <Link
                    className="button secondary"
                    href={href(`/projects/new?client=${id}`)}
                  >
                    New project
                  </Link>
                </div>
                <div className="record-related">
                  {data?.projects?.map((project: Row) => (
                    <Link
                      key={project.id}
                      href={href(`/projects/${project.id}`)}
                    >
                      <div>
                        <h3>{project.name}</h3>
                        <small>Due {fullDate(project.due_date)}</small>
                      </div>
                      <Badge>{project.status}</Badge>
                      <span>{project.progress}%</span>
                    </Link>
                  ))}
                </div>
                <Link className="text-button" href={`/projects?client=${id}`}>
                  View all {data?.project_count || 0} projects
                </Link>
              </section>
            )}
            {type === "projects" && (
              <>
                <Facts
                  items={[
                    ["Customer", data?.customer?.company],
                    ["Delivery owner", record.owner],
                    ["Target delivery", fullDate(record.due_date)],
                    ["Progress", record.progress + "%"],
                  ]}
                />
                <div className="progress-track">
                  <span style={{ width: record.progress + "%" }} />
                </div>
                <Description label="Project overview">
                  {record.description}
                </Description>
                <Description label="Remarks">{record.remarks}</Description>
              </>
            )}
            {type === "tasks" && (
              <>
                <Facts
                  items={[
                    ["Owner", record.owner || "Unassigned"],
                    ["Deadline", fullDate(record.due_date)],
                    ["Status", <Badge>{record.status}</Badge>],
                    ["Priority", record.priority],
                    ["Assigned date", fullDate(record.assigned_date)],
                    ["Last updated", timestamp(record.updated_at)],
                  ]}
                />
                <Description label="Description">
                  {record.description}
                </Description>
                <Description label="Remarks">{record.remarks}</Description>
              </>
            )}
          </>
        )}
      </RecordPage>
    </>
  );
}
