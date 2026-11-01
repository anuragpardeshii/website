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
          <Eyebrow>YOUR BUSINESS. OUR FULL ATTENTION.</Eyebrow>
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
                      ? "/media/intelligence-sculpture.webp"
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
