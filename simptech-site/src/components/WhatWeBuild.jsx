import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Eyebrow, TextLink } from "./ui";
import { useSiteMotion, Reveal } from "./MotionSystem";
import { buildCapabilities } from "./build-capabilities";
import { buildDemos, phaseAt } from "./BuildDemos";
import { solutionCapabilities } from "./solution-capabilities";
import { SolutionDemo } from "./SolutionDemo";
import "./what-we-build.css";

// Each selection plays one short story, then rests. Device motion preferences apply.
const duration = 4600;
const timeline = 14999;
const titles = {
  websites: "Websites & experiences",
  crm: "CRM platforms",
  erp: "Enterprise systems",
  analytics: "Data & analytics",
  commerce: "Digital commerce",
  logistics: "Inventory & logistics",
  automation: "AI & automation",
};
const headlines = {
  websites: "A first impression. Built to last.",
  crm: "Every lead. A little more potential.",
  erp: "The whole business, in sync.",
  analytics: "Your data. A clearer direction.",
  commerce: "From discovery to doorstep.",
  logistics: "Every move, accounted for.",
  automation: "Less busywork. More possibility.",
};
export function WhatWeBuild({ workPage = false }) {
  const capabilities = workPage ? buildCapabilities : solutionCapabilities;
  const [active, setActive] = useState(0);
  const [time, setTime] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const host = useRef(null);
  const tabs = useRef([]);
  const hoverTimer = useRef(null);
  const elapsed = useRef(0);
  const id = useId();
  const { disabled } = useSiteMotion();
  const inView = useInView(host, { amount: 0.2 });
  const running = inView && pageVisible && !disabled && time < duration;
  const sceneTime = disabled ? timeline : (time / duration) * timeline;
  const capability = capabilities[active];
  const Scene = workPage ? buildDemos[active] : SolutionDemo;
  const phase = phaseAt(sceneTime);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      clearTimeout(hoverTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    let frame,
      last = 0,
      lastPaint = 0;
    function tick(now) {
      if (last)
        elapsed.current = Math.min(
          duration,
          elapsed.current + Math.min(now - last, 100),
        );
      last = now;
      if (now - lastPaint > 32 || elapsed.current === duration) {
        setTime(elapsed.current);
        lastPaint = now;
      }
      if (elapsed.current < duration) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  function select(index, replay = false) {
    clearTimeout(hoverTimer.current);
    if (index === active && !replay) return;
    setActive(index);
    elapsed.current = 0;
    setTime(0);
  }
  function preview(event, index) {
    if (event.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => select(index), 90);
  }
  function navigate(event, index) {
    let next;
    if (["ArrowDown", "ArrowRight"].includes(event.key))
      next = (index + 1) % capabilities.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key))
      next = (index + capabilities.length - 1) % capabilities.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = capabilities.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }
  return (
    <section
      className={
        "what-we-build relative isolate" + (workPage ? " is-work-page" : "")
      }
      id={workPage ? "what-we-build" : "solutions"}
      aria-labelledby={id + "-title"}
    >
      <div className="container">
        {!workPage && (
          <span id="what-we-build" className="wb-anchor" aria-hidden="true" />
        )}
        <Reveal className="wb-section-heading">
          <div>
            <Eyebrow>
              {workPage
                ? "CAPABILITIES IN ACTION"
                : "OUR SOLUTIONS · WHAT WE BUILD"}
            </Eyebrow>
            <h2 id={id + "-title"}>
              Good ideas.
              <br />
              <span className="quiet-text">Extraordinary software.</span>
            </h2>
          </div>
          <TextLink href={workPage ? "/contact" : "/work"}>
            {workPage ? "Build with us" : "Explore our work"}
          </TextLink>
        </Reveal>
        <Reveal
          className="wb-showcase"
          data-running={running}
          data-capability={capability.id}
        >
          <div className="wb-capabilities">
            <div className="wb-nav-label">EXPLORE THE POSSIBILITIES</div>
            <div className="wb-tabs" role="tablist" aria-label="What we build">
              {capabilities.map((item, i) => (
                <button
                  type="button"
                  role="tab"
                  key={item.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={id + "-tab-" + i}
                  aria-controls={id + "-panel"}
                  aria-selected={i === active}
                  tabIndex={i === active ? 0 : -1}
                  onPointerEnter={(event) => preview(event, i)}
                  onPointerLeave={() => clearTimeout(hoverTimer.current)}
                  onFocus={() => select(i)}
                  onClick={() => select(i, true)}
                  onKeyDown={(event) => navigate(event, i)}
                >
                  {i === active && (
                    <motion.span
                      className="wb-active-marker"
                      layoutId={id + "-active"}
                      transition={{
                        duration: disabled ? 0 : 0.24,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                  <span className="wb-tab-content">
                    <span>{!workPage ? titles[item.id] : item.title}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="wb-explore-hint">
              Move through the ideas.
              <br />
              <span>See them come to life.</span>
            </p>
          </div>
          <div
            className="wb-panel"
            role="tabpanel"
            id={id + "-panel"}
            aria-labelledby={id + "-tab-" + active}
            tabIndex={0}
          >
            <div className="wb-project-intro">
              <motion.div
                key={capability.id + "-intro"}
                initial={disabled ? false : { y: 12 }}
                animate={{ y: 0 }}
                transition={{ duration: disabled ? 0 : 0.25 }}
              >
                <span className="wb-overline">{capability.workspace}</span>
                <h3>
                  {!workPage ? headlines[capability.id] : capability.summary}
                </h3>
              </motion.div>
              <span className="wb-preview-label">IN MOTION</span>
            </div>
            <div className="wb-demo" ref={host}>
              <div className="wb-window-bar">
                <span className="wb-window-brand">
                  <span className="wb-window-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <b>{capability.app}</b>
                </span>
                <span className="wb-demo-label">PRODUCT CONCEPT</span>
              </div>
              <div className="wb-scene-container" aria-hidden="true">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={active}
                    className="wb-scene"
                    initial={
                      disabled ? false : { opacity: 0, y: 16, scale: 0.985 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: disabled ? 0 : -8 }}
                    transition={{
                      duration: disabled ? 0 : 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Scene time={sceneTime} capability={capability} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="wb-demo-footer" aria-hidden="true">
                <div className="wb-workflow">
                  {capability.steps.map((step, i) => (
                    <span
                      key={step}
                      className={phase >= i ? "is-complete" : ""}
                    >
                      <i />
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="sr-only">
              {capability.outcome} Demonstration sequence:{" "}
              {capability.steps.join(", ")}. All names and data are
              illustrative.
            </p>
            <div className="wb-delivery" aria-label="What we deliver">
              {capability.tasks.map(([title], i) => (
                <motion.span
                  key={capability.id + title}
                  initial={disabled ? false : { y: 8 }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: disabled ? 0 : 0.2,
                    delay: disabled ? 0 : i * 0.045,
                  }}
                >
                  {title}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="wb-section-footer">
          <span>Real possibilities. Illustrative product concepts.</span>
          <a href="/contact">Have something in mind? Let’s talk.</a>
        </div>
      </div>
    </section>
  );
}
