"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Notice,
  Empty,
  Icon,
  Panel,
  api,
  useAction,
  useData,
  type Row,
} from "@sleektech/ui";
import { RecordPage } from "./RecordPage";
import { Discussion } from "./Collaboration";
import {
  ReferencePicker,
  Description,
  Facts,
  LoadState,
  DebouncedSearch,
  Pagination,
  fullDate,
  timestamp,
} from "./crm-ui";
import { useCrmNavigation } from "./crm-navigation";
export function CrmMessages({ demo }: { demo: boolean }) {
  const { id, params, backHref, href, router, filter } = useCrmNavigation();
  const creating = id === "new";
  const [editing, setEditing] = useState(false);
  const query = new URLSearchParams();
  for (const key of ["page", "q", "channel", "lead"])
    if (params.get(key)) query.set(key, params.get(key)!);
  const { data, error, reload } = useData(
    creating
      ? "/messages/config"
      : id
        ? `/messages/${id}?page=${params.get("page") || 1}`
        : "/messages?" + query,
  );
  const contact = useData(
    creating && params.get("lead") ? "/crm/leads/" + params.get("lead") : null,
  );
  if (id) {
    if (!data || (creating && params.get("lead") && !contact.data))
      return (
        <LoadState
          error={error || contact.error}
          retry={() => {
            reload();
            contact.reload();
          }}
        />
      );
    const message: Row = data.message || {
      lead_id: contact.data?.record?.id,
      ...(contact.data
        ? {
            name: contact.data.record.name,
            company: contact.data.record.company,
            email: contact.data.record.email,
          }
        : {}),
    };
    if (creating || editing)
      return (
        <Composer
          initial={message}
          config={data.integrations}
          demo={demo}
          backHref={backHref}
          onCancel={() =>
            creating ? router.push(backHref) : setEditing(false)
          }
          onSaved={async (savedId: string) => {
            if (creating)
              router.replace(
                `/communications/${savedId}?${new URLSearchParams({ from: backHref })}`,
              );
            else {
              await reload();
              setEditing(false);
            }
          }}
        />
      );
    return (
      <>
        <RecordPage
          title={message.subject || "WhatsApp conversation"}
          subtitle={message.company + " · " + message.name}
          backHref={backHref}
          eyebrow="COMMUNICATION RECORD"
          actions={
            message.status === "Draft" && (
              <Button onClick={() => setEditing(true)}>Edit draft</Button>
            )
          }
          aside={
            <>
              <Badge>{message.status}</Badge>
              <Facts
                items={[
                  [
                    "Channel",
                    message.channel === "email" ? "Email" : "WhatsApp Business",
                  ],
                  ["Recipient", message.email],
                  ["Created", timestamp(message.created_at)],
                  ["Last updated", timestamp(message.updated_at)],
                ]}
              />
              <div className="record-links">
                <Link href={href("/leads/" + message.lead_id)}>
                  View relationship
                </Link>
              </div>
            </>
          }
        >
          <Description label="Message">{message.body}</Description>
          <section className="record-description">
            <h2>Delivery timeline</h2>
            {data.events.length ? (
              <div className="timeline section-space">
                {data.events.map((event: Row) => (
                  <div key={event.id}>
                    {event.event}
                    <small>{timestamp(event.created_at)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>
                {message.status === "Draft"
                  ? "This draft has not been sent."
                  : "No delivery events have been received yet."}
              </p>
            )}
            <Pagination
              pagination={data.event_pagination}
              onPage={(page) => filter("page", String(page))}
            />
            <small>Opens and clicks may include automated activity.</small>
          </section>
        </RecordPage>
        <Discussion type="messages" id={id} key={message.version} />
      </>
    );
  }
  return (
    <Panel
      title="Conversation history"
      action={
        <Link
          className="button"
          href={href(
            "/communications/new" +
              (params.get("lead") ? "?lead=" + params.get("lead") : ""),
          )}
        >
          <Icon name="plus" size={14} />
          Compose
        </Link>
      }
    >
      <div className="toolbar">
        <DebouncedSearch
          value={params.get("q") || ""}
          onChange={(value) => filter("q", value)}
          placeholder="Search message subjects…"
        />
        <div className="tabs">
          {["", "email", "whatsapp"].map((channel) => (
            <button
              key={channel}
              className={
                (params.get("channel") || "") === channel ? "active" : ""
              }
              aria-pressed={(params.get("channel") || "") === channel}
              onClick={() => filter("channel", channel)}
            >
              {channel === "email"
                ? "Email"
                : channel
                  ? "WhatsApp"
                  : "All channels"}
            </button>
          ))}
        </div>
      </div>
      {params.get("lead") && (
        <div className="record-filter">
          <span>Conversations for the selected relationship</span>
          <button className="text-button" onClick={() => filter("lead", "")}>
            Show all contacts
          </button>
        </div>
      )}
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <>
          {data.items.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Message</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th scope="col" className="table-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((message: Row) => (
                    <tr key={message.id}>
                      <td>
                        <Link
                          className="cell-button"
                          href={href("/communications/" + message.id)}
                        >
                          <Avatar name={message.company} />
                          <div>
                            <b>{message.company}</b>
                            <small>{message.name}</small>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link
                          className="record-title-link"
                          href={href("/communications/" + message.id)}
                        >
                          {(message.subject || message.body).slice(0, 90)}
                        </Link>
                      </td>
                      <td>
                        {message.channel === "email" ? "Email" : "WhatsApp"}
                      </td>
                      <td>
                        <Badge>{message.status}</Badge>
                      </td>
                      <td>{fullDate(message.created_at)}</td>
                      <td className="table-actions">
                        <Link
                          className="table-view"
                          prefetch={false}
                          href={href("/communications/" + message.id)}
                          aria-label={`View ${message.subject || "WhatsApp conversation"}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No matching conversations" icon="messages">
              Compose a draft or adjust your filters.
            </Empty>
          )}
          <Pagination
            pagination={data.pagination}
            onPage={(page) => filter("page", String(page))}
          />
        </>
      )}
    </Panel>
  );
}
function Composer({ initial, config, demo, backHref, onSaved, onCancel }: any) {
  const [recipient, setRecipient] = useState<Row | null>(
    initial.lead_id
      ? {
          id: initial.lead_id,
          name: initial.name,
          company: initial.company,
          email: initial.email,
        }
      : null,
  );
  const [draft, setDraft] = useState<Row>({
    lead_id: initial.lead_id,
    channel: "email",
    subject: "",
    body: "",
    template: "",
    ...initial,
  });
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [confirmed, setConfirmed] = useState(false);
  const action = useAction();
  const set = (key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setConfirmed(false);
  };
  async function save() {
    const body = {
      ...(draft.id
        ? { expected_version: draft.version }
        : { lead_id: recipient?.id, channel: draft.channel }),

      subject: draft.subject,
      body: draft.body,
      template: draft.template,
    };
    const r = await api(
      draft.id ? "/messages/" + draft.id : "/messages/draft",
      { method: draft.id ? "PATCH" : "POST", body },
    );
    setDraft({ ...draft, ...r });
    return r;
  }
  return (
    <RecordPage
      title={initial.id ? "Edit message draft" : "Compose a message"}
      subtitle="Draft, review, then send."
      backHref={backHref}
      eyebrow="COMMUNICATIONS"
    >
      <Notice error>{action.error}</Notice>
      <Notice>{action.notice}</Notice>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            const saved = await save();
            await onSaved(saved.id);
          }, "Draft saved.");
        }}
      >
        <div className="form-grid">
          {draft.id ? (
            <Facts items={[["Recipient", initial.company || initial.name]]} />
          ) : (
            <ReferencePicker
              label="Recipient"
              kind="leads"
              required
              value={recipient}
              onChange={(person) => {
                setRecipient(person);
                set("lead_id", person?.id || "");
              }}
            />
          )}
          <Field label="Channel">
            <select
              value={draft.channel}
              disabled={!!draft.id}
              onChange={(e) => set("channel", e.target.value)}
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp Business</option>
            </select>
          </Field>
        </div>
        {draft.channel === "email" && (
          <>
            <div className="callout">
              <div className="form-grid">
                <Field label="What should this email achieve?">
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    maxLength={2000}
                    placeholder="Follow up after discovery and suggest a scope review."
                    rows={2}
                  />
                </Field>
                <div className="form-stack">
                  <Field label="Tone">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      {["Professional", "Warm", "Concise"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Button
                    type="button"
                    variant="secondary"
                    icon="sparkles"
                    disabled={!config.ai || action.busy || purpose.length < 10}
                    onClick={() =>
                      action.run(async () => {
                        const r = await api("/messages/ai-draft", {
                          method: "POST",
                          body: { lead_id: draft.lead_id, purpose, tone },
                        });
                        setDraft((d) => ({
                          ...d,
                          subject: r.subject,
                          body: r.body,
                        }));
                        setConfirmed(false);
                      }, "AI draft ready for your review.")
                    }
                  >
                    {action.busy ? "Working…" : "Write with AI"}
                  </Button>
                </div>
              </div>
              {!config.ai && (
                <p style={{ marginTop: 12 }}>
                  Complete secure OpenAI setup to activate the writing
                  assistant. You can write and save a draft now.
                </p>
              )}
            </div>
            <Field
              label="Subject"
              maxLength={200}
              required
              value={draft.subject}
              onChange={(e: any) => set("subject", e.target.value)}
            />
          </>
        )}
        {draft.channel === "whatsapp" && (
          <Field
            label="Approved template name (optional)"
            maxLength={100}
            hint="Required outside the 24-hour reply window. Templates without variables only; language is configured on the server."
            value={draft.template}
            onChange={(e: any) => set("template", e.target.value)}
          />
        )}
        <Field
          label={
            draft.template ? "Internal note / template preview" : "Message"
          }
          required
        >
          <textarea
            value={draft.body}
            onChange={(e) => set("body", e.target.value)}
            rows={7}
            maxLength={10000}
            required
            placeholder="Write your message…"
          />
        </Field>
        {draft.template && (
          <div className="callout">
            Sending will use the approved template content from Meta. The text
            above is an internal reference and is not sent.
          </div>
        )}
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I have reviewed the recipient and message and approve sending it.
        </label>
        {(demo || !config[draft.channel]) && (
          <small>
            {demo
              ? "Sending is disabled in the demo workspace."
              : "Connect this channel in the backend before sending."}
          </small>
        )}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={action.busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={action.busy || !draft.body.trim() || !draft.lead_id}
          >
            Save draft
          </Button>
          <Button
            type="button"
            icon="right"
            disabled={
              action.busy ||
              !confirmed ||
              demo ||
              !config[draft.channel] ||
              !draft.body.trim()
            }
            onClick={() =>
              action.run(async () => {
                const saved = await save();
                await api("/messages/" + saved.id + "/send", {
                  method: "POST",
                  body: { confirm: true },
                });
                await onSaved(saved.id);
              })
            }
          >
            Send message
          </Button>
        </div>
      </form>
    </RecordPage>
  );
}
