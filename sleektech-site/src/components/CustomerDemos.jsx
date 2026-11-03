import {
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Send,
  Sparkles,
  FileText,
  Package,
  Search,
} from "lucide-react";
import { useProductMotion } from "./ProductMotion";

export function WebsiteExperience({ phase }) {
  const { progress } = useProductMotion();
  const sent = phase === 4;
  const page = phase === 0 ? "Home" : phase < 3 ? "Projects" : "Contact";
  return (
    <div className="customer-website">
      <nav>
        <b>
          FORMA<span>®</span>
        </b>
        <div>
          {["Home", "Projects", "Studio", "Contact"].map((v) => (
            <span key={v} className={v === page ? "selected" : ""}>
              {v}
            </span>
          ))}
        </div>
        <span className="web-nav-cta">
          Let’s talk <ArrowUpRight size={13} />
        </span>
      </nav>
      {phase === 0 ? (
        <>
          <div className="customer-web-hero">
            <small>INDEPENDENT DESIGN STUDIO · MUMBAI</small>
            <h4>
              Spaces for
              <br />
              <em>better living.</em>
            </h4>
            <p>
              Architecture, interiors and objects.
              <br />
              Thoughtfully made for everyday life.
            </p>
            <span className="web-cta">
              Explore our projects <ArrowRight size={16} />
            </span>
            <div className="web-sculpture">
              <i />
              <i />
              <i />
              <span>THE COURTYARD HOUSE / 2026</span>
            </div>
          </div>
          <div className="web-bottom-strip">
            <span>Residential</span>
            <span>Commercial</span>
            <span>Objects & spaces</span>
            <b>Scroll to discover ↓</b>
          </div>
        </>
      ) : phase === 1 ? (
        <>
          <header className="customer-web-heading">
            <small>SELECTED WORK / 01–03</small>
            <h4>
              A different way
              <br />
              to feel at home.
            </h4>
            <p>Explore spaces shaped around the people who use them.</p>
          </header>
          <div className="web-projects">
            {["The Courtyard House", "Northlight Studio", "Still House"].map(
              (s, i) => (
                <article
                  key={s}
                  className={i === 0 && progress > 0.45 ? "selected" : ""}
                >
                  <div className={"web-project-art art-" + i}>
                    <i />
                    <i />
                  </div>
                  <small>
                    {
                      [
                        "RESIDENTIAL · 240 M²",
                        "WORKPLACE · 180 M²",
                        "RESIDENTIAL · 320 M²",
                      ][i]
                    }
                  </small>
                  <h5>
                    {s}
                    <ArrowUpRight size={16} />
                  </h5>
                </article>
              ),
            )}
          </div>
        </>
      ) : phase === 2 ? (
        <>
          <div className="web-project-detail">
            <div>
              <small>PROJECT / THE COURTYARD HOUSE</small>
              <h4>
                Light. Space.
                <br />
                Room to breathe.
              </h4>
              <p>
                A quiet home built around a sunlit courtyard, natural materials
                and the rhythm of family life.
              </p>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>Alibaug, India</dd>
                </div>
                <div>
                  <dt>Area</dt>
                  <dd>240 m²</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>2026</dd>
                </div>
              </dl>
              <span className="web-cta">
                Start a similar project <ArrowRight size={15} />
              </span>
            </div>
            <div className="web-project-art art-0">
              <i />
              <i />
            </div>
          </div>
          <div className="web-bottom-strip">
            <span>Architecture + interiors</span>
            <span>Built for everyday living</span>
          </div>
        </>
      ) : (
        <div className="customer-web-contact">
          <small>LET’S CREATE SOMETHING CONSIDERED</small>
          <h4>
            {sent ? "A new beginning." : "Tell us about\nyour next idea."}
          </h4>
          {sent ? (
            <div className="web-confirmation">
              <CheckCircle2 size={32} />
              <h5>Thanks, Alex. We’re on it.</h5>
              <p>
                Your studio enquiry is with our team.
                <br />
                We’ll reply to alex@example.com within two working days.
              </p>
              <span>Project enquiry #F-204 · Received</span>
            </div>
          ) : (
            <>
              <div className="web-enquiry">
                <label>
                  Your name
                  <span>
                    {progress > 0.15 ? "Alex Morgan" : "Enter your name"}
                  </span>
                </label>
                <label>
                  Email address
                  <span>
                    {progress > 0.35 ? "alex@example.com" : "you@example.com"}
                  </span>
                </label>
                <label className="wide">
                  What do you have in mind?
                  <span>
                    {progress > 0.55
                      ? "A warm, welcoming studio for our growing team."
                      : "Tell us about your project…"}
                  </span>
                </label>
              </div>
              <span className="web-cta">
                Send project enquiry <ArrowUpRight size={16} />
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const chartPoints = [
  [0, 115],
  [40, 104],
  [80, 111],
  [120, 81],
  [160, 91],
  [200, 64],
  [240, 69],
  [280, 40],
  [320, 51],
  [360, 18],
  [400, 28],
  [440, 8],
];
export function DashboardExperience({ phase }) {
  const { progress, reduced } = useProductMotion();
  const filtered = phase >= 2;
  const updated = phase === 0 && progress > 0.58;
  const values = filtered ? [42, 58, 46, 76, 68, 91] : [62, 45, 73, 58, 86, 72];
  const revenue = filtered ? "$86,400" : updated ? "$128,400" : "$126,000";
  const draw = reduced ? 1 : Math.min(1, progress * 2.5);
  return (
    <div className="customer-dashboard">
      <header className="customer-dashboard-head">
        <div>
          <small>MERIDIAN / BUSINESS INTELLIGENCE</small>
          <h4>
            {phase === 3
              ? "Enterprise customers"
              : "Your business, at a glance."}
          </h4>
          <p>
            {phase === 3
              ? "See which accounts are driving the result."
              : "Revenue, customers and growth. One clear view."}
          </p>
        </div>
        <span className="live-pill">
          <i />
          Live data
        </span>
      </header>
      {phase === 4 && (
        <div className="dashboard-share">
          <FileText size={23} />
          <div>
            <b>
              {progress > 0.5
                ? "Quarterly report shared"
                : "Share quarterly performance"}
            </b>
            <p>Leadership team · Revenue, accounts and growth · PDF</p>
          </div>
          <span>
            {progress > 0.5 ? (
              <>
                <Check size={14} />
                Sent
              </>
            ) : (
              "Preparing report…"
            )}
          </span>
        </div>
      )}
      <div className="dashboard-toolbar">
        <div>
          <span className="selected">Overview</span>
          <span>Customers</span>
          <span>Revenue</span>
        </div>
        <span>
          Q1 2026 <ChevronDown size={12} />
        </span>
        <span className={phase === 1 ? "filter-open" : ""}>
          {filtered ? "Enterprise" : "All segments"} <ChevronDown size={12} />
          {phase === 1 && progress > 0.2 && (
            <div className="dashboard-filter-menu">
              <small>CUSTOMER SEGMENT</small>
              <p>All segments</p>
              <p className="selected">
                <Check size={13} />
                {filtered ? "Annual" : "Enterprise"}
              </p>
              <p>Small business</p>
            </div>
          )}
        </span>
      </div>
      <div className="dashboard-kpis">
        {[
          ["Net revenue", revenue, filtered ? "+24.8%" : "+18.6%", "violet"],
          [
            "Active accounts",
            filtered ? "42" : "128",
            "+12 this quarter",
            "teal",
          ],
          [
            "Conversion rate",
            filtered ? "8.4%" : "6.8%",
            "+1.2 percentage points",
            "orange",
          ],
        ].map(([label, value, detail, tone]) => (
          <article className={tone} key={label}>
            <small>{label}</small>
            <strong key={value}>{value}</strong>
            <span>
              <ArrowUpRight size={13} />
              {detail}
            </span>
            <svg viewBox="0 0 120 35">
              <path
                d="M2 31L17 22L32 27L47 12L62 19L77 8L92 12L118 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          </article>
        ))}
      </div>
      {phase === 3 ? (
        <div className="dashboard-accounts">
          <div>
            <h5>Revenue by account</h5>
            <span>Enterprise · 42 accounts</span>
          </div>
          {[
            ["Northwind Freight", "$36,000", "41.7%"],
            ["Luma Health", "$28,400", "32.9%"],
            ["Vertex Labs", "$22,000", "25.4%"],
          ].map(([name, amount, share], i) => (
            <article
              key={name}
              className={i === 0 && progress > 0.35 ? "selected" : ""}
            >
              <span className="account-monogram">{name[0]}</span>
              <div>
                <b>{name}</b>
                <small>
                  {i === 0
                    ? "Annual platform subscription"
                    : "Enterprise workspace"}
                </small>
              </div>
              <b>{amount}</b>
              <span>{share}</span>
              <ArrowUpRight size={15} />
            </article>
          ))}
          {progress > 0.4 && (
            <div className="dashboard-account-detail">
              <CheckCircle2 size={18} />
              <div>
                <b>Northwind Freight · $36,000</b>
                <p>
                  12 paid invoices · No overdue balance · Renewal in September
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard-visuals">
          <article className="dashboard-trend">
            <div>
              <h5>Revenue trend</h5>
              <span>
                {filtered ? "Enterprise" : "All segments"}{" "}
                <small>↑ {filtered ? "24.8" : "18.6"}%</small>
              </span>
            </div>
            <div className="dashboard-line-chart">
              <div className="chart-axis">
                <span>$40k</span>
                <span>$20k</span>
                <span>$0</span>
              </div>
              <svg viewBox="0 0 440 140" preserveAspectRatio="none">
                <path
                  d="M0 25H440 M0 75H440 M0 125H440"
                  stroke="#e9eaf4"
                  fill="none"
                />
                <path
                  d="M0 125L40 118L80 121L120 104L160 110L200 89L240 98L280 77L320 84L360 58L400 64L440 43"
                  stroke="#bbc6df"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  fill="none"
                />
                <path
                  d={
                    "M" +
                    chartPoints
                      .map(([x, y]) => `${x},${y + (filtered ? 8 : 0)}`)
                      .join("L") +
                    "L440 140L0 140Z"
                  }
                  fill="#ede9ff"
                  opacity=".8"
                />
                <path
                  d={
                    "M" +
                    chartPoints
                      .map(([x, y]) => `${x},${y + (filtered ? 8 : 0)}`)
                      .join("L")
                  }
                  stroke="#7957de"
                  strokeWidth="3"
                  fill="none"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - draw}
                />
              </svg>
            </div>
            <div className="dashboard-chart-months">
              <span>Jan 1</span>
              <span>Jan 15</span>
              <span>Feb 1</span>
              <span>Feb 15</span>
              <span>Mar 1</span>
              <span>Mar 15</span>
            </div>
            <footer>
              <span>
                <i />
                Current period
              </span>
              <span>--- Previous period</span>
            </footer>
          </article>
          <article className="dashboard-donut-card">
            <h5>{filtered ? "Revenue by plan" : "Revenue by segment"}</h5>
            <div
              className="dashboard-donut"
              style={{
                background: `conic-gradient(#7957de 0 ${filtered ? 74 : 67}%,#32b3a1 0 89%,#f6b65b 0)`,
              }}
            >
              <div>
                <b>{filtered ? "74%" : "67%"}</b>
                <small>{filtered ? "Annual" : "Enterprise"}</small>
              </div>
            </div>
            <div className="dashboard-segment-legend">
              <span>
                <i />
                {filtered ? "Annual" : "Enterprise"}
              </span>
              <span>
                <i />
                {filtered ? "Monthly" : "Small business"}
              </span>
              <span>
                <i />
                {filtered ? "Usage" : "Other"}
              </span>
            </div>
          </article>
        </div>
      )}
      <div className="dashboard-bottom">
        <article>
          <h5>New customers</h5>
          <div className="dashboard-mini-bars">
            {values.map((v, i) => (
              <div key={i}>
                <i style={{ height: v * draw + "%" }} />
                <small>{["W1", "W3", "W5", "W7", "W9", "W11"][i]}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="dashboard-insight">
          <Sparkles size={20} />
          <div>
            <small>INSIGHT</small>
            <h5>
              {filtered
                ? "Enterprise is your growth engine."
                : "A strong quarter, getting stronger."}
            </h5>
            <p>
              {filtered
                ? "42 accounts generated $86,400. Open the customer view to explore the opportunity."
                : "Enterprise customers account for 67% of revenue. Retention is up 8 points this quarter."}
            </p>
          </div>
        </article>
      </div>
      <div className="customer-action-note">
        <CheckCircle2 size={15} />
        {phase === 4
          ? progress > 0.5
            ? "Report shared with leadership · PDF ready"
            : "Preparing the quarterly report…"
          : phase === 3
            ? "Opened Northwind’s customer record"
            : phase >= 2
              ? "Enterprise filter applied · Metrics and charts updated"
              : updated
                ? "New payment received · Revenue increased by $2,400"
                : "Billing and CRM connected · Updated just now"}
      </div>
    </div>
  );
}

const conversation = [
  ["customer", "Hi! My order #4821 arrived, but the lamp shade is damaged."],
  [
    "ai",
    "Hi Maya! I’m sorry about that. I found your order for the Arc table lamp. Let me check the replacement policy.",
  ],
  ["customer", "Can you send a replacement to the same address?"],
  [
    "ai",
    "Yes. Your order qualifies for a free replacement, with express delivery to your original address. Would you like me to arrange it?",
  ],
  ["customer", "Yes please. Will there be any charge?"],
  [
    "ai",
    "No charge at all. I’ve created replacement R-4821. It will arrive in 2–3 working days, and tracking will be emailed today.",
  ],
  ["customer", "Perfect! How should I pack the damaged lamp?"],
  [
    "ai",
    "Keep it in its original box if you still have it. I’ve emailed a prepaid return label and simple packing instructions.",
  ],
  ["customer", "That’s everything. Thanks for making it easy!"],
  [
    "ai",
    "You’re welcome, Maya! Your replacement and return are all arranged. I’m here if you need anything else.",
  ],
];
export function AIExperience({ phase }) {
  const { progress, reduced } = useProductMotion();
  const count = Math.min(10, phase * 2 + (progress > 0.38 ? 2 : 1));
  const visible = conversation.slice(Math.max(0, count - 4), count);
  const thinking = !reduced && progress < 0.38;
  const resolved = phase === 4 && progress > 0.83;
  return (
    <div className="customer-ai">
      <div className="ai-chat-main">
        <header>
          <span className="ai-orb">
            <Sparkles size={21} />
          </span>
          <div>
            <h4>Meet Relay.</h4>
            <p>Your helpful, always-on AI assistant.</p>
          </div>
          <span className="live-pill">
            <i />
            Online
          </span>
        </header>
        <div className="ai-conversation" aria-live="off">
          <small className="ai-date">CUSTOMER SUPPORT · TODAY</small>
          {visible.map(([who, body], i) => {
            const latest = i === visible.length - 1;
            const typed =
              who === "ai" && latest && !reduced
                ? body.slice(
                    0,
                    Math.max(
                      1,
                      Math.ceil(
                        body.length * Math.min(1, (progress - 0.38) / 0.43),
                      ),
                    ),
                  )
                : body;
            return (
              <div className={"ai-bubble " + who} key={body}>
                <small>
                  {who === "ai" ? (
                    <>
                      <Sparkles size={11} />
                      Relay AI
                    </>
                  ) : (
                    "Maya Patel"
                  )}
                </small>
                <p>{typed}</p>
                {who === "ai" && latest && phase > 0 && (
                  <span className="ai-citation">
                    <FileText size={11} />
                    {phase === 3
                      ? "Returns guide"
                      : "Orders & replacement policy"}
                  </span>
                )}
              </div>
            );
          })}
          {thinking && (
            <div className="ai-thinking">
              <span />
              <span />
              <span />
              <small>
                {phase === 0
                  ? "Checking your order…"
                  : phase === 1
                    ? "Checking replacement eligibility…"
                    : phase === 2
                      ? "Arranging your replacement…"
                      : phase === 3
                        ? "Finding the return instructions…"
                        : "Writing a reply…"}
              </small>
            </div>
          )}
        </div>
        <div className="ai-composer">
          <span>
            {resolved
              ? "Conversation resolved — happy to help!"
              : "Ask a question or describe what you need…"}
          </span>
          {resolved ? <CheckCircle2 size={19} /> : <Send size={18} />}
        </div>
      </div>
      <aside className="ai-context">
        <small>CONNECTED TO YOUR BUSINESS</small>
        <div className="ai-order">
          <Package size={22} />
          <small>ORDER #4821</small>
          <h5>Arc table lamp</h5>
          <p>Sand · Delivered yesterday</p>
          <b>$89.00</b>
        </div>
        <div className="ai-context-card">
          <FileText size={17} />
          <h5>Knowledge, in context.</h5>
          <p>
            {phase === 0
              ? "Looking up the customer’s order and purchase history."
              : "Damaged item policy · Section 3.2. Free replacement within 30 days."}
          </p>
          <span>
            {phase === 0 ? "Order located" : "Verified policy source"}
          </span>
        </div>
        <div className={"ai-context-card " + (phase >= 2 ? "confirmed" : "")}>
          <CheckCircle2 size={18} />
          <h5>
            {phase >= 2 ? "Replacement arranged" : "Customer stays in control"}
          </h5>
          <p>
            {phase >= 2
              ? "R-4821 · Express delivery · $0.00"
              : "Actions happen after the customer confirms."}
          </p>
          {phase >= 3 && <span>Prepaid return label emailed</span>}
        </div>
        <div className="ai-capabilities">
          <span>Order lookup</span>
          <span>Policy answers</span>
          <span>Customer-approved actions</span>
        </div>
      </aside>
    </div>
  );
}
