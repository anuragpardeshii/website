import {
  WebsiteExperience,
  DashboardExperience,
  AIExperience,
} from "./CustomerDemos";
import {
  ProductMotionContext,
  useProductMotion,
  AnimatedValue,
  TrendChart,
  ReportHero,
  DashboardDetails,
  ProductViewport,
} from "./ProductMotion";
import {
  Check,
  ChevronRight,
  FileText,
  Search,
  Plus,
  ArrowUpRight,
  Send,
  Package,
  Globe2,
  LayoutDashboard,
  Folder,
  Users,
  Bell,
  MoreHorizontal,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Customer-facing product experiences share the pause-aware showcase clock.
const productStages = {
  websites: [
    "Home",
    "Selected projects",
    "The Courtyard House",
    "Start a project",
    "Enquiry received",
  ],
  crm: [
    "Sales pipeline",
    "Northwind / Deal",
    "Proposal.pdf",
    "Sales pipeline",
    "Revenue overview",
  ],
  erp: [
    "Purchase requests",
    "REQ-204 / Review",
    "Supplier quote.pdf",
    "Purchase order",
    "Finance overview",
  ],
  analytics: [
    "Revenue overview",
    "Customer segments",
    "Revenue overview",
    "Enterprise / Breakdown",
    "Shared report",
  ],
  commerce: [
    "Orders",
    "Order #1048",
    "Fulfillment",
    "Shipping label.pdf",
    "Sales overview",
  ],
  logistics: [
    "Inventory",
    "Transfer / TR-208",
    "Pick list.pdf",
    "Dispatch",
    "Network overview",
  ],
  automation: [
    "Support inbox",
    "Maya / Conversation",
    "Replacement confirmation",
    "Return instructions",
    "Resolved conversation",
  ],
};
export const storyStages = productStages;
export const storyPhase = (time) => Math.min(4, Math.floor(time / 2240));
const sections = {
  websites: ["Home", "Projects", "Studio", "Contact"],
  crm: ["Overview", "Deals", "Contacts", "Reports"],
  erp: ["Overview", "Purchasing", "Suppliers", "Finance"],
  analytics: ["Overview", "Segments", "Customers", "Reports"],
  commerce: ["Overview", "Orders", "Products", "Customers"],
  logistics: ["Overview", "Inventory", "Transfers", "Shipments"],
  automation: ["Inbox", "Customers", "Knowledge", "Insights"],
};
const activeNav = {
  websites: [0, 1, 1, 3, 3],
  crm: [1, 1, 1, 1, 3],
  erp: [1, 1, 2, 1, 3],
  analytics: [0, 1, 0, 2, 3],
  commerce: [1, 1, 1, 1, 0],
  logistics: [1, 2, 2, 3, 0],
  automation: [0, 0, 1, 0, 0],
};
function Badge({ children, tone = "green" }) {
  return (
    <span className={`story-badge ${tone}`}>
      {tone === "green" && <Check size={12} />} {children}
    </span>
  );
}
function Title({ eyebrow, children, action }) {
  return (
    <div className="story-title">
      <div>
        <small>{eyebrow}</small>
        <h4>{children}</h4>
      </div>
      {action && (
        <span className="story-action">
          {action}
          <ArrowUpRight size={14} />
        </span>
      )}
    </div>
  );
}
function Stats({ items }) {
  return (
    <div className="story-stats">
      {items.map(([label, value, detail], index) => (
        <div key={label}>
          <small>{label}</small>
          <strong>
            <AnimatedValue value={value} />
          </strong>
          <span>{detail}</span>
          <TrendChart compact variant={index} />
        </div>
      ))}
    </div>
  );
}
function Table({ heads, rows, selected = -1 }) {
  return (
    <div className="story-table">
      <div className="story-row story-table-head">
        {heads.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          className={`story-row ${i === selected ? "selected" : ""}`}
          key={i}
        >
          {row.map((cell, j) => (
            <span key={j}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
function Bars({
  values = [34, 52, 46, 68, 57, 82, 73, 95],
  labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  filtered = false,
}) {
  const { progress, reduced, domain } = useProductMotion();
  const growth = reduced ? 1 : Math.min(1, progress / 0.38);
  return (
    <div className="story-chart">
      <div className="story-chart-scale">
        <span>{domain === "logistics" ? "400" : "100k"}</span>
        <span>{domain === "logistics" ? "200" : "50k"}</span>
        <span>0</span>
      </div>
      <div className="story-bars">
        {values.map((value, i) => (
          <div key={i}>
            <div className="story-bar-track">
              <i
                style={{
                  height: `${value * growth}%`,
                  opacity: filtered && i < 4 ? 0.3 : 1,
                }}
              />
              <b style={{ height: `${value * 0.65 * growth}%` }} />
            </div>
            <small>{domain === "logistics" ? `W${i + 1}` : labels[i]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
function Donut({
  value = 68,
  label = "Direct",
  detail = "Revenue mix",
  secondary = "Partner",
  tertiary = "Other",
}) {
  const { progress, reduced } = useProductMotion();
  const growth = reduced ? 1 : Math.min(1, progress / 0.42);
  return (
    <div className="story-mix">
      <div className="story-donut">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="48" className="donut-base" />
          <circle
            cx="60"
            cy="60"
            r="48"
            className="donut-secondary"
            strokeDasharray="80 302"
            strokeDashoffset="-215"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            className="donut-value"
            strokeDasharray={`${value * 3.016 * growth} 302`}
          />
        </svg>
        <div>
          <strong>
            <AnimatedValue value={value + "%"} />
          </strong>
          <small>{label}</small>
        </div>
      </div>
      <div className="story-legend">
        <b>{detail}</b>
        <span>
          <i />
          {label}
        </span>
        <span>
          <i />
          {secondary}
        </span>
        <span>
          <i />
          {tertiary}
        </span>
      </div>
    </div>
  );
}
function Report({
  title = "Revenue overview",
  eyebrow = "PERFORMANCE · THIS QUARTER",
  stats,
  filtered = false,
  mix = 68,
  chartTitle = "Revenue over time",
  note = "Updated just now · All sources synced",
}) {
  const { domain } = useProductMotion();
  const distribution = {
    logistics: {
      title: "Dispatch by route",
      label: "Mumbai",
      detail: "Dispatch mix",
      secondary: "Pune",
      tertiary: "Delhi",
    },
    erp: {
      title: "Spend allocation",
      label: "Equipment",
      detail: "Budget mix",
      secondary: "Infrastructure",
      tertiary: "Operations",
    },
  }[domain] || {
    title: "Channel breakdown",
    label: "Direct",
    detail: "Revenue mix",
    secondary: "Partner",
    tertiary: "Other",
  };
  return (
    <>
      <Title eyebrow={eyebrow} action="Export report">
        {title}
      </Title>
      <Stats
        items={
          stats || [
            ["Total revenue", "$128,400", "+18.6% this quarter"],
            ["Open pipeline", "$246,800", "24 active opportunities"],
            ["Win rate", "68%", "+8.2% this quarter"],
          ]
        }
      />
      <ReportHero title={chartTitle} filtered={filtered} />
      <div className="story-report-grid">
        <div className="story-card">
          <div className="story-card-heading">
            <b>{chartTitle}</b>
            <span className="story-filter">
              {filtered ? "Enterprise" : "All segments"}
              <SlidersHorizontal size={12} />
            </span>
          </div>
          <Bars
            filtered={filtered}
            values={filtered ? [28, 40, 38, 58, 70, 64, 89, 96] : undefined}
          />
          <div className="story-chart-key">
            <span>● Current period</span>
            <span>● Previous period</span>
          </div>
        </div>
        <div className="story-card">
          <div className="story-card-heading">
            <b>{distribution.title}</b>
            <MoreHorizontal size={16} />
          </div>
          <Donut value={mix} {...distribution} />
        </div>
      </div>
      <DashboardDetails filtered={filtered} />
      <div className="story-note">
        <CheckCircle2 size={15} />
        {note}
      </div>
    </>
  );
}
function FileView({ name, title, subtitle, lines, total, approved = false }) {
  return (
    <div className="story-file">
      <div className="story-file-toolbar">
        <FileText size={16} />
        {name}
        <span>1 / 1</span>
      </div>
      <div className="story-paper">
        <div className="story-paper-brand">
          {title}
          <span>DOCUMENT</span>
        </div>
        <p>{subtitle}</p>
        {lines.map(([a, b]) => (
          <div className="story-paper-line" key={a}>
            <span>{a}</span>
            <b>{b}</b>
          </div>
        ))}
        <div className="story-paper-total">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
        <div className="story-signature">
          {approved ? (
            <Badge>Approved & recorded</Badge>
          ) : (
            <>
              <span>Prepared by Operations</span>
              <span className="story-sign">A. Morgan</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function CRM({ phase }) {
  const { progress } = useProductMotion();
  const won = phase === 3 && progress > 0.42;
  if (phase === 4)
    return (
      <Report
        stats={[
          ["Total revenue", "$128,400", "$36,000 from Northwind"],
          ["Open pipeline", "$84,800", "4 active opportunities"],
          ["Won deals", "2", "Northwind + Paper & Co."],
        ]}
        note="Northwind signed · Forecast and revenue report updated"
      />
    );
  if (phase === 2)
    return (
      <FileView
        name="Northwind — Proposal.pdf"
        title="ORBIT / PROPOSAL"
        subtitle="Prepared for Northwind Freight · Enterprise workspace"
        lines={[
          ["Platform implementation", "$18,000"],
          ["Workflow integrations", "$12,000"],
          ["Onboarding & support", "$6,000"],
        ]}
        total="$36,000"
      />
    );
  if (phase === 1)
    return (
      <>
        <Title eyebrow="DEALS / NORTHWIND FREIGHT" action="Create proposal">
          A conversation becomes an opportunity.
        </Title>
        <div className="story-detail-grid">
          <div className="story-card">
            <div className="story-person">
              <span>NW</span>
              <div>
                <h5>Northwind Freight</h5>
                <p>Enterprise platform · Sarah Chen</p>
              </div>
            </div>
            <div className="story-big-value">
              $36,000 <Badge tone="purple">Qualified</Badge>
            </div>
            <div className="story-fields">
              <span>
                Deal owner<b>Alex Morgan</b>
              </span>
              <span>
                Expected close<b>28 September</b>
              </span>
              <span>
                Next step<b>Send implementation proposal</b>
              </span>
            </div>
          </div>
          <div className="story-card">
            <b>Activity timeline</b>
            <div className="story-timeline">
              <p>
                <i />
                Discovery call completed
                <small>Requirements and scope confirmed</small>
              </p>
              <p>
                <i />
                Decision maker connected
                <small>Sarah Chen · Operations director</small>
              </p>
              <p>
                <i />
                Proposal requested
                <small>Include integrations and onboarding</small>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <Title eyebrow="SALES WORKSPACE / DEALS" action="New deal">
        A clearer path to closed.
      </Title>
      <div className="story-board-summary">
        <span>
          <b>{won ? "$84,800" : "$120,800"}</b> open pipeline
        </span>
        <span>
          <Users size={14} /> Sales team{" "}
          <span className="story-avatars">AM · SC · JL</span>
        </span>
      </div>
      <div className="film-board-toolbar">
        <div>
          <b>Board view</b>
          <span>Activity</span>
          <span>Forecast</span>
        </div>
        <span>
          <SlidersHorizontal size={12} /> All owners{" "}
          <span className="film-filter-count">3</span>
        </span>
      </div>
      <div className="story-board">
        {["Qualified", "Proposal", "Won"].map((stage, i) => (
          <div className="story-column" key={stage}>
            <div className="story-column-title">
              <i />
              <b>{stage}</b>
              <span>
                {i === 0
                  ? won || phase === 3
                    ? 2
                    : 3
                  : i === 2
                    ? won
                      ? 2
                      : 1
                    : phase === 3 && !won
                      ? 3
                      : 2}
              </span>
            </div>
            {((phase === 0 && i === 0) ||
              (phase === 3 && i === (won ? 2 : 1))) && (
              <div className="story-deal story-featured" key="northwind">
                <span>ENTERPRISE</span>
                <h5>Northwind Freight</h5>
                <b>$36,000</b>
                <div>
                  Sarah Chen{" "}
                  <Badge tone={won ? "green" : "purple"}>
                    {won
                      ? "Signed"
                      : phase === 3
                        ? "Signature received"
                        : "Ready for proposal"}
                  </Badge>
                </div>
              </div>
            )}
            {(i === 0
              ? ["Acme Studio", "Vertex Labs"]
              : i === 1
                ? ["Luma Health", "Mono Systems"]
                : ["Paper & Co."]
            ).map((name, j) => (
              <div className="story-deal" key={name}>
                <span>{j ? "PLATFORM" : "GROWTH"}</span>
                <h5>{name}</h5>
                <b>{j ? "$18,400" : "$24,000"}</b>
                <div>
                  <span className="story-avatar">{name[0]}</span>
                  <small>
                    {i === 2 ? "Contract signed" : "Next activity tomorrow"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {won && (
        <div className="story-toast">
          <CheckCircle2 size={17} />
          <div>
            <b>Northwind moved to Won</b>
            <span>Contract signed · $36,000 added to revenue</span>
          </div>
        </div>
      )}
    </>
  );
}
function ERP({ phase }) {
  if (phase === 4)
    return (
      <Report
        title="Every purchase, reconciled."
        eyebrow="FINANCE / SPEND OVERVIEW"
        chartTitle="Monthly purchasing"
        stats={[
          ["Committed spend", "$84,200", "Within quarterly budget"],
          ["Approved orders", "28", "3 received this week"],
          ["Budget remaining", "$35,800", "29.8% available"],
        ]}
        mix={58}
        note="PO-204 received · Vendor bill matched to order and receipt"
      />
    );
  if (phase === 2)
    return (
      <FileView
        name="Apex Supply — Quote.pdf"
        title="APEX / QUOTATION"
        subtitle="Reference QT-882 · Valid for 30 days"
        lines={[
          ["Workstation kits × 12", "$14,400"],
          ["Installation & setup", "$600"],
          ["Delivery", "Included"],
        ]}
        total="$15,000"
      />
    );
  if (phase === 1 || phase === 3)
    return (
      <>
        <Title
          eyebrow={phase === 1 ? "PURCHASING / REQ-204" : "PURCHASING / PO-204"}
          action={phase === 1 ? "Review quote" : "View receipt"}
        >
          {phase === 1
            ? "Everything needed to approve."
            : "Approved. Ordered. Connected."}
        </Title>
        <div className="story-detail-grid">
          <div className="story-card">
            <Badge tone={phase === 1 ? "amber" : "green"}>
              {phase === 1 ? "Awaiting approval" : "Purchase order confirmed"}
            </Badge>
            <h5>Workspace expansion</h5>
            <p>12 workstation kits · Operations team</p>
            <div className="story-big-value">$15,000</div>
            <div className="story-fields">
              <span>
                Supplier<b>Apex Supply Co.</b>
              </span>
              <span>
                Budget code<b>OPS · Equipment</b>
              </span>
              <span>
                Delivery location<b>Mumbai HQ</b>
              </span>
            </div>
          </div>
          <div className="story-card">
            <b>{phase === 1 ? "Approval route" : "Order activity"}</b>
            <div className="story-timeline">
              <p>
                <i />
                Department review<small>Alex Morgan · Approved</small>
              </p>
              <p>
                <i />
                Finance check
                <small>
                  {phase === 1
                    ? "Budget available · Ready to approve"
                    : "Priya Shah · Approved"}
                </small>
              </p>
              <p>
                <i />
                {phase === 1
                  ? "Supplier quote attached"
                  : "Receipt created automatically"}
                <small>
                  {phase === 1
                    ? "QT-882.pdf · 124 KB"
                    : "WH / IN / 204 · Expected Friday"}
                </small>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <Title eyebrow="NEXUS / PURCHASING" action="New request">
        Good decisions start with clarity.
      </Title>
      <Stats
        items={[
          ["Pending approval", "04", "2 need your review"],
          ["Approved this week", "12", "$42,600 committed"],
          ["On-time suppliers", "96%", "+4% this month"],
        ]}
      />
      <Table
        heads={["Purchase request", "Supplier", "Amount", "Status"]}
        selected={0}
        rows={[
          [
            "REQ-204 · Workspace expansion",
            "Apex Supply",
            "$15,000",
            <Badge tone="amber">Review</Badge>,
          ],
          [
            "REQ-203 · Network equipment",
            "Vertex Systems",
            "$8,400",
            <Badge>Approved</Badge>,
          ],
          [
            "REQ-202 · Studio supplies",
            "Paper & Co.",
            "$2,600",
            <Badge>Received</Badge>,
          ],
        ]}
      />
    </>
  );
}
function Commerce({ phase }) {
  const { progress } = useProductMotion();
  const packed = phase === 2 && progress > 0.5;
  if (phase === 4)
    return (
      <Report
        title="From a first order to the next."
        eyebrow="ARC / SALES OVERVIEW"
        stats={[
          ["Gross sales", "$42,860", "+16.4% this month"],
          ["Orders fulfilled", "148", "Order #1048 included"],
          ["Returning customers", "32%", "+6.8% this month"],
        ]}
        mix={72}
        chartTitle="Sales performance"
        note="Order #1048 fulfilled · Customer notified with tracking"
      />
    );
  if (phase === 3)
    return (
      <FileView
        name="Shipping label — 1048.pdf"
        title="ARC / DISPATCH"
        subtitle="EXPRESS SHIPPING · Order #1048"
        lines={[
          ["Deliver to", "Maya Patel"],
          ["Destination", "Bengaluru, KA"],
          ["Parcel", "1 box · 1.2 kg"],
          ["Tracking", "ARC 1048 2091"],
        ]}
        total="Ready to ship"
        approved
      />
    );
  if (phase === 1 || phase === 2)
    return (
      <>
        <Title
          eyebrow="ORDERS / #1048"
          action={phase === 1 ? "Create fulfillment" : "Print label"}
        >
          {phase === 1
            ? "A new order. Every detail in place."
            : "Packed with care. Ready to go."}
        </Title>
        <div className="story-detail-grid">
          <div className="story-card">
            <div className="story-product">
              <div className="story-product-art">
                <Package size={46} />
              </div>
              <div>
                <small>ESSENTIAL COLLECTION</small>
                <h5>Everyday carry kit</h5>
                <p>Sand / Standard · Qty 1</p>
                <strong>$128.00</strong>
              </div>
            </div>
            <div className="story-fields">
              <span>
                Payment<Badge>Paid</Badge>
              </span>
              <span>
                Fulfillment
                <Badge tone={packed ? "green" : "amber"}>
                  {packed
                    ? "Items packed"
                    : phase === 2
                      ? "Packing in progress"
                      : "Unfulfilled"}
                </Badge>
              </span>
              <span>
                Shipping<b>Express · 2–3 days</b>
              </span>
            </div>
          </div>
          <div className="story-card">
            <b>{phase === 1 ? "Customer" : "Fulfillment checklist"}</b>
            {phase === 1 ? (
              <>
                <h5>Maya Patel</h5>
                <p>Bengaluru, Karnataka</p>
                <div className="story-note">
                  First order · Welcome email sent
                </div>
              </>
            ) : (
              <div className="story-timeline">
                <p>
                  <i />
                  Stock reserved<small>Mumbai warehouse · Bin A-12</small>
                </p>
                <p>
                  <i />
                  {progress > 0.5
                    ? "Item picked & packed"
                    : "Scanning item barcode…"}
                  <small>
                    {progress > 0.5
                      ? "1 of 1 items verified"
                      : "Checking SKU-104 against the order"}
                  </small>
                </p>
                <p>
                  <i />
                  {progress > 0.75
                    ? "Carrier selected"
                    : "Booking express pickup…"}
                  <small>
                    {progress > 0.75
                      ? "Express · Pickup at 16:00"
                      : "Matching available pickup slots"}
                  </small>
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  return (
    <>
      <Title eyebrow="ARC / ORDER MANAGEMENT" action="Create order">
        Every order, moving forward.
      </Title>
      <Stats
        items={[
          ["Today's sales", "$4,280", "18 orders placed"],
          ["To fulfill", "08", "1 new order just arrived"],
          ["Average order", "$238", "+12% this week"],
        ]}
      />
      <Table
        heads={["Order", "Customer", "Total", "Fulfillment"]}
        selected={0}
        rows={[
          [
            "#1048 · Just now",
            "Maya Patel",
            "$128.00",
            <Badge tone="amber">Unfulfilled</Badge>,
          ],
          [
            "#1047 · 10:24",
            "James Wilson",
            "$246.00",
            <Badge>Fulfilled</Badge>,
          ],
          ["#1046 · 09:58", "Sara Khan", "$182.00", <Badge>Fulfilled</Badge>],
        ]}
      />
    </>
  );
}
function Logistics({ phase }) {
  const { progress } = useProductMotion();
  const dispatched = phase === 3 && progress > 0.75;
  if (phase === 4)
    return (
      <Report
        title="A network that keeps moving."
        eyebrow="ATLAS / NETWORK OVERVIEW"
        stats={[
          ["Orders dispatched", "248", "+18% this week"],
          ["On-time delivery", "98.4%", "Above target by 3.4%"],
          ["Units available", "1,840", "Across 3 warehouses"],
        ]}
        mix={78}
        chartTitle="Weekly dispatch volume"
        note="TR-208 dispatched · Inventory synchronized across locations"
      />
    );
  if (phase === 2)
    return (
      <FileView
        name="Pick list — TR-208.pdf"
        title="ATLAS / PICK LIST"
        subtitle="Mumbai warehouse → Pune distribution · Priority transfer"
        lines={[
          ["SKU-104 · Carry kit", "24 units"],
          ["Storage location", "Zone A · Bin 12"],
          ["Reserved quantity", "24 / 24"],
          ["Assigned to", "Ravi Kumar"],
        ]}
        total="24 units"
        approved
      />
    );
  if (phase === 1 || phase === 3)
    return (
      <>
        <Title
          eyebrow="TRANSFERS / TR-208"
          action={phase === 1 ? "Open pick list" : "Track shipment"}
        >
          {phase === 1
            ? "The right stock. The right place."
            : "One movement. Complete visibility."}
        </Title>
        <div className="story-route">
          <div>
            <span className="story-location">
              <Package size={22} />
            </span>
            <small>ORIGIN</small>
            <h5>Mumbai</h5>
            <p>Main warehouse</p>
          </div>
          <div className="story-route-line">
            <i />
            <span>
              {phase === 1
                ? "24 units reserved"
                : dispatched
                  ? "Dispatched · ETA 14:30"
                  : "Preparing dispatch · Pune route"}
            </span>
            <ArrowRight size={20} />
          </div>
          <div>
            <span className="story-location">
              <Package size={22} />
            </span>
            <small>DESTINATION</small>
            <h5>Pune</h5>
            <p>Distribution center</p>
          </div>
        </div>
        <div className="story-logistics-steps">
          {["Reserved", "Picked", "Packed", "Dispatched"].map((s, i) => (
            <div
              className={
                (phase === 3 && progress > i * 0.25) || i === 0 ? "done" : ""
              }
              key={s}
            >
              <CheckCircle2 size={20} />
              <b>{s}</b>
              <span>
                {phase === 3 && progress > i * 0.25
                  ? ["09:41", "10:12", "10:26", "10:45"][i]
                  : i === 0
                    ? "09:41"
                    : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  return (
    <>
      <Title eyebrow="ATLAS / INVENTORY" action="Create transfer">
        Stock you can account for.
      </Title>
      <Stats
        items={[
          ["Available units", "1,864", "3 connected warehouses"],
          ["Reserved", "240", "Across 18 orders"],
          ["Low-stock alerts", "02", "Replenishment suggested"],
        ]}
      />
      <Table
        heads={["Product / SKU", "Location", "Available", "Status"]}
        selected={0}
        rows={[
          [
            "Carry kit · SKU-104",
            "Mumbai / A-12",
            "184",
            <Badge>In stock</Badge>,
          ],
          [
            "Desk organizer · SKU-206",
            "Pune / B-08",
            "12",
            <Badge tone="amber">Low stock</Badge>,
          ],
          [
            "Travel pouch · SKU-308",
            "Delhi / C-04",
            "320",
            <Badge>In stock</Badge>,
          ],
        ]}
      />
    </>
  );
}
const scenes = {
  websites: WebsiteExperience,
  crm: CRM,
  erp: ERP,
  analytics: DashboardExperience,
  commerce: Commerce,
  logistics: Logistics,
  automation: AIExperience,
};
export function SolutionStories({ time, capability, reduced = false }) {
  const stage = storyPhase(time),
    phase = stage,
    Scene = scenes[capability.id],
    AppIcon = capability.icon;
  const rootStage = productStages[capability.id][0];
  const isRoot = storyStages[capability.id][stage] === rootStage;
  const progress = reduced ? 1 : Math.min(1, (time - stage * 2240) / 2240);
  return (
    <ProductMotionContext.Provider
      value={{ progress, reduced, phase, domain: capability.id }}
    >
      <div
        className={`solution-story story-${capability.id}`}
        data-phase={stage}
        data-product-phase={phase}
        data-time={Math.round(time)}
        data-reduced={reduced}
      >
        <div className="story-appbar">
          <div>
            <span className="story-app-icon">
              <AppIcon size={17} />
            </span>
            <b>{capability.app}</b>
            <span className="story-workspace">
              Workspace <ChevronRight size={12} />
            </span>
          </div>
          <span className="story-search">
            <Search size={13} />
            Search anything <kbd>⌘ K</kbd>
          </span>
          <div>
            <Bell size={16} />
            <span className="story-avatar">AM</span>
          </div>
        </div>
        <div className="story-app-body">
          <nav className="story-nav">
            <div className="film-account">
              <span className="story-avatar">AM</span>
              <span>
                <b>Alex Morgan</b>
                <small>Workspace admin</small>
              </span>
            </div>
            <small className="film-nav-section">WORKSPACE</small>
            {sections[capability.id].map((label, i) => {
              const Icon = [LayoutDashboard, Folder, Users, Globe2][i];
              return (
                <div
                  className={
                    i === activeNav[capability.id][phase] ? "active" : ""
                  }
                  key={label}
                  title={label}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </div>
              );
            })}
            <div className="film-nav-projects">
              <small>PINNED PROJECTS</small>
              <span>
                <i />
                Quarterly review
              </span>
              <span>
                <i />
                Team workspace
              </span>
              <span>
                <i />
                Activity log <b>8</b>
              </span>
            </div>
            <span className="story-nav-bottom">
              <span className="story-dot" />
              All systems online
            </span>
          </nav>
          <main className="story-main">
            <div className="story-open-tabs">
              <span className={isRoot ? "active" : ""}>
                <LayoutDashboard size={13} />
                {rootStage}
              </span>
              {!isRoot && (
                <span
                  className="active"
                  key={storyStages[capability.id][stage]}
                >
                  <FileText size={13} />
                  {storyStages[capability.id][stage]}
                  <span>×</span>
                </span>
              )}
              <Plus size={13} />
            </div>
            <div className="film-scene-stack">
              <div
                key={`${capability.id}-${stage}`}
                className="film-scene-layer"
              >
                <ProductMotionContext.Provider
                  value={{ progress, reduced, phase, domain: capability.id }}
                >
                  <ProductViewport phase={phase} domain={capability.id}>
                    <Scene phase={phase} time={time} />
                  </ProductViewport>
                </ProductMotionContext.Provider>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProductMotionContext.Provider>
  );
}
