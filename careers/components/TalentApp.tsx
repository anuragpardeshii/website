"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TalentRecord, JobRecord, type TalentSelection } from "./TalentRecords";
import { RoleForm } from "./RoleForm";
import {
  AuthGate,
  Shell,
  PageHeading,
  Stats,
  Panel,
  Button,
  Icon,
  Badge,
  Avatar,
  SearchBox,
  Dialog,
  Field,
  Notice,
  Empty,
  Activity,
  Loading,
  api,
  date,
  values,
  useData,
  useAction,
  type Row,
} from "@sleektech/ui";
const nav = [
  { id: "overview", label: "Hiring overview", icon: "overview" },
  { id: "jobs", label: "Open roles", icon: "projects" },
  { id: "candidates", label: "Candidate pipeline", icon: "clients" },
  { id: "interviews", label: "Interview schedule", icon: "calendar" },
  { id: "decisions", label: "Offers & decisions", icon: "file" },
];
const stages = ["Applied", "Screening", "Interview", "Offer", "Hired"];
export default function TalentApp({
  record,
}: { record?: TalentSelection } = {}) {
  return (
    <Suspense fallback={<Loading />}>
      <AuthGate allowedRoles={["admin", "recruiter"]}>
        {(user, demo, logout) => (
          <Workspace user={user} demo={demo} logout={logout} record={record} />
        )}
      </AuthGate>
    </Suspense>
  );
}
function Workspace({ user, demo, logout, record }: any) {
  const router = useRouter();
  const params = useSearchParams();
  const requestedView = params.get("view") || "overview";
  const view = record
    ? record.type === "jobs"
      ? "jobs"
      : "candidates"
    : nav.some((n) => n.id === requestedView)
      ? requestedView
      : "overview";
  const { data, error, reload } = useData(record ? null : "/talent/overview");
  const action = useAction();
  const query = params.get("q") || "";
  const filter = params.get("role") || "All roles";
  const layout = params.get("layout") === "List" ? "List" : "Board";
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(window.location.search);
    value ? next.set(key, value) : next.delete(key);
    window.history.replaceState(
      null,
      "",
      "/manage" + (next.size ? "?" + next : ""),
    );
  };
  const setQuery = (value: string) => updateFilter("q", value);
  const setFilter = (value: string) =>
    updateFilter("role", value === "All roles" ? "" : value);
  const setLayout = (value: string) => updateFilter("layout", value);
  const recordHref = (type: string, id: string) =>
    `/manage/${type}/${id}?` +
    new URLSearchParams({
      from: "/manage" + (params.size ? "?" + params.toString() : ""),
    });
  const [job, setJob] = useState<Row | null>(null);
  const jobs: Row[] = data?.jobs || [];
  const apps: Row[] = data?.applications || [];
  const interviews: Row[] = data?.interviews || [];
  const active = apps.filter(
    (a) => !["Rejected", "Withdrawn", "Hired"].includes(a.stage),
  );
  const filtered = apps.filter(
    (a) =>
      (filter === "All roles" || a.job_id === filter) &&
      [a.name, a.email, a.title, a.profile.skills]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const go = (v: string) => {
    router.push("/manage" + (v === "overview" ? "" : "?view=" + v));
  };
  const candidateTable = (items: Row[]) =>
    items.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Applied for</th>
              <th>Stage</th>
              <th>Experience</th>
              <th>Applied</th>
              <th scope="col" className="table-actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((a, i) => (
              <tr key={a.id}>
                <td>
                  <Link
                    className="cell-button"
                    href={recordHref("applications", a.id)}
                  >
                    <Avatar name={a.name} tone={i % 2 ? "green" : ""} />
                    <div>
                      <b>{a.name}</b>
                      <small>{a.profile.headline || a.email}</small>
                    </div>
                  </Link>
                </td>
                <td>{a.title}</td>
                <td>
                  <Badge>{a.stage}</Badge>
                </td>
                <td>{a.profile.experience || "Not provided"}</td>
                <td>{date(a.created_at)}</td>
                <td className="table-actions">
                  <Link
                    className="table-view"
                    prefetch={false}
                    href={recordHref("applications", a.id)}
                    aria-label={`View ${a.name} application`}
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
      <Empty title="The next chapter starts here" icon="clients">
        Applications to your published roles will appear here.
      </Empty>
    );
  function interviewRows(items: Row[]) {
    return items.length ? (
      <div className="calendar-list">
        {items.map((i) => (
          <article className="interview-card" key={i.id}>
            <div className="interview-date">
              {date(i.starts_at, { day: undefined, month: "short" })}
              <b>{new Date(i.starts_at).getDate()}</b>
            </div>
            <div>
              <h3>{i.title}</h3>
              <p>
                {i.profile.name} · {i.role}
              </p>
              <p>
                {date(i.starts_at, { hour: "numeric", minute: "2-digit" })} ·{" "}
                {i.duration} min · {i.interviewer}
              </p>
              {i.location && <p>{i.location}</p>}
            </div>
            <button
              className="icon-button"
              aria-label={"Review " + i.profile.name}
              onClick={() =>
                router.push(recordHref("applications", i.application_id))
              }
            >
              <Icon name="arrow" size={16} />
            </button>
          </article>
        ))}
      </div>
    ) : (
      <Empty title="Room for a great conversation" icon="calendar">
        Schedule interviews from a candidate application.
      </Empty>
    );
  }
  return (
    <Shell
      product="Talent"
      user={user}
      demo={demo}
      items={nav.map((n) => ({
        ...n,
        ...(n.id === "candidates" && !record ? { count: active.length } : {}),
      }))}
      view={view}
      onView={go}
      onLogout={() => action.run(logout)}
    >
      {record ? (
        record.type === "jobs" ? (
          <JobRecord key={record.id} id={record.id} />
        ) : (
          <CandidateReview key={record.id} id={record.id} />
        )
      ) : !data ? (
        <>
          <Notice error>{error}</Notice>
          <Loading />
          {error && <Button onClick={reload}>Try again</Button>}
        </>
      ) : (
        <>
          <PageHeading
            eyebrow="PEOPLE, WITH POSSIBILITY"
            title={
              (
                {
                  overview: "A thoughtful approach to talent.",
                  jobs: "Make room for exceptional people.",
                  candidates: "Every candidate. A clear next step.",
                  interviews: "Conversations that count.",
                  decisions: "Considered decisions. Shared evidence.",
                } as Row
              )[view]
            }
            description={
              (
                {
                  overview:
                    "Bring clarity to every role, conversation and hiring decision.",
                  jobs: "Define the opportunity. Publish it once. Connect with the right people.",
                  candidates:
                    "A consistent selection process, with people at the center.",
                  interviews:
                    "Keep interviews, context and candidate details in one place.",
                  decisions:
                    "Review your offers and outcomes with a complete application history.",
                } as Row
              )[view]
            }
          >
            <a href="/" className="button secondary">
              <Icon name="globe" size={15} />
              View careers
            </a>
            <Button
              icon="plus"
              onClick={() => {
                action.setError("");
                setJob({});
              }}
            >
              Create role
            </Button>
          </PageHeading>
          <Notice error>{action.error || error}</Notice>
          <Notice>{action.notice}</Notice>
          {view === "overview" && (
            <>
              <Stats
                items={[
                  {
                    label: "Published roles",
                    value: jobs
                      .filter((j) => j.status === "Published")
                      .length.toString()
                      .padStart(2, "0"),
                    detail:
                      jobs.filter((j) => j.status === "Draft").length +
                      " roles in preparation",
                    icon: "projects",
                  },
                  {
                    label: "Active candidates",
                    value: active.length.toString().padStart(2, "0"),
                    detail: "Across your open hiring pipeline",
                    icon: "clients",
                  },
                  {
                    label: "Upcoming interviews",
                    value: interviews
                      .filter((i) => new Date(i.starts_at) > new Date())
                      .length.toString()
                      .padStart(2, "0"),
                    detail: "Scheduled conversations",
                    icon: "calendar",
                  },
                  {
                    label: "Offers in progress",
                    value: apps
                      .filter((a) => a.stage === "Offer")
                      .length.toString()
                      .padStart(2, "0"),
                    detail:
                      apps.filter((a) => a.stage === "Hired").length +
                      " candidates hired",
                    icon: "file",
                  },
                ]}
              />
              <div className="grid-2">
                <Panel
                  title="Hiring pipeline"
                  eyebrow="FROM POSSIBILITY TO PARTNERSHIP"
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("candidates")}
                    >
                      View candidates <Icon name="arrow" size={13} />
                    </button>
                  }
                >
                  <div className="pipeline-chart">
                    {stages.slice(0, 4).map((s) => {
                      const count = apps.filter((a) => a.stage === s).length;
                      return (
                        <div className="chart-column" key={s}>
                          <strong>
                            {count} {count === 1 ? "candidate" : "candidates"}
                          </strong>
                          <div
                            className="chart-bar"
                            style={{
                              height: Math.max(
                                4,
                                (count /
                                  Math.max(
                                    1,
                                    ...stages.map(
                                      (v) =>
                                        apps.filter((a) => a.stage === v)
                                          .length,
                                    ),
                                  )) *
                                  140,
                              ),
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-labels">
                    {stages.slice(0, 4).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <div className="chart-foot">
                    <span>People, not just a pipeline</span>
                    <b>{apps.length} applications received</b>
                  </div>
                </Panel>
                <Panel
                  title="Next conversations"
                  eyebrow="THE INTERVIEW CALENDAR"
                  action={
                    <button
                      className="text-button"
                      onClick={() => go("interviews")}
                    >
                      View all <Icon name="arrow" size={13} />
                    </button>
                  }
                >
                  {interviewRows(
                    interviews
                      .filter((i) => new Date(i.starts_at) > new Date())
                      .slice(0, 2),
                  )}
                </Panel>
              </div>
              <Panel
                title="Candidates in focus"
                action={
                  <button
                    className="text-button"
                    onClick={() => go("candidates")}
                  >
                    All candidates <Icon name="arrow" size={13} />
                  </button>
                }
              >
                {candidateTable(active.slice(0, 5))}
              </Panel>
              <div className="grid-2 grid-equal section-space">
                <Panel title="Recruitment activity">
                  <Activity items={data.activity} />
                </Panel>
                <Panel title="A consistent way to evaluate">
                  <div className="panel-body">
                    <div className="integration-icon">
                      <Icon name="file" size={23} />
                    </div>
                    <h3>Evidence before instinct.</h3>
                    <p className="prose" style={{ margin: "12px 0 20px" }}>
                      Use a shared rubric for craft, communication and
                      problem-solving. Record specific evidence, then make a
                      considered hiring decision.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => go("candidates")}
                    >
                      Review your candidates <Icon name="arrow" size={13} />
                    </button>
                  </div>
                </Panel>
              </div>
            </>
          )}
          {view === "jobs" && (
            <Panel
              title="Role management"
              action={<small>{jobs.length} requisitions</small>}
            >
              <div className="toolbar">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search roles…"
                />
                <small>Published roles appear on your careers page</small>
              </div>
              {jobs.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Location</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th scope="col" className="table-actions">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs
                        .filter((j) =>
                          [j.title, j.department]
                            .join(" ")
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .map((j) => (
                          <tr key={j.id}>
                            <td>
                              <Link
                                className="cell-button"
                                href={recordHref("jobs", j.id)}
                              >
                                <Avatar name={j.department} />
                                <div>
                                  <b>{j.title}</b>
                                  <small>
                                    {j.employment_type} · {j.work_mode}
                                  </small>
                                </div>
                              </Link>
                            </td>
                            <td>{j.department}</td>
                            <td>{j.location}</td>
                            <td>
                              <button
                                className="text-button"
                                onClick={() => {
                                  router.push(
                                    "/manage?" +
                                      new URLSearchParams({
                                        view: "candidates",
                                        role: j.id,
                                        layout: "List",
                                      }),
                                  );
                                }}
                              >
                                {j.applicants} candidates
                              </button>
                            </td>
                            <td>
                              <Badge>{j.status}</Badge>
                            </td>
                            <td className="table-actions">
                              <Link
                                className="table-view"
                                prefetch={false}
                                href={recordHref("jobs", j.id)}
                                aria-label={`View ${j.title}`}
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
                <Empty title="Define your next opportunity" icon="projects">
                  Create a role and publish it when you are ready to receive
                  applications.
                </Empty>
              )}
            </Panel>
          )}
          {view === "candidates" && (
            <>
              <div
                className="toolbar"
                style={{
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  marginBottom: 20,
                }}
              >
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search candidates or skills…"
                />
                <select
                  aria-label="Filter by role"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All roles</option>
                  {jobs.map((j) => (
                    <option value={j.id} key={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <div className="tabs">
                  {["Board", "List"].map((l) => (
                    <button
                      className={layout === l ? "active" : ""}
                      onClick={() => setLayout(l)}
                      key={l}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {layout === "List" ? (
                <Panel title="Candidate directory">
                  {candidateTable(filtered)}
                </Panel>
              ) : (
                <div
                  className="board"
                  style={{ gridTemplateColumns: "repeat(5,minmax(220px,1fr))" }}
                >
                  {stages.map((s) => (
                    <section className="board-column" key={s}>
                      <div className="board-head">
                        <b>{s}</b>
                        <span>
                          {filtered.filter((a) => a.stage === s).length}
                        </span>
                      </div>
                      {filtered
                        .filter((a) => a.stage === s)
                        .map((a, i) => (
                          <button
                            className="deal-card"
                            key={a.id}
                            onClick={() =>
                              router.push(recordHref("applications", a.id))
                            }
                          >
                            <div className="deal-card-top">
                              <Avatar
                                name={a.name}
                                tone={i % 2 ? "green" : ""}
                              />
                              <div>
                                <h3>{a.name}</h3>
                                <small>
                                  {a.profile.headline || "Candidate"}
                                </small>
                              </div>
                            </div>
                            <p
                              style={{
                                fontSize: 11,
                                margin: "18px 0 12px",
                                color: "#536681",
                              }}
                            >
                              {a.title}
                            </p>
                            <p className="deal-next">
                              <Icon name="company" size={12} />
                              {a.profile.experience ||
                                "Experience not provided"}
                            </p>
                            <div className="deal-card-footer">
                              <span className="source-tag">{a.department}</span>
                              <small>{date(a.created_at)}</small>
                            </div>
                          </button>
                        ))}
                    </section>
                  ))}
                </div>
              )}
              <p className="muted" style={{ fontSize: 11, marginTop: 16 }}>
                Open a candidate to review their application, schedule an
                interview and record a decision. Rejected and withdrawn
                applications remain available in List view.
              </p>
            </>
          )}
          {view === "interviews" && (
            <Panel
              title="Interview calendar"
              action={<small>Times shown in your local timezone</small>}
            >
              {interviewRows(interviews)}
            </Panel>
          )}
          {view === "decisions" && (
            <Panel
              title="Offers & hiring outcomes"
              action={<small>Decisions made by your team</small>}
            >
              {candidateTable(
                apps.filter((a) =>
                  ["Offer", "Hired", "Rejected", "Withdrawn"].includes(a.stage),
                ),
              )}
            </Panel>
          )}
        </>
      )}
      {job && (
        <Dialog
          title={job.id ? "Edit opportunity" : "Define a new opportunity"}
          subtitle="Clear expectations make for better applications."
          wide
          onClose={() => setJob(null)}
        >
          <RoleForm
            job={job}
            onCancel={() => setJob(null)}
            onSaved={async () => {
              setJob(null);
              await reload();
            }}
          />
        </Dialog>
      )}
    </Shell>
  );
}
function CandidateReview({ id }: { id: string }) {
  const { data, error, reload } = useData("/talent/applications/" + id);
  const transitions = data?.transitions || {};
  const [tab, setTab] = useState("Application");
  const action = useAction();
  async function save(
    path: string,
    body: Row,
    method = "POST",
    message = "Saved successfully.",
  ) {
    return action.run(async () => {
      await api("/talent/applications/" + id + path, { method, body });
      await reload();
    }, message);
  }
  return (
    <TalentRecord
      title={data?.name || "Candidate application"}
      subtitle={data?.title}
      fallback="candidates"
    >
      <Notice error>{error || action.error}</Notice>
      <Notice>{action.notice}</Notice>
      {!data ? (
        error ? (
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        ) : (
          <Loading />
        )
      ) : (
        <>
          <div className="candidate-detail-top">
            <Avatar name={data.name} />
            <div>
              <h3>{data.name}</h3>
              <p>{data.email}</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge>{data.stage}</Badge>
            </div>
          </div>
          <div className="tabs" style={{ marginBottom: 24, flexWrap: "wrap" }}>
            {["Application", "Interviews", "Scorecards", "Decision"].map(
              (t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => {
                    setTab(t);
                    action.setError("");
                    action.setNotice("");
                  }}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          {tab === "Application" && (
            <>
              <div className="info-grid">
                {[
                  ["Location", data.profile.location],
                  ["Experience", data.profile.experience],
                  ["Availability", data.profile.availability],
                  ["Phone", data.profile.phone],
                ].map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <p>{value || "Not provided"}</p>
                  </div>
                ))}
              </div>
              {[
                ["Profile", data.profile.summary],
                ["Skills", data.profile.skills],
                ["Education", data.profile.education],
                ["Introduction", data.cover_letter],
              ].map(
                ([title, value]) =>
                  value && (
                    <div key={title} style={{ marginBottom: 22 }}>
                      <h3 style={{ marginBottom: 8 }}>{title}</h3>
                      <p className="prose">{value}</p>
                    </div>
                  ),
              )}
              <div className="form-actions">
                {data.resume_id && (
                  <a
                    className="button secondary"
                    href={"/api/resumes/" + data.resume_id}
                    download
                  >
                    <Icon name="file" size={16} />
                    Download résumé
                  </a>
                )}
                {["linkedin", "portfolio"].map(
                  (key) =>
                    /^https?:\/\//.test(data.profile[key] || "") && (
                      <a
                        key={key}
                        className="button secondary"
                        href={data.profile[key]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {key === "linkedin" ? "LinkedIn" : "Portfolio"}
                        <Icon name="arrow" size={14} />
                      </a>
                    ),
                )}
              </div>
            </>
          )}
          {tab === "Interviews" && (
            <>
              <div className="stack">
                {data.interviews.map((i: Row) => (
                  <div className="callout" key={i.id}>
                    <b>{i.title}</b>
                    <p>
                      {date(i.starts_at, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {i.duration} min · {i.interviewer}
                    </p>
                    <p>{i.location}</p>
                  </div>
                ))}
              </div>
              {!["Hired", "Rejected", "Withdrawn"].includes(data.stage) && (
                <form
                  className="form-grid section-space"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = values(e.currentTarget);
                    save(
                      "/interviews",
                      {
                        ...v,
                        starts_at: new Date(String(v.starts_at)).toISOString(),
                        duration: Number(v.duration),
                      },
                      "POST",
                      "Interview scheduled. It is now visible in the candidate portal.",
                    );
                  }}
                >
                  <Field
                    label="Conversation title"
                    name="title"
                    required
                    minLength={3}
                    defaultValue="Role conversation"
                  />
                  <Field
                    label="Interviewer / panel"
                    name="interviewer"
                    required
                    minLength={2}
                  />
                  <Field
                    label="Date & time (your timezone)"
                    name="starts_at"
                    type="datetime-local"
                    required
                  />
                  <Field
                    label="Duration (minutes)"
                    type="number"
                    min="15"
                    max="240"
                    name="duration"
                    defaultValue={45}
                    required
                  />
                  <Field
                    label="Meeting link or location"
                    name="location"
                    wide
                    placeholder="Add a meeting URL or location"
                  />
                  <div className="wide">
                    <Button
                      type="submit"
                      disabled={action.busy}
                      icon="calendar"
                    >
                      Schedule interview
                    </Button>
                    <p className="muted" style={{ fontSize: 10, marginTop: 9 }}>
                      Saved to the portal. External calendar invitations are not
                      sent.
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
          {tab === "Scorecards" && (
            <>
              <div className="callout">
                Evaluate evidence against the same rubric for every candidate.
                Scores support your discussion; they do not automate hiring
                decisions.
              </div>
              {data.scorecards.map((s: Row) => (
                <div className="score-row" key={s.id}>
                  <div>
                    <b>{s.reviewer}</b>
                    <Badge>{s.recommendation}</Badge>
                  </div>
                  <div className="candidate-scores">
                    <span>Craft {s.craft}/5</span>
                    <span>Communication {s.communication}/5</span>
                    <span>Problem-solving {s.problem_solving}/5</span>
                  </div>
                  <p>{s.evidence}</p>
                </div>
              ))}
              <form
                className="form-grid section-space"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = values(e.currentTarget);
                  save(
                    "/scorecards",
                    {
                      ...v,
                      craft: Number(v.craft),
                      communication: Number(v.communication),
                      problem_solving: Number(v.problem_solving),
                    },
                    "POST",
                    "Scorecard recorded.",
                  );
                }}
              >
                {[
                  ["craft", "Craft & role expertise"],
                  ["communication", "Communication"],
                  ["problem_solving", "Problem-solving"],
                ].map(([key, label]) => (
                  <Field label={label} key={key}>
                    <select name={key} defaultValue="3">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <option value={v} key={v}>
                          {v} / 5 ·{" "}
                          {
                            [
                              "Limited evidence",
                              "Developing",
                              "Meets expectations",
                              "Strong",
                              "Exceptional",
                            ][v - 1]
                          }
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
                <Field label="Recommendation">
                  <select name="recommendation">
                    <option>Further review</option>
                    <option>Strong yes</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Evidence & observations" wide>
                  <textarea
                    name="evidence"
                    minLength={20}
                    maxLength={6000}
                    required
                    rows={4}
                    placeholder="Reference specific examples from the interview. What did the candidate demonstrate?"
                  />
                </Field>
                <div className="wide">
                  <Button type="submit" disabled={action.busy}>
                    Submit scorecard
                  </Button>
                </div>
              </form>
            </>
          )}
          {tab === "Decision" && (
            <>
              <h3>Selection history</h3>
              <div className="timeline section-space">
                {data.timeline.map((event: Row) => (
                  <div key={event.id}>
                    <b>{event.stage}</b>
                    <small>
                      {date(event.created_at, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </small>
                    {event.note && <p>{event.note}</p>}
                  </div>
                ))}
              </div>
              {transitions[data.stage]?.length > 0 ? (
                <form
                  className="form-stack"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save(
                      "/stage",
                      values(e.currentTarget),
                      "PATCH",
                      "Selection stage updated.",
                    );
                  }}
                >
                  <Field label="Next stage">
                    <select key={data.stage} name="stage">
                      {transitions[data.stage].map((s: string) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Decision rationale"
                    hint="Internal team note. Candidates see their stage and timeline."
                  >
                    <textarea
                      name="note"
                      minLength={5}
                      maxLength={2000}
                      required
                      rows={3}
                    />
                  </Field>
                  <Button type="submit" disabled={action.busy}>
                    Record decision
                  </Button>
                </form>
              ) : (
                <div className="callout">
                  This application is closed. The history and supporting
                  scorecards remain available for review.
                </div>
              )}
            </>
          )}
        </>
      )}
    </TalentRecord>
  );
}
