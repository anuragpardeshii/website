import { createContext, useContext, useEffect, useId, useRef } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

export const ProductMotionContext = createContext({
  progress: 1,
  reduced: true,
  phase: 4,
  domain: "analytics",
});
export const useProductMotion = () => useContext(ProductMotionContext);
const clamp = (n) => Math.max(0, Math.min(1, n));
const ease = (n) => {
  const x = clamp(n);
  return x * x * (3 - 2 * x);
};

export function AnimatedValue({ value }) {
  // Metrics reflect the current application state, not decorative count-ups.
  return String(value);
}
const seriesA = [
  33, 48, 39, 64, 53, 76, 62, 72, 49, 66, 81, 69, 83, 74, 95, 88,
];
const seriesB = [
  24, 29, 23, 38, 34, 49, 38, 52, 32, 47, 57, 46, 59, 52, 67, 62,
];
export function TrendChart({
  compact = false,
  variant = 0,
  label = "Revenue performance",
  filtered = false,
}) {
  const { progress, reduced, domain } = useProductMotion();
  const uid = useId().replaceAll(":", "");
  const reveal = reduced ? 1 : ease(progress / 0.42);
  const data = seriesA.map((v, i) =>
    Math.max(
      12,
      Math.min(
        97,
        v +
          (variant ? Math.sin(i * 1.7 + variant) * 13 : 0) -
          (filtered && i < 7 ? 10 : 0),
      ),
    ),
  );
  const path = (arr) =>
    arr
      .map(
        (v, i) =>
          `${i ? "L" : "M"}${((i * 600) / (arr.length - 1)).toFixed(1)},${(170 - v * 1.5).toFixed(1)}`,
      )
      .join(" ");
  const active = Math.min(15, Math.floor(clamp((progress - 0.25) / 0.6) * 15));
  const px = active * 40,
    py = 170 - data[active] * 1.5;
  return (
    <div className={`film-trend ${compact ? "is-compact" : ""}`}>
      <svg
        viewBox="0 0 600 190"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--story-accent)"
              stopOpacity=".17"
            />
            <stop
              offset="100%"
              stopColor="var(--story-accent)"
              stopOpacity="0"
            />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <rect width={600 * reveal} height="190" />
          </clipPath>
        </defs>
        {[20, 70, 120, 170].map((y) => (
          <line
            key={y}
            x1="0"
            x2="600"
            y1={y}
            y2={y}
            className="film-gridline"
          />
        ))}
        <g clipPath={`url(#${uid}-clip)`}>
          <path d={`${path(data)} L600,180 L0,180 Z`} fill={`url(#${uid})`} />
          <path d={path(seriesB)} className="film-line comparison" />
          <path d={path(data)} className="film-line current" />
        </g>
        {!compact && progress > 0.35 && progress < 0.9 && !reduced && (
          <g>
            <line x1={px} x2={px} y1="12" y2="180" className="film-crosshair" />
            <circle cx={px} cy={py} r="5" className="film-chart-point" />
            <g
              transform={`translate(${Math.min(465, Math.max(4, px - 55))},${Math.max(0, py - 47)})`}
            >
              <rect width="118" height="32" rx="6" fill="#22283c" />
              <text
                x="59"
                y="20"
                textAnchor="middle"
                fill="white"
                fontSize="11"
              >
                {new Date(
                  Date.UTC(2026, 0, 1 + Math.round((active * 89) / 15)),
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}{" "}
                ·{" "}
                {domain === "logistics"
                  ? `${Math.round(data[active] * 3)} units`
                  : `$${Math.round(data[active] * 146).toLocaleString()}`}
              </text>
            </g>
          </g>
        )}
      </svg>
      {!compact && (
        <div className="film-chart-dates">
          <span>Jan 01</span>
          <span>Jan 15</span>
          <span>Feb 01</span>
          <span>Feb 15</span>
          <span>Mar 01</span>
          <span>Mar 31</span>
        </div>
      )}
    </div>
  );
}
export function DashboardDetails({ filtered = false }) {
  const { domain } = useProductMotion();
  const names = {
    crm: ["Northwind Freight", "Luma Health", "Vertex Labs"],
    analytics: ["Enterprise", "Growth", "Starter"],
    erp: ["Equipment", "Infrastructure", "Operations"],
    commerce: ["Everyday carry", "Studio essentials", "Travel collection"],
    logistics: ["Mumbai", "Pune", "Delhi"],
  };
  const rows = names[domain] || names.analytics;
  const metrics = {
    crm: [
      ["Lead conversion", "24.8%", "+4.2%", 0],
      ["Average deal", "$28,400", "+12.6%", 1],
      ["Forecast accuracy", "92.6%", "+4.8%", 2],
    ],
    analytics: [
      ["Recurring revenue", "$64,200", "+18.2%", 0],
      ["Revenue per account", "$2,057", "+12.6%", 1],
      ["Net retention", "112.4%", "+4.8%", 2],
    ],
    erp: [
      ["Budget utilization", "70.2%", "+3.2%", 0],
      ["Supplier reliability", "96.4%", "+2.6%", 1],
      ["Matched invoices", "98.2%", "+4.8%", 2],
    ],
    commerce: [
      ["Checkout conversion", "6.84%", "+1.2%", 0],
      ["Average order", "$284", "+12.6%", 1],
      ["Repeat purchases", "32.6%", "+4.8%", 2],
    ],
    logistics: [
      ["Pick accuracy", "99.4%", "+1.2%", 0],
      ["Orders per hour", "284", "+12.6%", 1],
      ["On-time dispatch", "98.4%", "+4.8%", 2],
    ],
  };

  return (
    <div className="film-dashboard-details">
      <div className="film-mini-grid">
        {(metrics[domain] || metrics.analytics).map(
          ([label, value, change, variant]) => (
            <div className="film-mini-card" key={label}>
              <div>
                <span>{label}</span>
                <span className="film-trend-up">
                  <ArrowUpRight size={11} />
                  {change}
                </span>
              </div>
              <strong>
                <AnimatedValue value={value} />
              </strong>
              <TrendChart compact variant={variant} />
              <small>
                Current period <i /> Previous period
              </small>
            </div>
          ),
        )}
      </div>
      <div className="film-records">
        <div className="film-records-heading">
          <div>
            <b>
              {domain === "logistics"
                ? "Warehouse performance"
                : domain === "erp"
                  ? "Spend by category"
                  : domain === "commerce"
                    ? "Best-selling collections"
                    : "Performance by segment"}
            </b>
            <small>A closer look at what drives the result</small>
          </div>
          <span>
            View all <ArrowUpRight size={12} />
          </span>
        </div>
        {rows.map((name, i) => (
          <div className="film-record" key={name}>
            <span className={`film-record-avatar avatar-${i}`}>
              {name.slice(0, 2).toUpperCase()}
            </span>
            <b>{name}</b>
            <span className="film-record-bar">
              <i style={{ width: `${84 - i * 21}%` }} />
            </span>
            <strong>
              {
                (domain === "logistics"
                  ? ["1,240 units", "860 units", "640 units"]
                  : ["$42,800", "$28,400", "$15,200"])[i]
              }
            </strong>
            <span className="film-trend-up">+{[24.8, 18.2, 12.4][i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ReportHero({ title, filtered }) {
  return (
    <div className="film-report-hero">
      <div className="film-report-summary">
        <small>PERFORMANCE INDEX</small>
        <strong>
          <AnimatedValue value={filtered ? "124.8" : "118.6"} />
          <span>pts</span>
        </strong>
        <span className="film-trend-up">
          <ArrowUpRight size={14} /> {filtered ? "+24.8%" : "+18.6%"} vs.
          previous period
        </span>
        <div className="film-summary-divider" />
        <div>
          <span>On track</span>
          <b>94%</b>
        </div>
        <div className="film-target-meter">
          <i />
        </div>
        <small>Quarterly target · Updated just now</small>
      </div>
      <div className="film-report-chart">
        <div className="film-chart-heading">
          <div>
            <b>{title}</b>
            <small>Current period vs. previous period</small>
          </div>
          <span className="story-filter">
            {filtered ? "Enterprise" : "All segments"}
            <ChevronDown size={12} />
          </span>
        </div>
        <TrendChart filtered={filtered} />
        <div className="film-chart-legend">
          <span>
            <i />
            Current period
          </span>
          <span>
            <i />
            Previous period
          </span>
          <span>Jan 01 – Mar 31</span>
        </div>
      </div>
    </div>
  );
}
// A fixed camera; long content scrolls only inside the application viewport.
export function ProductViewport({ children, phase, domain }) {
  const { progress, reduced } = useProductMotion();
  const viewport = useRef(null);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const limit = Math.max(0, el.scrollHeight - el.clientHeight);
    el.scrollTop = reduced ? 0 : limit * ease((progress - 0.45) / 0.45);
  }, [progress, reduced, phase, domain]);
  return (
    <div
      className={`film-viewport ${reduced ? "is-still" : ""}`}
      data-camera="still"
    >
      <div
        className={`story-page ${domain === "automation" ? "is-chat" : ""}`}
        ref={viewport}
        data-scroll-demo="true"
      >
        <div className="film-page-content">{children}</div>
      </div>
    </div>
  );
}
