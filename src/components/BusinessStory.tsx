import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { Reveal, useSiteMotion } from "./MotionSystem";
import { Eyebrow, Icon } from "./ui";

const practices = [
  {
    n: "01",
    title: "Websites & digital experiences",
    text: "A sharper first impression. A clearer path to your next customer.",
    tags: "BRAND WEBSITES / WEB APPLICATIONS / COMMERCE",
    href: "/services/website-development",
    icon: "globe",
  },
  {
    n: "02",
    title: "Dashboards & business intelligence",
    text: "See the whole picture. Give every decision a stronger foundation.",
    tags: "ANALYTICS / REPORTING / DATA VISUALIZATION",
    href: "/services/business-analytics",
    icon: "chart",
  },
  {
    n: "03",
    title: "AI engines & intelligent chatbots",
    text: "Connect your knowledge to the people and workflows that need it.",
    tags: "AI SYSTEMS / KNOWLEDGE ASSISTANTS / CHATBOTS",
    href: "/services/ai-engine-development",
    icon: "sparkle",
  },
  {
    n: "04",
    title: "Software that runs your business",
    text: "Bring customers, teams, orders, and operations into sync.",
    tags: "CRM / ERP / INVENTORY / AUTOMATION",
    href: "/services/erp-development",
    icon: "layers",
  },
];
export function BusinessStory() {
  return (
    <section className="business-story" id="business-solutions">
      <div className="container business-story-grid">
        <Reveal className="business-story-intro">
          <Eyebrow>AMBITION, MEET EXECUTION.</Eyebrow>
          <h2>
            Big thinking.
            <br />
            Meticulous
            <br />
            <span>making.</span>
          </h2>
          <p>
            We bring design and engineering together to solve the things that
            hold your business back—and build what moves it forward.
          </p>
          <a href="/services" className="business-all-link">
            Discover our capabilities <Icon name="diagonal" size={18} />
          </a>
        </Reveal>
        <div className="business-practices">
          {practices.map((p) => (
            <Reveal key={p.n}>
              <a className="business-practice" href={p.href}>
                <span className="practice-number">{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <small>{p.tags}</small>
                </div>
                <Icon name="diagonal" size={22} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
const statement =
  "A remarkable presence. A smarter operation. A business built for what’s next.".split(
    " ",
  );
function StatementWord({
  word,
  index,
  progress,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const { disabled } = useSiteMotion();
  const color = useTransform(
    progress,
    [(index / statement.length) * 0.8, ((index + 1) / statement.length) * 0.8],
    ["#777777", "#f4f4f4"],
  );
  const y = useTransform(
    progress,
    [(index / statement.length) * 0.8, ((index + 1) / statement.length) * 0.8],
    [10, 0],
  );
  return (
    <motion.span
      aria-hidden="true"
      style={disabled ? { color: "#f4f4f4" } : { color, y }}
    >
      {word}{" "}
    </motion.span>
  );
}
export function ScrollStatement() {
  const ref = useRef<HTMLElement>(null);
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start .9", "end .65"],
  });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section className="scroll-statement" ref={ref}>
      <div className="container">
        <div className="statement-top">
          <Eyebrow>THE WORK SHOULD SPEAK FOR ITSELF.</Eyebrow>
          <span>DESIGN × ENGINEERING × CARE</span>
        </div>
        <h2 aria-label={statement.join(" ")}>
          {statement.map((word, index) => (
            <StatementWord
              key={index}
              word={word}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </h2>
        <div className="statement-rule">
          <motion.i style={{ scaleX: disabled ? 1 : line }} />
        </div>
        <div className="statement-bottom">
          <p>
            Considered down to the last interaction.
            <br />
            Built around your business, from the first conversation.
          </p>
          <a href="/approach">
            See how we work <Icon name="diagonal" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
