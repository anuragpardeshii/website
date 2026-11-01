import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eyebrow, Icon, TextLink } from "./ui";
import { Reveal, useSiteMotion } from "./MotionSystem";

const scenarios = [
  {
    label: "Sales pulse",
    prompt: "What needs my attention in sales?",
    title: "Three conversations to move forward.",
    description:
      "Two proposals are awaiting a reply. One new inquiry matches your priority segment.",
    metric: "3",
    metricLabel: "suggested follow-ups",
    sources: ["Sales pipeline", "Customer notes"],
    tasks: [
      "Review the Northstar proposal",
      "Prepare a reply for Bloom & Co.",
      "Assign the new Waypoint inquiry",
    ],
  },
  {
    label: "Stock watch",
    prompt: "Which stock levels need a closer look?",
    title: "A clearer view of what’s running low.",
    description:
      "Two products are below their sample reorder levels. Check expected deliveries before placing an order.",
    metric: "2",
    metricLabel: "items to review",
    sources: ["Inventory records", "Purchase orders"],
    tasks: [
      "Review the Studio Desk stock level",
      "Check the incoming Task Lamp delivery",
      "Prepare a purchase order for review",
    ],
  },
  {
    label: "Weekly brief",
    prompt: "Give me a snapshot of this week.",
    title: "The week, without the spreadsheet hunt.",
    description:
      "A concise summary brings sample sales, fulfillment, and open tasks into a single conversation.",
    metric: "4",
    metricLabel: "connected data sources",
    sources: ["Sales & orders", "Operations & tasks"],
    tasks: [
      "Read the sample revenue summary",
      "Review three orders awaiting dispatch",
      "Share a draft with the operations team",
    ],
  },
];

export function IntelligenceStudio() {
  const [active, setActive] = useState(0);
  const [prepared, setPrepared] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { disabled } = useSiteMotion();
  const scenario = scenarios[active];
  const select = (index: number) => {
    setActive(index);
    setPrepared(false);
  };
  return (
    <section
      className="intelligence-section section"
      aria-labelledby="intelligence-title"
    >
      <div className="container intelligence-layout">
        <Reveal className="intelligence-copy">
          <Eyebrow>AN EXPLORATION IN APPLIED AI</Eyebrow>
          <h2 id="intelligence-title">
            A little intelligence.
            <br />
            <span className="quiet-text">A lot more clarity.</span>
          </h2>
          <p>
            Imagine asking your business a question—and finding the context, the
            next step, and the right place to begin.
          </p>
          <p>
            We explore how thoughtful AI interfaces could fit into your existing
            workflows. Useful by design. Always with you in control.
          </p>
          <TextLink href="/contact?service=workflow-automation">
            Explore an idea with us
          </TextLink>
          <div className="intelligence-disclosure">
            <Icon name="sparkle" size={17} />
            <span>
              Interactive design concept.
              <br />
              Scripted examples, using sample data.
            </span>
          </div>
        </Reveal>
        <div className="intelligence-console" data-image-reveal>
          <div className="intelligence-console-bar flex items-center justify-between">
            <span>
              <Icon name="sparkle" size={18} /> SimpTech intelligence
            </span>
            <small>CONCEPT / 01</small>
          </div>
          <div
            className="intelligence-tabs flex"
            role="tablist"
            aria-label="Explore AI workflow concepts"
          >
            {scenarios.map((item, index) => (
              <button
                key={item.label}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                id={`intelligence-tab-${index}`}
                role="tab"
                aria-selected={active === index}
                aria-controls="intelligence-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === "ArrowRight")
                    next = (index + 1) % scenarios.length;
                  else if (event.key === "ArrowLeft")
                    next = (index + scenarios.length - 1) % scenarios.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = scenarios.length - 1;
                  else return;
                  event.preventDefault();
                  select(next);
                  tabs.current[next]?.focus();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            id="intelligence-panel"
            role="tabpanel"
            aria-labelledby={`intelligence-tab-${active}`}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={disabled ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: disabled ? 0 : 0.18 }}
              >
                <div className="intelligence-question">
                  <span>YOU</span>
                  <p>{scenario.prompt}</p>
                  <Icon name="diagonal" size={17} />
                </div>
                <div className="intelligence-answer">
                  <div className="intelligence-thinking">
                    <Icon name="sparkle" size={18} /> A CLEARER PICTURE
                  </div>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  <div className="intelligence-metric">
                    <strong>{scenario.metric}</strong>
                    <span>{scenario.metricLabel}</span>
                    <div className="signal-bars" aria-hidden="true">
                      {[20, 34, 25, 42, 30, 49, 38, 55, 44, 64, 57, 74].map(
                        (height, index) => (
                          <i key={index} style={{ height }} />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="intelligence-sources flex flex-wrap gap-2">
                    {scenario.sources.map((source) => (
                      <span key={source}>
                        <Icon name="layers" size={12} />
                        {source}
                      </span>
                    ))}
                  </div>
                  <button
                    className="intelligence-action"
                    onClick={() => setPrepared(!prepared)}
                    aria-expanded={prepared}
                    aria-controls="intelligence-draft"
                  >
                    {prepared
                      ? "Close sample action plan"
                      : "Preview an action plan"}
                    <Icon name={prepared ? "minus" : "plus"} size={17} />
                  </button>
                  <div
                    id="intelligence-draft"
                    hidden={!prepared}
                    className="intelligence-draft"
                  >
                    <strong>Draft for your review</strong>
                    <ol>
                      {scenario.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ol>
                    <p>Sample plan only. No actions have been taken.</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="intelligence-console-footer">
            <span className="online-dot" /> Human judgment, built into the loop.
          </div>
        </div>
      </div>
    </section>
  );
}
