import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { services } from "../data/content";
import { SystemPreview } from "./EnterpriseVisuals";
import { Reveal, useSiteMotion } from "./MotionSystem";
import { Eyebrow, Icon, TextLink } from "./ui";

export function SolutionExplorer() {
  const [active, setActive] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { disabled } = useSiteMotion();
  const service = services[active];
  function navigate(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next;
    if (["ArrowDown", "ArrowRight"].includes(e.key))
      next = (i + 1) % services.length;
    else if (["ArrowUp", "ArrowLeft"].includes(e.key))
      next = (i + services.length - 1) % services.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = services.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <section className="solutions-showcase" id="solutions">
      <div className="container">
        <Reveal className="editorial-section-heading">
          <Eyebrow>SIX CAPABILITIES. ONE DEVELOPMENT PARTNER.</Eyebrow>
          <div>
            <h2>
              Good software starts
              <br />
              <span className="quiet-text">with your business.</span>
            </h2>
            <p>
              Exceptional websites. Connected operations. One development
              partner who sees the whole picture.
            </p>
          </div>
        </Reveal>
        <div className="solution-explorer">
          <div
            className="solution-tabs"
            role="tablist"
            aria-label="Explore our solutions"
            aria-orientation="vertical"
          >
            {services.map((s, i) => (
              <button
                key={s.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`solution-tab-${i}`}
                aria-selected={active === i}
                aria-controls="solution-panel"
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => navigate(e, i)}
              >
                <span className="solution-index">0{i + 1}</span>
                <span>{s.title}</span>
                <Icon name="diagonal" size={22} />
              </button>
            ))}
          </div>
          <div
            className="solution-stage"
            id="solution-panel"
            role="tabpanel"
            aria-labelledby={`solution-tab-${active}`}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={service.slug}
                initial={disabled ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: disabled ? 0 : -8 }}
                transition={{ duration: disabled ? 0 : 0.24 }}
              >
                <div className={`solution-product visual-${service.visual}`}>
                  <div className="product-exploration-label">
                    <span>
                      <i />
                      PRODUCT EXPLORATION
                    </span>
                    <span>DESIGNED BY SIMPTECH ↗</span>
                  </div>
                  <div className="solution-product-window">
                    <SystemPreview mode={service.visual} />
                  </div>
                </div>
                <div className="solution-stage-copy">
                  <div>
                    <h3>{service.short}</h3>
                    <p>{service.problem}</p>
                  </div>
                  <TextLink href={`/services/${service.slug}`}>
                    Explore {service.label}
                  </TextLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="solution-bottom-note">
          <span>FROM YOUR FIRST IMPRESSION TO YOUR EVERYDAY OPERATIONS.</span>
          <TextLink href="/services">All our capabilities</TextLink>
        </div>
      </div>
    </section>
  );
}

const connections = [
  {
    label: "Website",
    icon: "globe",
    title: "A connected customer journey.",
    text: "Your website captures the opportunity. Your CRM gives it context. Your team knows exactly where the relationship stands.",
    flow: ["Website inquiry", "CRM pipeline", "Customer history"],
  },
  {
    label: "CRM",
    icon: "users",
    title: "Relationships, with all the context.",
    text: "Bring contacts, conversations, and opportunities into one place. Give every handoff the context your team needs to keep the relationship moving.",
    flow: ["Lead captured", "Owner assigned", "Next step clear"],
  },
  {
    label: "ERP",
    icon: "layers",
    title: "The whole operation. One shared view.",
    text: "Purchasing, resources, approvals, and finance work from a common record. Less reconciliation between tools. More clarity across your business.",
    flow: ["Request created", "Approval routed", "Records connected"],
  },
  {
    label: "Analytics",
    icon: "chart",
    title: "Decisions with a clearer picture.",
    text: "Bring data from your business systems into focused dashboards. Understand the performance, spot the exceptions, and decide what happens next.",
    flow: ["Data connected", "Metrics aligned", "Decisions informed"],
  },
  {
    label: "Commerce",
    icon: "bag",
    title: "From the first click to the final mile.",
    text: "Connect the storefront to orders, payments, and fulfillment. A considered customer experience continues long after the checkout.",
    flow: ["Order received", "Stock allocated", "Delivery arranged"],
  },
  {
    label: "Logistics",
    icon: "box",
    title: "Everything moving in the right direction.",
    text: "Keep inventory, warehouse activity, and shipment progress in the same picture. Help your operations team act on what is happening now.",
    flow: ["Stock received", "Order picked", "Shipment tracked"],
  },
];
export function ConnectedSystems() {
  const [active, setActive] = useState(2);
  const selected = connections[active];
  return (
    <section className="connected-section">
      <div className="container">
        <div className="connected-top">
          <Eyebrow light>THE SPACE BETWEEN YOUR SYSTEMS</Eyebrow>
          <span>
            <i />
            BUILT TO WORK TOGETHER
          </span>
        </div>
        <div className="connected-layout">
          <Reveal className="connected-copy">
            <h2>
              Separate systems.
              <br />
              <span>Shared possibilities.</span>
            </h2>
            <p>
              Your customers. Your people. Your operations. We build the
              connections that turn separate tools into a stronger business.
            </p>
            <TextLink href="/approach">Discover our approach</TextLink>
          </Reveal>
          <div className="connected-interactive">
            <div className="system-map" aria-hidden="true">
              <svg viewBox="0 0 600 400" preserveAspectRatio="none">
                <path d="M300 200V70H150M300 200V70H450M300 200H80M300 200H520M300 200V330H150M300 200V330H450" />
                {[
                  "M300 200V70H150",
                  "M300 200V70H450",
                  "M300 200H520",
                  "M300 200V330H450",
                  "M300 200V330H150",
                  "M300 200H80",
                ].map((path, i) => (
                  <path
                    key={path}
                    d={path}
                    className={active === i ? "map-active" : "map-hidden"}
                  />
                ))}
              </svg>
              <div className="system-map-core">
                <Icon name="layers" size={26} />
                <strong>One business.</strong>
                <span>Connected by design.</span>
              </div>
            </div>
            <div
              className="orbit-service-buttons"
              aria-label="Explore connected business systems"
            >
              {connections.map((c, i) => (
                <button
                  className={`orbit-node node-${i} ${active === i ? "is-active" : ""}`}
                  key={c.label}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <Icon name={c.icon} size={17} />
                  {c.label}
                  <span />
                </button>
              ))}
            </div>
            <p className="orbit-instruction">
              <Icon name="plus" size={12} /> SELECT A SYSTEM. SEE THE
              CONNECTION.
            </p>
          </div>
        </div>
        <div className="connection-detail" aria-live="polite">
          <span className="connection-number">0{active + 1}</span>
          <div>
            <h3>{selected.title}</h3>
            <p>{selected.text}</p>
          </div>
          <div className="connection-flow">
            {selected.flow.map((step, i) => (
              <span key={step}>
                {step}
                {i < 2 && <Icon name="arrow" size={15} />}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const work = [
  {
    name: "Orbit",
    slug: "orbit-workspace",
    tag: "CRM / CUSTOMER EXPERIENCE",
    title: "Make every relationship count.",
    mode: "crm",
    className: "project-crm",
  },
  {
    name: "Meridian",
    slug: "meridian-analytics",
    tag: "DASHBOARDS / BUSINESS INTELLIGENCE",
    title: "Your data. A sharper perspective.",
    mode: "analytics",
    className: "project-analytics",
  },
];
export function ProjectShowreel() {
  return (
    <section className="selected-work">
      <div className="container">
        <Reveal className="work-section-heading">
          <div>
            <Eyebrow>SELECTED EXPLORATIONS</Eyebrow>
            <h2>
              A closer look at
              <br />
              <span className="quiet-text">what’s possible.</span>
            </h2>
          </div>
          <TextLink href="/work">View all projects</TextLink>
        </Reveal>
        <div className="showreel-grid">
          {work.map((p, i) => (
            <Reveal
              className={`showreel-project ${p.className}`}
              key={p.slug}
              delay={i === 1 ? 0.12 : 0}
            >
              <a
                href={`/work/${p.slug}`}
                className="showreel-image"
                aria-label={`Explore ${p.name} concept`}
              >
                <div className="showreel-image-header">
                  <span>{p.name}</span>
                  <small>PRODUCT CONCEPT / 0{i + 1}</small>
                </div>
                <img
                  className="showreel-backdrop"
                  src={
                    i === 0
                      ? "/media/mountain-poster.webp"
                      : "/images/connected-architecture.webp"
                  }
                  alt=""
                  loading="lazy"
                  width="1280"
                  height="720"
                />
                <div className="showreel-screen">
                  <SystemPreview mode={p.mode} />
                </div>
                <span className="showreel-open">
                  <Icon name="diagonal" size={25} />
                </span>
              </a>
              <div className="showreel-caption">
                <div>
                  <span>{p.tag}</span>
                  <h3>
                    <a href={`/work/${p.slug}`}>{p.title}</a>
                  </h3>
                </div>
                <Icon name="diagonal" size={25} />
              </div>
            </Reveal>
          ))}
        </div>
        <p className="work-transparency">
          <Icon name="plus" size={16} /> Original product explorations.
          Illustrative brands and data. A window into how we think and build.
        </p>
      </div>
    </section>
  );
}
