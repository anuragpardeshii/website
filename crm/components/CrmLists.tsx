"use client";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Empty,
  Panel,
  Stats,
  Activity,
  Icon,
  money,
  useData,
  type Row,
} from "@sleektech/ui";
import {
  Pagination,
  DebouncedSearch,
  LoadState,
  fullDate,
  timestamp,
} from "./crm-ui";
import { useCrmNavigation } from "./crm-navigation";
export function Overview() {
  const { data, error, reload } = useData("/crm/overview");
  if (!data) return <LoadState error={error} retry={reload} />;
  const stats = data.stats;
  return (
    <>
      <Stats
        items={[
          {
            label: "Open pipeline",
            value: money(stats.pipeline),
            detail: stats.open_leads + " opportunities",
            icon: "pipeline",
            href: "/pipeline",
          },
          {
            label: "Customers",
            value: stats.customers,
            detail: "Established partnerships",
            icon: "clients",
            href: "/customers",
          },
          {
            label: "Active projects",
            value: stats.active_projects,
            detail: "Delivery commitments",
            icon: "projects",
            href: "/projects",
          },
          {
            label: "Open tasks",
            value: stats.open_tasks,
            detail: "Owned, prioritized and tracked",
            icon: "tasks",
            href: "/tasks",
          },
        ]}
      />
      <div className="grid-2 grid-equal">
        <Panel
          title="Recent opportunities"
          action={
            <Link className="text-button" href="/leads">
              All leads
            </Link>
          }
        >
          <div className="overview-records">
            {data.leads.map((lead: Row) => (
              <Link href={"/leads/" + lead.id} key={lead.id}>
                <Avatar name={lead.company} />
                <div>
                  <b>{lead.company}</b>
                  <small>{lead.name}</small>
                </div>
                <Badge>{lead.stage}</Badge>
              </Link>
            ))}
            {!data.leads.length && (
              <Empty title="Your next partnership starts here">
                Create a lead to begin.
              </Empty>
            )}
          </div>
        </Panel>
        <Panel
          title="Tasks & follow-ups"
          action={
            <Link className="text-button" href="/tasks">
              All tasks
            </Link>
          }
        >
          <div className="overview-records">
            {data.tasks.map((task: Row) => (
              <Link href={"/tasks/" + task.id} key={task.id}>
                <Icon name="tasks" />
                <div>
                  <b>{task.title}</b>
                  <small>
                    {task.owner || "Unassigned"} · Due {fullDate(task.due_date)}
                  </small>
                </div>
                <Badge>{task.priority}</Badge>
              </Link>
            ))}
            {!data.tasks.length && (
              <Empty title="A clear task list">Add your next commitment.</Empty>
            )}
          </div>
        </Panel>
      </div>
      <div className="grid-2 grid-equal section-space">
        <Panel title="Workspace activity">
          <Activity items={data.activity} />
        </Panel>
        <Panel title="Delivery in motion">
          <div className="overview-records">
            {data.projects.map((project: Row) => (
              <Link href={"/projects/" + project.id} key={project.id}>
                <div>
                  <b>{project.name}</b>
                  <small>
                    {project.company} · {project.progress}% complete
                  </small>
                </div>
                <Badge>{project.status}</Badge>
              </Link>
            ))}
            {!data.projects.length && (
              <Empty title="Room for your next project">
                Start a project from a customer profile.
              </Empty>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
export function Directory({ type }: { type: string }) {
  const { params, filter, href } = useCrmNavigation();
  const query = new URLSearchParams();
  for (const key of [
    "page",
    "q",
    "stage",
    "status",
    "priority",
    "owner",
    "client",
  ])
    if (params.get(key)) query.set(key, params.get(key)!);
  query.set("limit", "20");
  const { data, error, reload } = useData(`/crm/${type}?${query}`);
  const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
  const items: Row[] = data?.items || [];
  return (
    <Panel
      title={
        (
          {
            leads: "Opportunity directory",
            customers: "Customer directory",
            projects: "Delivery portfolio",
            tasks: "Tasks & follow-ups",
          } as Record<string, string>
        )[type]
      }
      action={<small>{data?.pagination?.total || 0} records</small>}
    >
      <div className="toolbar">
        <DebouncedSearch
          value={params.get("q") || ""}
          onChange={(value) => filter("q", value)}
          placeholder={
            type === "tasks"
              ? "Search task titles…"
              : type === "projects"
                ? "Search project names…"
                : type === "customers"
                  ? "Search customers…"
                  : "Search names, companies or emails…"
          }
        />
        {type === "leads" && (
          <select
            aria-label="Filter leads by stage"
            value={params.get("stage") || ""}
            onChange={(event) => filter("stage", event.target.value)}
          >
            <option value="">All stages</option>
            {stages.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        )}
        {type === "tasks" && (
          <div className="directory-filters">
            <select
              aria-label="Filter tasks by status"
              value={params.get("status") || ""}
              onChange={(event) => filter("status", event.target.value)}
            >
              <option value="">All statuses</option>
              {[
                "To do",
                "In progress",
                "Blocked",
                "Completed",
                "Cancelled",
              ].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select
              aria-label="Filter tasks by priority"
              value={params.get("priority") || ""}
              onChange={(event) => filter("priority", event.target.value)}
            >
              <option value="">All priorities</option>
              {["Low", "Normal", "High", "Urgent"].map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
            <select
              aria-label="Task ownership"
              value={params.get("owner") || ""}
              onChange={(event) => filter("owner", event.target.value)}
            >
              <option value="">Everyone</option>
              <option value="me">Assigned to me</option>
            </select>
          </div>
        )}
      </div>
      {params.get("client") && (
        <div className="record-filter">
          <span>Projects for the selected customer</span>
          <button className="text-button" onClick={() => filter("client", "")}>
            Show all projects
          </button>
        </div>
      )}
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : !items.length ? (
        <Empty title="No matching records" icon="search">
          Adjust your filters or create a record.
        </Empty>
      ) : type === "projects" ? (
        <div className="project-grid directory-projects">
          {items.map((project) => (
            <Link
              className="project-card"
              href={href("/projects/" + project.id)}
              key={project.id}
            >
              <div className="project-card-top">
                <Avatar name={project.company} />
                <Badge>{project.status}</Badge>
              </div>
              <p className="eyebrow">{project.company}</p>
              <h3>{project.name}</h3>
              <p>{project.owner || "Unassigned"}</p>
              <div className="progress-label">
                <span>Delivery progress</span>
                <b>{project.progress}%</b>
              </div>
              <div className="progress-track">
                <span style={{ width: project.progress + "%" }} />
              </div>
              <footer>
                Due {fullDate(project.due_date)}
                <Icon name="right" size={14} />
              </footer>
            </Link>
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {(type === "tasks"
                  ? [
                      "Task",
                      "Owner",
                      "Deadline",
                      "Status",
                      "Priority",
                      "Assigned date",
                      "Last updated",
                      "Remarks",
                    ]
                  : type === "leads"
                    ? [
                        "Contact / company",
                        "Stage",
                        "Deal value",
                        "Next action",
                        "Owner",
                        "Client brief",
                      ]
                    : [
                        "Customer",
                        "Primary contact",
                        "Contract value",
                        "Customer since",
                      ]
                ).map((label) => (
                  <th key={label}>{label}</th>
                ))}
                <th scope="col" className="table-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {type === "tasks" ? (
                    <>
                      <td>
                        <Link
                          className="record-title-link"
                          href={href("/tasks/" + item.id)}
                        >
                          <b>{item.title}</b>
                        </Link>
                        <small className="table-description">
                          {item.description?.slice(0, 100) ||
                            "No description added"}
                        </small>
                      </td>
                      <td>{item.owner || "Unassigned"}</td>
                      <td>{fullDate(item.due_date)}</td>
                      <td>
                        <Badge>{item.status}</Badge>
                      </td>
                      <td>
                        <Badge>{item.priority}</Badge>
                      </td>
                      <td>{fullDate(item.assigned_date)}</td>
                      <td>{timestamp(item.updated_at)}</td>
                      <td className="table-description">
                        {item.remarks?.slice(0, 100) || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <Link
                          className="cell-button"
                          href={href(`/${type}/${item.id}`)}
                        >
                          <Avatar name={item.company} />
                          <div>
                            <b>{item.company}</b>
                            {type === "leads" && (
                              <small>
                                {item.name} · {item.source}
                              </small>
                            )}
                          </div>
                        </Link>
                      </td>
                      {type === "leads" ? (
                        <>
                          <td>
                            <Badge>{item.stage}</Badge>
                          </td>
                          <td>{money(item.value)}</td>
                          <td>{item.next_action || "Not set"}</td>
                          <td>{item.owner || "Unassigned"}</td>
                          <td>
                            <Link
                              className="text-button"
                              href={href(`/leads/${item.id}/brief`)}
                            >
                              Open brief
                            </Link>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <b>{item.name}</b>
                            <small>{item.email}</small>
                          </td>
                          <td>{money(item.value)}</td>
                          <td>{fullDate(item.created_at)}</td>
                        </>
                      )}
                    </>
                  )}
                  <td className="table-actions">
                    <Link
                      className="table-view"
                      prefetch={false}
                      href={href(`/${type}/${item.id}`)}
                      aria-label={`View ${item.title || item.company || item.name}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        pagination={data?.pagination}
        onPage={(page) => filter("page", String(page))}
      />
    </Panel>
  );
}
