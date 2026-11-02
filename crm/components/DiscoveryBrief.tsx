"use client";
import { useEffect, useState } from "react";
import { RecordPage } from "./RecordPage";
import { Discussion } from "./Collaboration";
import { Description, Pagination } from "./crm-ui";
import {
  api,
  Badge,
  Button,
  Field,
  Loading,
  Notice,
  date,
  useAction,
  useData,
  type Row,
} from "@sleektech/ui";

const questions = [
  ["objectives", "Business objectives", "What needs to change? Why now?"],
  [
    "scope",
    "Scope & priorities",
    "Key deliverables, must-haves, and what is out of scope.",
  ],
  [
    "audience",
    "Users & stakeholders",
    "Who will use the solution? What do they need?",
  ],
  [
    "current_process",
    "Current operating model",
    "Existing tools, manual work, and pain points.",
  ],
  [
    "integrations",
    "Systems & integrations",
    "Platforms, data sources, and access requirements.",
  ],
  [
    "success_metrics",
    "Success measures",
    "Business outcomes and acceptance criteria.",
  ],
  [
    "timeline",
    "Delivery timeline",
    "Target launch, dependencies, and milestones.",
  ],
  ["budget", "Investment range", "Budget expectations and approval process."],
  [
    "stakeholders",
    "Decision-making & ownership",
    "Sponsors, approvers, and the working team.",
  ],
];
export function DiscoveryBrief({
  lead,
  backHref,
  onUpdated,
  onCommunications,
}: {
  lead: Row;
  backHref: string;
  onUpdated: () => Promise<any>;
  onCommunications: () => void;
}) {
  const path = `/crm/leads/${lead.id}/discovery`;
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const { data, error, reload } = useData(path + "?page=" + page);
  const [draft, setDraft] = useState<Row | null>(null);
  const [invitation, setInvitation] = useState<Row | null>(null);
  const [emailReady, setEmailReady] = useState(false);
  const action = useAction();
  useEffect(() => {
    if (data && !draft) setDraft(data.draft);
  }, [data, draft]);
  async function save() {
    const result = await api(path, {
      method: "PATCH",
      body: {
        revision: draft!.revision,
        answers: draft!.answers,
        internal_notes: draft!.internal_notes,
      },
    });
    setDraft(result.draft);
    await onUpdated();
    return result.draft;
  }
  return (
    <>
      <RecordPage
        title="Client brief"
        subtitle={`${lead.company} · ${lead.name}`}
        backHref={backHref}
        eyebrow="DISCOVERY & SCOPE"
        actions={
          !editing &&
          draft && (
            <Button
              onClick={() => {
                action.setError("");
                setEditing(true);
              }}
            >
              Edit brief
            </Button>
          )
        }
      >
        <div className="discovery-contact">
          <span>{lead.email}</span>
          {lead.phone && <span>{lead.phone}</span>}
          <Badge>{lead.source}</Badge>
        </div>
        <Notice error>{error || action.error}</Notice>
        <Notice>{action.notice}</Notice>
        {!draft ? (
          <>
            <Loading />
            {error && <Button onClick={reload}>Try again</Button>}
          </>
        ) : (
          <>
            <div className="discovery-steps">
              <span>Connect</span>
              <span>Capture the brief</span>
              <span>Share for review</span>
            </div>
            {!editing ? (
              <div className="brief-description">
                <p className="muted">
                  Revision {draft.revision} ·{" "}
                  {draft.updated_by_name
                    ? `Updated by ${draft.updated_by_name}`
                    : "Ready for discovery"}
                </p>
                {questions.map(([key, label]) => (
                  <Description key={key} label={label}>
                    {draft.answers[key]}
                  </Description>
                ))}
                <div className="discovery-private">
                  <Description label="Internal team notes">
                    {draft.internal_notes}
                  </Description>
                  <small>Visible only to your team.</small>
                </div>
              </div>
            ) : (
              <form
                className="form-stack"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const result = await action.run(
                    save,
                    "Discovery brief saved.",
                  );
                  if (result) {
                    setEditing(false);
                    await reload();
                  }
                }}
              >
                <div className="form-grid">
                  {questions.map(([key, label, placeholder]) => (
                    <Field
                      label={label}
                      key={key}
                      wide={["objectives", "scope"].includes(key)}
                    >
                      <textarea
                        name={key}
                        rows={3}
                        maxLength={3000}
                        placeholder={placeholder}
                        value={draft.answers[key] || ""}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            answers: {
                              ...draft.answers,
                              [key]: event.target.value,
                            },
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
                <div className="discovery-private">
                  <Field
                    label="Internal team notes"
                    hint="Only your team can see this. Never included in a client invitation."
                  >
                    <textarea
                      name="internal_notes"
                      rows={3}
                      maxLength={6000}
                      value={draft.internal_notes}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          internal_notes: event.target.value,
                        })
                      }
                      placeholder="Qualification, commercial context, and follow-up notes."
                    />
                  </Field>
                </div>
                <div className="form-actions">
                  <small>
                    Revision {draft.revision} ·{" "}
                    {draft.updated_at
                      ? `Saved ${date(draft.updated_at)}`
                      : "Not saved yet"}
                  </small>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={action.busy}
                    onClick={() => {
                      setDraft(data.draft);
                      setEditing(false);
                      action.setError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={action.busy}>
                    {action.busy ? "Working…" : "Save brief"}
                  </Button>
                </div>
              </form>
            )}
            {!editing && (
              <section className="discovery-sharing">
                <div>
                  <h3>Bring the client into the conversation.</h3>
                  <p>
                    Share the questionnaire for completion or review. Links
                    expire after seven days. Creating a new invitation replaces
                    any open invitation.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={action.busy || !draft.revision}
                  onClick={() =>
                    action.run(async () => {
                      const saved = draft;
                      const result = await api(path + "/share", {
                        method: "POST",
                        body: { revision: saved.revision },
                      });
                      setInvitation(result);
                      setEmailReady(false);
                      await reload();
                    }, "Private invitation ready. It has not been sent.")
                  }
                >
                  Create client invitation
                </Button>
                {invitation && (
                  <div className="form-stack">
                    <Field
                      label="Private client invitation"
                      hint={`Valid until ${date(invitation.expires_at)}. Only share with the intended client.`}
                      readOnly
                      value={invitation.url}
                      onFocus={(event: any) => event.target.select()}
                    />
                    <div className="form-actions">
                      <Button
                        variant="secondary"
                        disabled={action.busy}
                        onClick={() =>
                          action.run(async () => {
                            if (!navigator.clipboard)
                              throw new Error(
                                "Select and copy the invitation link above.",
                              );
                            await navigator.clipboard.writeText(invitation.url);
                          }, "Invitation link copied.")
                        }
                      >
                        Copy link
                      </Button>
                      <Button
                        disabled={action.busy || emailReady}
                        onClick={() =>
                          action.run(async () => {
                            await api("/messages/draft", {
                              method: "POST",
                              body: {
                                lead_id: lead.id,
                                channel: "email",
                                subject: `Your project discovery brief · ${lead.company}`,
                                body: `Hi ${lead.name},\n\nLet’s shape your project together. Please review the discovery questionnaire and add any details we discussed:\n\n${invitation.url}\n\nThis private invitation expires on ${date(invitation.expires_at)}. Please keep it within your project team.\n\nBest,\nThe Sleektech team`,
                              },
                            });
                            setEmailReady(true);
                          }, "Email draft prepared. Review and send it from Communications.")
                        }
                      >
                        {emailReady
                          ? "Email draft ready"
                          : "Prepare email draft"}
                      </Button>
                    </div>
                    {emailReady && (
                      <Button variant="secondary" onClick={onCommunications}>
                        Open communications
                      </Button>
                    )}
                  </div>
                )}
                {!draft.revision && (
                  <p>
                    Edit and save your brief before creating a client
                    invitation.
                  </p>
                )}
              </section>
            )}
            {(data?.invitations || []).length > 0 && (
              <section className="discovery-history">
                <h3>Invitations & client responses</h3>
                {data.invitations.map((link: Row) => (
                  <article key={link.id}>
                    <div className="discovery-history-row">
                      <span>
                        Brief revision {link.revision}
                        <small>Created {date(link.created_at)}</small>
                      </span>
                      <Badge>
                        {link.submitted_at
                          ? "Response received"
                          : link.revoked_at
                            ? "Revoked"
                            : new Date(link.expires_at) < new Date()
                              ? "Expired"
                              : "Awaiting response"}
                      </Badge>
                      {!link.revoked_at &&
                        new Date(link.expires_at) > new Date() && (
                          <Button
                            variant="secondary"
                            disabled={action.busy}
                            onClick={() =>
                              action.run(async () => {
                                await api(path + "/revoke", {
                                  method: "POST",
                                  body: { invitation_id: link.id },
                                });
                                if (invitation?.id === link.id)
                                  setInvitation(null);
                                await reload();
                              }, "Invitation revoked.")
                            }
                          >
                            Revoke link
                          </Button>
                        )}
                    </div>
                    {link.submission && (
                      <details>
                        <summary>
                          View response from {link.submission.name}
                        </summary>
                        <dl>
                          {questions.map(([key, label]) => (
                            <div key={key}>
                              <dt>{label}</dt>
                              <dd>
                                {link.submission.answers[key] || "Not provided"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setDraft({
                              ...draft,
                              answers: link.submission.answers,
                            });
                            setEditing(true);
                            action.setNotice(
                              "Client answers copied into your working brief. Save to keep them.",
                            );
                          }}
                        >
                          Use answers in working brief
                        </Button>
                      </details>
                    )}
                  </article>
                ))}
                <Pagination pagination={data.pagination} onPage={setPage} />
              </section>
            )}
          </>
        )}
      </RecordPage>
      {!editing && <Discussion type="briefs" id={lead.id} />}
    </>
  );
}
