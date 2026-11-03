import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Eyebrow, TextLink } from "./ui";
import { useSiteMotion, Reveal } from "./MotionSystem";
import { solutionCapabilities } from "./solution-capabilities";
import { SolutionStories, storyStages, storyPhase } from "./SolutionStories";
import { TabletPreview } from "./TabletPreview";
import "./what-we-build.css";
import "./tablet-preview.css";
import "./solution-stories.css";
import "./product-motion.css";
import "./showcase-layout.css";
import "./customer-demos.css";

// Let each workflow finish, hold its result, then continue through all solutions.
const duration = 30000;
const cycle = duration + 3000;
const timeline = 11200;
const titles = {
  websites: "Websites & experiences",
  crm: "CRM platforms",
  erp: "Enterprise systems",
  analytics: "Data & analytics",
  commerce: "Digital commerce",
  logistics: "Inventory & logistics",
  automation: "AI & automation",
};
export function WhatWeBuild({ workPage = false }) {
  const capabilities = solutionCapabilities;
  const [active, setActive] = useState(0);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [keyboardHeld, setKeyboardHeld] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const host = useRef(null);
  const tabs = useRef([]);
  const hoverTimer = useRef(null);
  const elapsed = useRef(0);
  const id = useId();
  const { disabled } = useSiteMotion();
  const inView = useInView(host, { amount: 0.2 });
  const running =
    inView && pageVisible && !disabled && !paused && !keyboardHeld;
  const sceneTime = disabled
    ? timeline
    : Math.min(time / duration, 1) * timeline;
  const capability = capabilities[active];

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
      if (last) elapsed.current += Math.min(now - last, 100);
      last = now;
      if (elapsed.current >= cycle) {
        elapsed.current = 0;
        setActive((index) => (index + 1) % capabilities.length);
        setTime(0);
        lastPaint = now;
      } else if (now - lastPaint > 32) {
        setTime(elapsed.current);
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, capabilities.length]);
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
          onFocusCapture={(event) => {
            const role = event.target.getAttribute("role");
            setKeyboardHeld(
              (role === "tab" || role === "tabpanel") &&
                event.target.matches(":focus-visible"),
            );
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setKeyboardHeld(false);
          }}
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
                  onClick={(event) => {
                    if (event.detail > 0) setKeyboardHeld(false);
                    select(i, true);
                  }}
                  onKeyDown={(event) => navigate(event, i)}
                >
                  {i === active && (
                    <motion.span
                      className="wb-active-marker"
                      layoutId={id + "-active"}
                      transition={{
                        duration: disabled ? 0 : 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                  <span className="wb-tab-content">
                    <span>{titles[item.id]}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="wb-explore-hint">
              One idea leads to the next.
              <br />
              <span>Explore a solution at any time.</span>
            </p>
          </div>
          <div
            className="wb-panel"
            role="tabpanel"
            id={id + "-panel"}
            aria-labelledby={id + "-tab-" + active}
            tabIndex={0}
          >
            <TabletPreview
              capability={capability}
              stage={storyStages[capability.id][storyPhase(sceneTime)]}
              hostRef={host}
              paused={paused}
              disabled={disabled}
              onTogglePause={() => setPaused((value) => !value)}
            >
              <div className="wb-scene-container" aria-hidden="true">
                <div className="wb-scene-canvas">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={active}
                      className="wb-scene"
                      initial={disabled ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: disabled ? 0 : 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <SolutionStories
                        time={sceneTime}
                        reduced={disabled}
                        capability={capability}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </TabletPreview>
            <p className="sr-only">
              {capability.outcome} Demonstration sequence:{" "}
              {storyStages[capability.id].join(", ")}. All names and data are
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
