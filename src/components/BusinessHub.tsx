import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteMotion, Reveal } from "./MotionSystem";
import { Eyebrow, Icon, TextLink } from "./ui";

const systems = [
  {
    label: "Website",
    icon: "globe",
    href: "website-development",
    title: "A first impression. A connected next step.",
    description:
      "Bring your website inquiries into a clear customer journey, from the first visit to the right conversation.",
    metric: "Website inquiries",
    value: ["48", "192"],
    second: "Qualified inquiries",
    secondValue: ["16", "64"],
    chart: "Inquiries over time",
    items: [
      "Discovery call requested",
      "Product question received",
      "Project brief prepared",
    ],
    insight:
      "Connect your website to a considered follow-up process. Keep the context with every new inquiry.",
  },
  {
    label: "CRM",
    icon: "users",
    href: "crm-development",
    title: "Every relationship, with the full picture.",
    description:
      "Keep customer conversations, opportunities, and next steps together so your team knows where to focus.",
    metric: "Open opportunities",
    value: ["24", "86"],
    second: "Follow-ups to review",
    secondValue: ["8", "21"],
    chart: "Pipeline activity",
    items: [
      "Northstar · Proposal review",
      "Bloom & Co. · Discovery call",
      "Waypoint · New opportunity",
    ],
    insight:
      "Bring the customer history into view before the next conversation. Your team decides how to move it forward.",
  },
  {
    label: "ERP",
    icon: "layers",
    href: "erp-development",
    title: "The whole operation. In sync.",
    description:
      "Connect requests, approvals, resources, and shared records in a workspace built around your actual operations.",
    metric: "Requests processed",
    value: ["126", "504"],
    second: "Awaiting review",
    secondValue: ["7", "19"],
    chart: "Operational activity",
    items: [
      "Purchase request · Ready for review",
      "Resource plan · Updated",
      "Vendor record · Connected",
    ],
    insight:
      "A shared operational view helps teams see the next step and who owns it. Review the important decisions together.",
  },
  {
    label: "Analytics",
    icon: "chart",
    href: "business-analytics",
    title: "Less searching. More understanding.",
    description:
      "Bring the numbers that matter into one clear view, with the detail behind every decision close at hand.",
    metric: "Sample revenue",
    value: ["₹6.2L", "₹24.8L"],
    second: "Connected sources",
    secondValue: ["4", "4"],
    chart: "Business performance",
    items: [
      "Sales summary · Ready",
      "Operations report · Updated",
      "Revenue breakdown · Available",
    ],
    insight:
      "Start with the question, then explore the context. Make reporting a useful part of your everyday decisions.",
  },
  {
    label: "Commerce",
    icon: "bag",
    href: "ecommerce-development",
    title: "From the first click to the final mile.",
    description:
      "Connect the storefront to payments, orders, and fulfillment for a buying journey that keeps moving.",
    metric: "Orders received",
    value: ["248", "992"],
    second: "Ready to dispatch",
    secondValue: ["18", "42"],
    chart: "Order activity",
    items: [
      "Order #1048 · Payment confirmed",
      "Order #1049 · Stock allocated",
      "Order #1050 · Ready to pack",
    ],
    insight:
      "Connect the customer experience to what happens behind the scenes. Make every handoff easier to follow.",
  },
  {
    label: "Logistics",
    icon: "box",
    href: "inventory-logistics",
    title: "Everything moving in the right direction.",
    description:
      "Keep inventory, warehouse activity, and shipment progress in the same picture, with clear next steps for your team.",
    metric: "Shipments tracked",
    value: ["176", "704"],
    second: "Ready for pickup",
    secondValue: ["12", "38"],
    chart: "Fulfillment activity",
    items: [
      "Shipment #208 · Picked",
      "Shipment #209 · Packed",
      "Shipment #210 · Ready for pickup",
    ],
    insight:
      "Turn warehouse updates into a shared operational view. Help the right information reach the right team.",
  },
];
const paths = [
  "M0 145C30 145 40 120 70 125S120 80 150 95S205 65 240 75S285 25 320 40S375 15 420 20",
  "M0 150C35 150 50 90 85 100S130 125 165 75S220 95 250 48S305 80 340 30S380 40 420 8",
];
export function BusinessHub() {
  const [active, setActive] = useState(3);
  const [period, setPeriod] = useState(1);
  const { disabled } = useSiteMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const system = systems[active];
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % systems.length
        : event.key === "ArrowLeft"
          ? (index + systems.length - 1) % systems.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? systems.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <section className="business-hub" aria-labelledby="hub-title">
      <div className="container hub-container">
        <Reveal className="hub-heading">
          <Eyebrow>CONNECTED BY DESIGN</Eyebrow>
          <h2 id="hub-title">
            Everything clicks.
            <br />
            <span>When everything connects.</span>
          </h2>
          <p>
            Your website, your customers, your operations.
            <br />
            One thoughtfully connected experience.
          </p>
        </Reveal>
        <div
          className="hub-system-tabs"
          role="tablist"
          aria-label="Explore connected business systems"
        >
          {systems.map((item, index) => (
            <button
              type="button"
              key={item.label}
              role="tab"
              ref={(el) => {
                tabs.current[index] = el;
              }}
              id={`hub-tab-${index}`}
              aria-selected={index === active}
              aria-controls="hub-panel"
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => navigate(event, index)}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="hub-dashboard" data-image-reveal>
          <div className="hub-window-bar">
            <div className="hub-window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>
              <Icon name="layers" size={15} /> SimpTech / business workspace
            </span>
            <small>INTERACTIVE CONCEPT</small>
          </div>
          <div className="hub-dashboard-body">
            <aside className="hub-sidebar" aria-hidden="true">
              <span className="hub-sidebar-logo">S.</span>
              {["layout", "users", "chart", "layers", "workflow"].map(
                (icon, index) => (
                  <span key={icon} className={index === 0 ? "selected" : ""}>
                    <Icon name={icon} size={18} />
                  </span>
                ),
              )}
              <span className="hub-sidebar-avatar">ST</span>
            </aside>
            <div
              className="hub-main"
              id="hub-panel"
              role="tabpanel"
              aria-labelledby={`hub-tab-${active}`}
              tabIndex={0}
            >
              <div className="hub-main-heading">
                <div>
                  <span>YOUR BUSINESS, IN FOCUS</span>
                  <h3>
                    {system.label} overview<small>↗</small>
                  </h3>
                </div>
                <div
                  className="hub-period"
                  role="group"
                  aria-label="Sample reporting period"
                >
                  {["7 days", "30 days"].map((label, index) => (
                    <button
                      type="button"
                      key={label}
                      aria-pressed={period === index}
                      onClick={() => setPeriod(index)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${active}-${period}`}
                  initial={disabled ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: disabled ? 0 : -6 }}
                  transition={{ duration: disabled ? 0 : 0.2 }}
                >
                  <div className="hub-metrics">
                    <div>
                      <span>{system.metric}</span>
                      <strong data-hub-metric>{system.value[period]}</strong>
                      <small>
                        Illustrative {period === 0 ? "weekly" : "monthly"} data
                      </small>
                      <div className="hub-mini-bars" aria-hidden="true">
                        {[30, 48, 38, 60, 45, 72, 62, 85, 75, 95].map(
                          (height, index) => (
                            <i key={index} style={{ height: `${height}%` }} />
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <span>{system.second}</span>
                      <strong>{system.secondValue[period]}</strong>
                      <small>Sample workspace</small>
                      <Icon name={system.icon} size={35} />
                    </div>
                    <div className="hub-connected-metric">
                      <span>Made to work together</span>
                      <strong>One workspace.</strong>
                      <small>Your business. Your way.</small>
                      <div aria-hidden="true">
                        <Icon name="globe" />
                        <Icon name="layers" />
                        <Icon name="sparkle" />
                      </div>
                    </div>
                  </div>
                  <div className="hub-panels">
                    <div className="hub-chart">
                      <div>
                        <h4>{system.chart}</h4>
                        <span>
                          <i /> Sample activity
                        </span>
                      </div>
                      <div className="hub-chart-plot">
                        <div className="hub-chart-axis">
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                        </div>
                        <svg
                          viewBox="0 0 420 180"
                          preserveAspectRatio="none"
                          role="img"
                          aria-label={`Illustrative ${system.chart.toLowerCase()} trend for ${period === 0 ? "7" : "30"} days`}
                        >
                          <defs>
                            <linearGradient
                              id="hub-fill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop stopColor="#8a6cff" stopOpacity=".4" />
                              <stop
                                offset="1"
                                stopColor="#8a6cff"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 15H420M0 55H420M0 95H420M0 135H420M0 175H420"
                            stroke="#29243b"
                            fill="none"
                          />
                          <path
                            d={`${paths[period]}L420 180H0Z`}
                            fill="url(#hub-fill)"
                          />
                          <motion.path
                            d={paths[period]}
                            stroke="#a18bff"
                            strokeWidth="2.5"
                            fill="none"
                            initial={disabled ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: disabled ? 0 : 0.7 }}
                          />
                        </svg>
                      </div>
                      <div className="hub-chart-labels">
                        {(period === 0
                          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                          : ["Week 1", "Week 2", "Week 3", "Week 4"]
                        ).map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="hub-assistant">
                      <div className="hub-ai-orb" aria-hidden="true">
                        <Icon name="sparkle" size={27} />
                        <i />
                      </div>
                      <span>THE INTELLIGENCE LAYER</span>
                      <h4>A clearer next move.</h4>
                      <p>{system.insight}</p>
                      <a href="/services/ai-engine-development">
                        Explore AI systems <Icon name="diagonal" size={14} />
                      </a>
                    </div>
                  </div>
                  <div className="hub-activity">
                    <div>
                      <strong>In your workspace</strong>
                      <span>SAMPLE ACTIVITY</span>
                    </div>
                    {system.items.map((item, index) => (
                      <div key={item}>
                        <span className="hub-activity-icon">
                          <Icon
                            name={
                              index === 0
                                ? "check"
                                : index === 1
                                  ? "layers"
                                  : "workflow"
                            }
                            size={13}
                          />
                        </span>
                        <span>{item}</span>
                        <small>Illustrative</small>
                        <Icon name="next" size={13} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="hub-dashboard-footer">
            <span>
              <i /> CONNECTED AROUND YOUR BUSINESS
            </span>
            <span>ORIGINAL CONCEPT / SAMPLE DATA</span>
          </div>
        </div>
        <div className="hub-description">
          <div>
            <h3>{system.title}</h3>
            <p>{system.description}</p>
          </div>
          <TextLink href={`/services/${system.href}`}>
            Explore {system.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
