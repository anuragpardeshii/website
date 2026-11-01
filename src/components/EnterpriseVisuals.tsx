import { Icon } from "./ui";

function ProductBar({ name }: { name: string }) {
  return (
    <div className="enterprise-top">
      <div className="enterprise-brand">
        <span>◈</span>
        {name}
        <small>WORKSPACE</small>
      </div>
      <div className="enterprise-top-right">
        <span>DEMO</span>
        <i />
        <span className="enterprise-avatar">JD</span>
      </div>
    </div>
  );
}
function Sidebar({ mode }: { mode: string }) {
  return (
    <aside className="enterprise-sidebar">
      <span className="sidebar-caption">WORKSPACE</span>
      {[
        ["layout", "Overview"],
        [
          mode === "crm" ? "users" : "chart",
          mode === "crm" ? "Pipeline" : "Performance",
        ],
        ["layers", mode === "erp" ? "Operations" : "Projects"],
        ["box", mode === "logistics" ? "Warehouses" : "Resources"],
        ["workflow", "Automations"],
      ].map(([icon, label], i) => (
        <div className={i === 0 ? "selected" : ""} key={label}>
          <Icon name={icon} size={16} />
          <span>{label}</span>
          {i === 0 && <i />}
        </div>
      ))}
      <div className="sidebar-bottom">
        <span className="online-dot" />
        All systems connected
      </div>
    </aside>
  );
}
function AnalyticsBody() {
  return (
    <>
      <div className="enterprise-metrics">
        {[
          ["Net revenue", "₹24,86,420", "↑ 18.6%"],
          ["Active customers", "1,284", "↑ 12.4%"],
          ["Orders fulfilled", "3,642", "↑ 8.2%"],
        ].map(([l, v, d]) => (
          <div key={l}>
            <small>{l}</small>
            <strong>{v}</strong>
            <span>
              {d}
              <i>this month</i>
            </span>
          </div>
        ))}
      </div>
      <div className="enterprise-chart">
        <div>
          <strong>Business performance</strong>
          <span>
            <i />
            Revenue <i />
            Previous period
          </span>
        </div>
        <svg
          viewBox="0 0 600 170"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 30H600M0 80H600M0 130H600" stroke="#333333" fill="none" />
          <path
            d="M0 150 35 125 70 133 110 92 150 105 195 75 240 86 275 49 320 58 355 34 395 57 440 21 480 31 525 9 565 18 600 0V170H0Z"
            fill="#2d2d2d"
          />
          <path
            d="M0 150 35 125 70 133 110 92 150 105 195 75 240 86 275 49 320 58 355 34 395 57 440 21 480 31 525 9 565 18 600 0"
            fill="none"
            stroke="#afafaf"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M0 158 60 145 120 149 180 125 240 135 300 104 360 112 420 94 480 105 540 80 600 87"
            fill="none"
            stroke="#757575"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        </svg>
        <div className="enterprise-axis">
          <span>01 Jun</span>
          <span>07 Jun</span>
          <span>14 Jun</span>
          <span>21 Jun</span>
          <span>30 Jun</span>
        </div>
      </div>
    </>
  );
}
function CRMBody() {
  return (
    <>
      <div className="crm-summary">
        <div>
          <span>Pipeline value</span>
          <strong>₹48,20,000</strong>
        </div>
        <div>
          <span>Open opportunities</span>
          <strong>
            24 <small>across 4 stages</small>
          </strong>
        </div>
      </div>
      <div className="crm-pipeline">
        {(
          [
            [
              "New leads",
              "04",
              [
                ["Northstar Studio", "Website redesign", "₹2,40,000"],
                ["Bloom & Co.", "Commerce platform", "₹3,80,000"],
              ],
            ],
            [
              "In conversation",
              "08",
              [
                ["Acme Industries", "Connected operations", "₹8,60,000"],
                ["Waypoint", "Inventory platform", "₹6,20,000"],
              ],
            ],
            [
              "Proposal sent",
              "06",
              [
                ["Layer Digital", "Customer portal", "₹4,20,000"],
                ["Monogram", "Analytics dashboard", "₹2,80,000"],
              ],
            ],
          ] as const
        ).map(([title, count, cards], i) => (
          <div key={title}>
            <div className="pipeline-title">
              <i className={`stage-${i}`} />
              {title}
              <small>{count}</small>
            </div>
            {cards.map(([name, detail, amount], j) => (
              <div className="pipeline-card" key={name}>
                <span className={`deal-type deal-${i}`}>
                  {j ? "New business" : "Partnership"}
                </span>
                <strong>{name}</strong>
                <p>{detail}</p>
                <div>
                  <b>{amount}</b>
                  <span>
                    {name[0]}
                    {name[1].toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
function OperationsBody({ logistics = false, commerce = false }) {
  const modules = commerce
    ? [
        ["bag", "Orders today", "124 orders"],
        ["box", "Available stock", "1,842 products"],
        ["check", "Fulfilled", "98 orders"],
      ]
    : logistics
      ? [
          ["box", "Stock overview", "12 locations"],
          ["workflow", "In transit", "48 shipments"],
          ["check", "Ready to ship", "124 orders"],
        ]
      : [
          ["briefcase", "Procurement", "12 pending"],
          ["layers", "Operations", "6 departments"],
          ["users", "People", "48 team members"],
        ];
  const rows = commerce
    ? [
        ["ORD–3081", "Harbor lamp", "Fulfilled", "AS"],
        ["ORD–3082", "Studio chair", "Processing", "MK"],
        ["ORD–3083", "Oak desk", "Ready to ship", "RK"],
      ]
    : logistics
      ? [
          ["SHP–2048", "Bengaluru", "In transit", "RK"],
          ["SHP–2049", "Mumbai", "Dispatched", "AS"],
          ["SHP–2050", "Hyderabad", "Processing", "MK"],
        ]
      : [
          ["PO–1024", "Procurement", "Approved", "AM"],
          ["INV–0842", "Finance", "In review", "DK"],
          ["PRJ–0068", "Operations", "On track", "MS"],
        ];
  return (
    <>
      <div className="operations-modules">
        {modules.map(([icon, title, sub]) => (
          <div key={title}>
            <Icon name={icon} size={24} />
            <strong>{title}</strong>
            <span>{sub}</span>
          </div>
        ))}
      </div>
      <div className="operations-table">
        <div className="table-caption">
          <strong>
            {commerce
              ? "Recent orders"
              : logistics
                ? "Shipment activity"
                : "Operational overview"}
          </strong>
          <span>
            Live workspace <i />
          </span>
        </div>
        <div className="operations-row headings">
          <span>
            {commerce ? "Order" : logistics ? "Shipment" : "Reference"}
          </span>
          <span>
            {commerce ? "Product" : logistics ? "Destination" : "Department"}
          </span>
          <span>Status</span>
          <span>Owner</span>
        </div>
        {rows.map(([id, dep, status, owner], i) => (
          <div className="operations-row" key={id}>
            <strong>{id}</strong>
            <span>{dep}</span>
            <span className={`status-chip status-${i}`}>{status}</span>
            <span>{owner}</span>
          </div>
        ))}
      </div>
    </>
  );
}
export function SystemPreview({ mode = "analytics", className = "" }) {
  const names: Record<string, string> = {
    crm: "Orbit",
    erp: "Nexus",
    analytics: "Meridian",
    commerce: "Aster",
    logistics: "Atlas",
    web: "Forma",
  };
  if (mode === "web")
    return (
      <div
        className={`website-preview ${className}`}
        role="img"
        aria-label="An original expressive brand website concept"
      >
        <div className="website-preview-top">
          <strong>forma®</strong>
          <span>STUDIO &nbsp; WORK &nbsp; CONTACT ↗</span>
        </div>
        <img src="/images/connected-architecture.webp" alt="" loading="lazy" />
        <div className="website-preview-copy">
          <span>THINK FORWARD.</span>
          <strong>
            Built for
            <br />
            <em>what’s next.</em>
          </strong>
          <span className="website-preview-line">
            Architecture of possibility. ↗
          </span>
        </div>
        <div className="website-preview-footer">
          <span>DESIGN THAT MOVES YOU.</span>
          <span>01 — 03</span>
        </div>
      </div>
    );
  return (
    <div
      className={`enterprise-window ${className} mode-${mode}`}
      role="img"
      aria-label={`${names[mode] || "Business"} ${mode} interface concept; all figures and records are illustrative`}
    >
      <ProductBar name={names[mode] || "Workspace"} />
      <div className="enterprise-body">
        <Sidebar mode={mode} />
        <div className="enterprise-main">
          <div className="enterprise-heading">
            <div>
              <span>YOUR BUSINESS, IN FOCUS</span>
              <h3>
                {mode === "crm"
                  ? "Relationships that move forward."
                  : mode === "erp"
                    ? "One connected operation."
                    : mode === "logistics"
                      ? "Every movement. In view."
                      : mode === "commerce"
                        ? "Every order, connected."
                        : "The bigger picture. Beautifully clear."}
              </h3>
            </div>
            <span className="preview-period">
              This month
              <Icon name="chevron" size={12} />
            </span>
          </div>
          {mode === "crm" ? (
            <CRMBody />
          ) : ["erp", "logistics", "commerce"].includes(mode) ? (
            <OperationsBody
              logistics={mode === "logistics"}
              commerce={mode === "commerce"}
            />
          ) : (
            <AnalyticsBody />
          )}
          <div className="enterprise-bottom">
            <span>
              <i />
              Connected workspace
            </span>
            <span>Product concept · illustrative data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
