import { LayoutGroup, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bot,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Database,
  FileText,
  GitBranch,
  Layers,
  LockKeyhole,
  MoreHorizontal,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useSiteMotion } from "./MotionSystem";

export const phaseAt = (time) => Math.min(3, Math.floor(time / 2800));
const visible = (condition) => (condition ? " is-visible" : "");

function Avatar({ children }) {
  return <span className="wb-avatar">{children}</span>;
}
function Status({ children, neutral = false }) {
  return (
    <span className={"wb-status" + (neutral ? " is-neutral" : "")}>
      <i />
      {children}
    </span>
  );
}
function Metric({ label, value, note }) {
  return (
    <div className="wb-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function TaskRow({ label, detail, done, active }) {
  return (
    <div
      className={
        "wb-task-row" + (done ? " is-done" : "") + (active ? " is-working" : "")
      }
    >
      <span className="wb-task-icon">{done ? <Check size={12} /> : <i />}</span>
      <span>
        {label}
        <small>{detail}</small>
      </span>
      <span>{done ? "Complete" : active ? "Running" : "Queued"}</span>
    </div>
  );
}

function AgentsDemo({ time }) {
  const phase = phaseAt(time);
  const message =
    "Hi, could you check on my order #4821? It hasn’t arrived yet.";
  const typed = message.slice(0, Math.floor(Math.max(0, time - 400) / 24));
  return (
    <div className="wb-agent-layout">
      <aside className="wb-inbox">
        <div className="wb-mini-heading">
          Team inbox <span>12</span>
        </div>
        {[
          ["DW", "Dana Whitfield", "Where is my order?", true],
          ["MO", "Marcus Ortiz", "Annual billing inquiry"],
          ["PN", "Priya Nair", "Invoice request"],
          ["TB", "Tom Becker", "Account access"],
        ].map(([initials, name, text, active]) => (
          <div
            key={name}
            className={"wb-inbox-item" + (active ? " is-current" : "")}
          >
            <Avatar>{initials}</Avatar>
            <div>
              <b>{name}</b>
              <p>{text}</p>
              <small>
                {active
                  ? phase === 3
                    ? "Resolved"
                    : "In progress"
                  : "Assigned to team"}
              </small>
            </div>
          </div>
        ))}
        <div className="wb-inbox-foot">
          <ShieldCheck size={14} /> Human handoff available
        </div>
      </aside>
      <div className="wb-conversation">
        <div className="wb-conversation-head">
          <Avatar>DW</Avatar>
          <div>
            <b>Dana Whitfield</b>
            <span>Order support · Website chat</span>
          </div>
          <MoreHorizontal size={17} />
        </div>
        <div className="wb-conversation-body">
          <div className="wb-message-label">
            CUSTOMER <span>09:41</span>
          </div>
          <div className="wb-chat-message">{typed || "…"}</div>
          <div className={"wb-agent-trace wb-reveal" + visible(time > 2200)}>
            <div className="wb-trace-title">
              <Sparkles size={12} /> Agent activity{" "}
              <span>
                {phase === 3 ? "4 actions completed" : "Processing request"}
              </span>
            </div>
            {[
              ["Retrieve order", "Order #4821 · Carrier delay", 2800],
              ["Check service policy", "Express replacement eligible", 4300],
              ["Create replacement", "Shipment R-4821 confirmed", 6000],
              [
                "Update customer record",
                "Support ticket linked to order",
                7700,
              ],
            ].map(([label, detail, at]) => (
              <TaskRow
                key={label}
                label={label}
                detail={detail}
                done={time > at}
                active={time > at - 1500 && time <= at}
              />
            ))}
          </div>
          <div className={"wb-agent-answer wb-reveal" + visible(phase === 3)}>
            <div className="wb-message-label">
              <Bot size={12} /> RELAY AGENT
            </div>
            <p>
              I’ve arranged an express replacement at no additional cost. Your
              new tracking details are on their way, Dana.
            </p>
            <span>
              <CheckCheck size={13} /> Customer updated · Ticket resolved
            </span>
          </div>
        </div>
        <div className="wb-composer">
          <span>Reply to Dana…</span>
          <span>
            AI assisted <Sparkles size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

function EnterpriseDemo({ time }) {
  const phase = phaseAt(time);
  return (
    <div className="wb-knowledge">
      <div className="wb-query">
        <Search size={15} />
        <span>What drove our Q3 cloud expenditure?</span>
        <Avatar>MR</Avatar>
      </div>
      <div className="wb-knowledge-grid">
        <div className="wb-source-list">
          <div className="wb-mini-heading">
            CONNECTED SOURCES <LockKeyhole size={12} />
          </div>
          {[
            [
              Database,
              "Cloud cost ledger",
              "Finance warehouse",
              "Read authorized",
            ],
            [
              FileText,
              "Q3 budget review",
              "Internal knowledge base",
              "Sensitive fields masked",
            ],
            [
              GitBranch,
              "Migration programme",
              "Project workspace",
              "Read authorized",
            ],
            [
              LockKeyhole,
              "Payroll records",
              "Restricted collection",
              "Excluded by policy",
            ],
          ].map(([Icon, title, detail, state], i) => (
            <div
              key={title}
              className={
                "wb-source" +
                (time > 1200 + i * 1100 ? " is-indexed" : "") +
                (i === 3 ? " is-restricted" : "")
              }
            >
              <Icon size={17} />
              <div>
                <b>{title}</b>
                <span>{detail}</span>
                <small>
                  {time > 1200 + i * 1100 ? state : "Checking permissions…"}
                </small>
              </div>
              {time > 1200 + i * 1100 && <Check size={12} />}
            </div>
          ))}
          <div className="wb-access-note">
            <ShieldCheck size={16} />
            <span>
              Access follows your role.
              <br />
              <b>Finance analyst</b>
            </span>
          </div>
        </div>
        <div className="wb-knowledge-answer">
          <span className="wb-overline">
            <Sparkles size={12} /> INTELLIGENCE BRIEF
          </span>
          <div className={"wb-answer-content wb-reveal" + visible(phase >= 2)}>
            <h4>
              Clarity behind
              <br /> the numbers.
            </h4>
            <p>
              Q3 cloud spend reached <b>$412,000</b>, up 6% from Q2. The
              platform migration accounts for most of the increase.<sup>1</sup>
            </p>
            <div className="wb-data-table">
              <div>
                <span>BUSINESS UNIT</span>
                <span>Q3 SPEND</span>
                <span>CHANGE</span>
              </div>
              {[
                ["Platform", "$198K", "+16%"],
                ["Data", "$131K", "+2%"],
                ["Product", "$83K", "−7%"],
              ].map((row) => (
                <div key={row[0]}>
                  {row.map((cell) => (
                    <span key={cell}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className={"wb-citation wb-reveal" + visible(phase === 3)}>
              <FileText size={13} />
              <span>
                Q3 budget review · Page 4<br />
                <small>Source-linked answer · Access verified</small>
              </span>
              <ArrowUpRight size={14} />
            </div>
          </div>
          {phase < 2 && (
            <div className="wb-thinking">
              <span className="wb-thinking-dot" />
              Retrieving authorized knowledge…
              <div />
              <div />
              <div />
            </div>
          )}
        </div>
      </div>
      <div className="wb-audit">
        <span>ACTIVITY LOG</span>
        <code>
          {phase === 3
            ? "answer.delivered  ·  2 citations  ·  policy checks passed"
            : "query.received  →  access.verify  →  sources.retrieve"}
        </code>
        <ShieldCheck size={13} />
      </div>
    </div>
  );
}

function CRMDemo({ time }) {
  const phase = phaseAt(time);
  const { disabled } = useSiteMotion();
  const cards = [
    ["Halcyon Labs", "$12,000", "JM", 0],
    [
      "Northwind Freight",
      "$32,000",
      phase === 3 ? "PS" : "—",
      phase >= 2 ? 1 : 0,
    ],
    ["Orbit Clinics", "$24,000", "AR", 1],
    ["Meridian & Co", "$31,000", "AR", 2],
    ["Kestrel Air", "$30,000", "PS", 3],
  ];
  return (
    <div className="wb-crm">
      <div className="wb-metrics">
        <Metric
          label="Open pipeline"
          value="$133,000"
          note="Q4 opportunities"
        />
        <Metric
          label="Qualified leads"
          value={phase >= 2 ? "24" : "23"}
          note="Across active accounts"
        />
        <Metric
          label="Forecast visibility"
          value="One view"
          note="Shared across the team"
        />
      </div>
      <LayoutGroup>
        <div className="wb-board">
          {["New leads", "Qualified", "Proposal", "Closed won"].map(
            (column, i) => (
              <div className="wb-board-column" key={column}>
                <div className="wb-column-title">
                  <i />
                  <span>{column}</span>
                  <small>{cards.filter((c) => c[3] === i).length}</small>
                </div>
                {cards
                  .filter((c) => c[3] === i)
                  .map(([name, value, owner]) => (
                    <motion.div
                      layoutId={disabled ? undefined : name}
                      transition={{ duration: 0.55 }}
                      key={name}
                      className={
                        "wb-deal" +
                        (name === "Northwind Freight" ? " is-featured" : "")
                      }
                    >
                      <span className="wb-company-monogram">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <b>{name}</b>
                      <span className="wb-deal-value">{value}</span>
                      <div>
                        <small>
                          {name === "Northwind Freight"
                            ? phase >= 2
                              ? "Score 86 · High intent"
                              : "Enriching lead…"
                            : "Account opportunity"}
                        </small>
                        <Avatar>{owner}</Avatar>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ),
          )}
        </div>
      </LayoutGroup>
      <div className="wb-lead-profile">
        <div className="wb-profile-heading">
          <span className="wb-company-monogram">NF</span>
          <div>
            <b>Northwind Freight</b>
            <span>Lead intelligence</span>
          </div>
          <Status neutral={phase < 2}>
            {phase >= 2 ? "Sales qualified" : "Enriching"}
          </Status>
        </div>
        <div className="wb-profile-details">
          <div>
            <small>COMPANY FIT</small>
            <b>Logistics · 240 employees</b>
          </div>
          <div>
            <small>ACCOUNT OWNER</small>
            <b>
              {phase === 3
                ? "Priya Shah · Enterprise sales"
                : "Evaluating routing rules"}
            </b>
          </div>
          <div>
            <small>NEXT BEST ACTION</small>
            <b>
              {phase === 3
                ? "Discovery call scheduled"
                : "Qualify buying intent"}
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaasDemo({ time }) {
  const phase = phaseAt(time);
  return (
    <div className="wb-saas">
      <div className="wb-release">
        <GitBranch size={13} />
        <code>release / v2.4</code>
        <div>
          {["Build", "Tests", "Deploy"].map((step, i) => (
            <span key={step} className={phase > i ? "is-complete" : ""}>
              {phase > i ? <Check size={12} /> : <i />}
              {step}
            </span>
          ))}
        </div>
        <Status neutral={phase < 3}>
          {phase === 3 ? "Production" : "Release pipeline"}
        </Status>
      </div>
      <div className="wb-product-dashboard">
        <div className="wb-dashboard-title">
          <div>
            <span className="wb-overline">PRODUCT OVERVIEW</span>
            <h4>Your business. In focus.</h4>
          </div>
          <span>
            Last 30 days <ChevronRight size={12} />
          </span>
        </div>
        <div className="wb-metrics">
          <Metric
            label="Recurring revenue"
            value="$48,200"
            note="Monthly subscriptions"
          />
          <Metric
            label="Active accounts"
            value={phase === 3 ? "1,249" : "1,248"}
            note="Across all workspaces"
          />
        </div>
        <div className="wb-revenue-chart">
          <div>
            <b>Revenue performance</b>
            <span>
              +8.3% <ArrowUpRight size={12} />
            </span>
          </div>
          <div className="wb-line-chart">
            <span>$50k</span>
            <span>$25k</span>
            <span>$0</span>
            <svg viewBox="0 0 500 140" preserveAspectRatio="none">
              <path
                className="wb-chart-area"
                d="M0 125 C40 120 50 110 80 114 S130 75 160 85 S210 67 240 75 S290 29 320 40 S375 32 400 22 S460 17 500 3 L500 140 L0 140Z"
              />
              <path
                className="wb-chart-line"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={time < 2500 ? 1 - time / 2500 : 0}
                d="M0 125 C40 120 50 110 80 114 S130 75 160 85 S210 67 240 75 S290 29 320 40 S375 32 400 22 S460 17 500 3"
              />
            </svg>
          </div>
          <div className="wb-chart-labels">
            <span>JUN</span>
            <span>JUL</span>
            <span>AUG</span>
            <span>SEP</span>
            <span>OCT</span>
            <span>NOV</span>
          </div>
        </div>
      </div>
      <div className="wb-phone">
        <div className="wb-phone-island" />
        <div className="wb-phone-top">
          <Layers size={17} />
          <b>forma</b>
          <span>09:41</span>
        </div>
        <div className="wb-phone-content">
          <span className="wb-overline">YOUR NEXT CHAPTER</span>
          <h4>
            Room
            <br />
            to grow.
          </h4>
          <p>
            One workspace.
            <br />
            Every possibility.
          </p>
          <div className="wb-plan">
            <span>PRO MEMBERSHIP</span>
            <strong>
              $29<small>/ mo</small>
            </strong>
            <div>
              <Check size={11} /> Unlimited projects
            </div>
            <div>
              <Check size={11} /> Team collaboration
            </div>
            <div>
              <Check size={11} /> Advanced insights
            </div>
          </div>
          <div className={"wb-phone-cta" + (phase === 3 ? " is-success" : "")}>
            {phase === 3 ? (
              <>
                <Check size={13} /> You’re all set
              </>
            ) : (
              <>
                Get started <ArrowRight size={13} />
              </>
            )}
          </div>
          <span className="wb-phone-secure">
            <LockKeyhole size={10} />
            {phase === 3 ? "Subscription activated" : "Secure checkout"}
          </span>
        </div>
      </div>
    </div>
  );
}

function VoiceDemo({ time }) {
  const phase = phaseAt(time);
  return (
    <div className="wb-voice">
      <div className="wb-call-panel">
        <span className="wb-overline">INBOUND CONVERSATION</span>
        <div className="wb-call-avatar">
          <Phone size={26} />
        </div>
        <h4>Alex Morgan</h4>
        <p>New appointment inquiry</p>
        <Status neutral={phase === 3}>
          {phase === 3 ? "Call complete" : "Connected · Echo agent"}
        </Status>
        <div className={"wb-waveform" + (phase === 3 ? " is-ended" : "")}>
          {Array.from({ length: 34 }, (_, i) => (
            <i
              key={i}
              style={{
                "--bar-height": 12 + ((i * 17 + 11) % 40) + "px",
                "--bar-delay": i * -0.09 + "s",
              }}
            />
          ))}
        </div>
        <span className="wb-call-time">
          00:{String(Math.min(42, Math.floor(time / 250))).padStart(2, "0")}
        </span>
        <div className="wb-call-context">
          <ShieldCheck size={15} />
          <span>
            Context connected
            <br />
            <b>Customer record + Calendar</b>
          </span>
        </div>
      </div>
      <div className="wb-voice-workspace">
        <div className="wb-mini-heading">
          CONVERSATION INTELLIGENCE <AudioLines size={14} />
        </div>
        <div className="wb-transcript">
          <span>CALLER</span>
          <p>“I’d like to book a consultation for Thursday morning.”</p>
        </div>
        <div
          className={"wb-transcript is-agent wb-reveal" + visible(phase >= 1)}
        >
          <span>ECHO AGENT</span>
          <p>
            “Of course. I have 10:30 available. Shall I reserve that for you?”
          </p>
        </div>
        <div className={"wb-appointment wb-reveal" + visible(phase >= 2)}>
          <div>
            <CalendarDays size={17} />
            <span>
              Consultation <small>30 minutes · Online meeting</small>
            </span>
            <Check size={14} />
          </div>
          <div className="wb-calendar-strip">
            {["MON", "TUE", "WED", "THU", "FRI"].map((day, i) => (
              <span className={i === 3 ? "is-booked" : ""} key={day}>
                <small>{day}</small>
                <b>{9 + i}</b>
                {i === 3 && <i />}
              </span>
            ))}
          </div>
          <div className="wb-booked-time">
            <span>Thursday · 10:30 – 11:00</span>
            <b>{phase === 3 ? "Confirmed" : "Reserved"}</b>
          </div>
        </div>
        <div className={"wb-voice-confirm wb-reveal" + visible(phase === 3)}>
          <CircleCheck size={16} />
          <span>
            Calendar updated. Confirmation sent.
            <small>Call summary saved to the customer record.</small>
          </span>
        </div>
      </div>
    </div>
  );
}

function DataDemo({ time }) {
  const phase = phaseAt(time);
  return (
    <div className="wb-data">
      <div className="wb-data-pipeline">
        {[
          [Database, "SOURCE SYSTEMS", "CRM + Billing", "3 connectors"],
          [GitBranch, "TRANSFORMATION", "Revenue model", "12 checks passed"],
          [Layers, "BUSINESS LAYER", "Executive view", "Ready to publish"],
        ].map(([Icon, label, title, note], i) => (
          <div
            className={"wb-pipeline-node" + (phase > i ? " is-complete" : "")}
            key={label}
          >
            <div>
              <Icon size={17} />
              {phase > i ? (
                <Check size={13} />
              ) : (
                <span className="wb-node-dot" />
              )}
            </div>
            <small>{label}</small>
            <b>{title}</b>
            <span>{phase > i ? note : "Awaiting upstream data"}</span>
            {i < 2 && <ArrowRight className="wb-pipeline-arrow" size={17} />}
          </div>
        ))}
      </div>
      <div className="wb-data-body">
        <div className="wb-model">
          <div>
            <span />
            <span />
            <span />
            <code>revenue_model.sql</code>
          </div>
          <pre>
            <span>SELECT</span>
            {"\n  date_trunc('week', paid_at),\n  "}
            <span>SUM</span>
            {"(net_revenue) "}
            <span>AS</span>
            {" revenue\n"}
            <span>FROM</span>
            {" finance.orders\n"}
            <span>WHERE</span>
            {" status = 'settled'\n"}
            <span>GROUP BY</span>
            {" 1"}
          </pre>
          <div className={"wb-model-result wb-reveal" + visible(phase >= 2)}>
            <Check size={12} /> Data validation passed <span>8 rows</span>
          </div>
          <div className="wb-model-note">
            <ShieldCheck size={19} />
            <b>A single source of truth.</b>
            <p>
              Versioned models. Quality checks.
              <br />
              Traceable business metrics.
            </p>
          </div>
        </div>
        <div className="wb-data-chart">
          <div className="wb-chart-heading">
            <span className="wb-overline">NET REVENUE</span>
            <strong>{phase >= 2 ? "$86,400" : "—"}</strong>
            <small>Weekly performance · Illustrative data</small>
          </div>
          <div className="wb-bars">
            {[42, 53, 49, 69, 45, 74, 82, 96].map((height, i) => (
              <div key={i}>
                <i
                  className={
                    i === 7 ? "is-latest" : i === 4 ? "is-exception" : ""
                  }
                  style={{
                    height: time > 5800 + i * 170 ? height + "%" : "3%",
                  }}
                />
                <span>W{i + 1}</span>
              </div>
            ))}
          </div>
          <div className={"wb-data-insight wb-reveal" + visible(phase === 3)}>
            <Sparkles size={14} />
            <span>
              <b>Variance explained.</b> Week 5 includes a one-off account
              credit. Review the underlying record.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const buildDemos = [
  AgentsDemo,
  EnterpriseDemo,
  CRMDemo,
  SaasDemo,
  VoiceDemo,
  DataDemo,
];
