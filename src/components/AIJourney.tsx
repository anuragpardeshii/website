import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { Eyebrow, Icon, TextLink } from "./ui";
import { useSiteMotion } from "./MotionSystem";
import { MotionSurface } from "./MotionSurface";

const chapters = [
  {
    label: "Connect",
    title: "Give intelligence the right context.",
    description:
      "Bring the knowledge in your documents, customer records, and operations into one considered experience.",
    detail:
      "A useful answer starts with the right information. We design around the sources your team already knows.",
    icon: "layers",
  },
  {
    label: "Understand",
    title: "Turn information into a useful next step.",
    description:
      "Explore assistants that can find relevant knowledge, explain their sources, and help your team make sense of what matters.",
    detail:
      "Clear answers. Visible sources. Thoughtful interfaces that keep the important details within reach.",
    icon: "sparkle",
  },
  {
    label: "Review",
    title: "Keep people in the decision.",
    description:
      "Move from a suggestion to a reviewed plan. Make approvals, handoffs, and responsibility part of the experience.",
    detail:
      "Design the checkpoints as carefully as the automation. Your team decides what happens next.",
    icon: "shield",
  },
];

function ChapterInterface({ active }: { active: number }) {
  const [approved, setApproved] = useState(false);
  const { disabled } = useSiteMotion();
  useEffect(() => setApproved(false), [active]);
  if (active === 0)
    return (
      <div className="journey-connect">
        <div className="journey-interface-title">
          <span>01 / CONTEXT LAYER</span>
          <h3>Your knowledge. Connected.</h3>
          <p>A shared starting point for useful answers.</p>
        </div>
        <div className="journey-source-list">
          {[
            [
              "book",
              "Company knowledge",
              "Guides, policies & product details",
              "24 sample documents",
            ],
            [
              "users",
              "Customer relationships",
              "Conversations & account history",
              "CRM concept",
            ],
            [
              "layers",
              "Business operations",
              "Orders, stock & shared workflows",
              "ERP concept",
            ],
          ].map(([icon, title, detail, note], i) => (
            <motion.div
              key={title}
              className="journey-source"
              initial={disabled ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: disabled ? 0 : i * 0.08,
                duration: disabled ? 0 : 0.3,
              }}
            >
              <span className="journey-source-icon">
                <Icon name={icon} size={18} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
              <small>{note}</small>
              <Icon name="check" size={14} />
            </motion.div>
          ))}
        </div>
        <div className="journey-map-mini" aria-hidden="true">
          <span>KNOWLEDGE</span>
          <i />
          <div>
            <Icon name="sparkle" size={22} />
          </div>
          <i />
          <span>CONTEXT</span>
        </div>
        <div className="journey-interface-note">
          <Icon name="shield" size={14} /> Designed around access and
          permissions.
        </div>
      </div>
    );
  if (active === 1)
    return (
      <div className="journey-understand">
        <div className="journey-interface-title">
          <span>02 / REASONING LAYER</span>
          <h3>Answers with a point of view.</h3>
          <p>See where the answer comes from.</p>
        </div>
        <div className="journey-prompt">
          <span>YOU</span>
          <p>What should we prepare for Northstar?</p>
          <Icon name="arrow" size={16} />
        </div>
        <div className="journey-response">
          <div>
            <Icon name="sparkle" size={18} />
            <strong>A useful place to begin</strong>
          </div>
          <p>
            The sample account notes mention a new customer portal. Start with
            the existing workflow, then review the access requirements with the
            team.
          </p>
          <ul>
            <li>Map the customer onboarding journey</li>
            <li>Review roles and account permissions</li>
            <li>Prepare questions for discovery</li>
          </ul>
          <div className="journey-citations">
            <span>
              <Icon name="book" size={12} /> 01 · Account notes
            </span>
            <span>
              <Icon name="layers" size={12} /> 02 · Project brief
            </span>
          </div>
        </div>
        <div className="journey-interface-note">
          <Icon name="search" size={14} /> Sample response with visible source
          references.
        </div>
      </div>
    );
  return (
    <div className="journey-review">
      <div className="journey-interface-title">
        <span>03 / HUMAN REVIEW</span>
        <h3>A clear handoff. On your terms.</h3>
        <p>Review the plan before anything moves forward.</p>
      </div>
      <div className="journey-plan-title">
        <Icon name="workflow" size={19} />
        <div>
          <strong>Northstar · Discovery plan</strong>
          <small>ILLUSTRATIVE WORKFLOW</small>
        </div>
        <span>Draft</span>
      </div>
      <div className="journey-checklist">
        {[
          "Prepare the discovery questions",
          "Attach the sample account context",
          "Assign a reviewer before sharing",
        ].map((text, i) => (
          <div key={text}>
            <span>0{i + 1}</span>
            <p>{text}</p>
            <Icon name="check" size={14} />
          </div>
        ))}
      </div>
      <button
        className="journey-approve"
        onClick={() => setApproved(!approved)}
        aria-pressed={approved}
      >
        {approved ? "Reset sample review" : "Review this sample plan"}
        <Icon name={approved ? "back" : "arrow"} size={16} />
      </button>
      <p className="journey-review-result" role="status">
        {approved
          ? "Sample reviewed. No messages sent or business actions taken."
          : "An interface demonstration. You stay in control."}
      </p>
    </div>
  );
}

export function AIJourney() {
  const ref = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { disabled } = useSiteMotion();
  const [scrollScene, setScrollScene] = useState(false);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1100px) and (min-height: 850px)",
    );
    const sync = () =>
      setScrollScene(
        media.matches &&
          !disabled &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [disabled]);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (scrollScene) setActive(Math.min(2, Math.floor(value * 3)));
  });
  function select(index: number) {
    setActive(index);
    if (scrollScene && ref.current) {
      const box = ref.current.getBoundingClientRect();
      const start = box.top + window.scrollY;
      window.scrollTo({
        top: start + (box.height - window.innerHeight) * ((index + 0.25) / 3),
        behavior: "instant",
      });
    }
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % 3
        : event.key === "ArrowLeft"
          ? (index + 2) % 3
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : -1;
    if (next < 0) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus({ preventScroll: true });
  }
  const chapter = chapters[active];
  return (
    <section
      ref={ref}
      id="intelligence-flow"
      className="ai-journey"
      data-scroll-scene={scrollScene}
      aria-labelledby="journey-title"
    >
      <div className="container journey-sticky">
        <div className="journey-copy">
          <Eyebrow>01 / THE INTELLIGENCE LAYER</Eyebrow>
          <h2 id="journey-title">
            AI is powerful.
            <br />
            <span>
              Purpose makes
              <br className="desktop-break" /> it useful.
            </span>
          </h2>
          <p className="journey-intro">
            An exploration of how your data, your workflows, and your people can
            work together.
          </p>
          <div
            role="tablist"
            aria-label="AI system chapters"
            className="journey-tabs"
          >
            {chapters.map((item, index) => (
              <button
                key={item.label}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                role="tab"
                id={`journey-tab-${index}`}
                aria-selected={active === index}
                aria-controls="journey-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => navigate(event, index)}
              >
                <span>0{index + 1}</span>
                {item.label}
                <i />
              </button>
            ))}
          </div>
          <div className="journey-chapter-copy">
            <span>
              0{active + 1} / {chapter.label.toUpperCase()}
            </span>
            <h3>{chapter.title}</h3>
            <p>{chapter.description}</p>
          </div>
          <TextLink href="/contact?service=workflow-automation">
            Let's shape your AI system
          </TextLink>
          <div className="journey-scroll-note">
            <span>↓</span>
            {scrollScene
              ? "SCROLL TO FOLLOW THE SYSTEM"
              : "SELECT A CHAPTER TO EXPLORE"}
          </div>
        </div>
        <div className="journey-stage">
          <MotionSurface className="journey-browser">
            <div className="journey-browser-chrome">
              <div>
                <i />
                <i />
                <i />
              </div>
              <span>
                <Icon name="shield" size={10} /> SimpTech / intelligence
                workspace
              </span>
              <Icon name="layers" size={13} />
            </div>
            <div className="journey-app-bar">
              <span>
                <Icon name="sparkle" size={18} /> Intelligence workspace
              </span>
              <small>INTERACTIVE CONCEPT</small>
            </div>
            <div
              id="journey-panel"
              role="tabpanel"
              aria-labelledby={`journey-tab-${active}`}
              tabIndex={0}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={
                    disabled
                      ? false
                      : { opacity: 0, y: 16, filter: "blur(3px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: disabled ? 0 : -8 }}
                  transition={{ duration: disabled ? 0 : 0.3 }}
                >
                  <ChapterInterface active={active} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="journey-app-footer">
              <span>
                <i /> DESIGNED AROUND YOUR BUSINESS
              </span>
              <span>SAMPLE DATA / 0{active + 1}</span>
            </div>
          </MotionSurface>
          <p className="journey-disclosure">
            Original interface concept. All sources, responses, and actions are
            illustrative.
          </p>
        </div>
      </div>
    </section>
  );
}
