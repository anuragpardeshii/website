import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useSiteMotion } from "./MotionSystem";
import { Eyebrow, Icon } from "./ui";

/** Original vector artwork, animated only while it is in view. */
export function SignalField() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const { disabled } = useSiteMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 1.06]);
  const pathLength = useTransform(scrollYProgress, [0, 0.4], [0.2, 1]);
  const active = inView && !disabled;
  return (
    <section
      ref={ref}
      className="signal-section"
      aria-labelledby="signal-title"
      data-active={active}
    >
      <div className="container signal-heading">
        <Eyebrow>INTELLIGENCE IS A CONNECTION.</Eyebrow>
        <h2 id="signal-title">
          From scattered signals.
          <br />
          <span>To a shared understanding.</span>
        </h2>
      </div>
      <motion.div
        className="signal-art"
        style={disabled ? {} : { scale }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 340" preserveAspectRatio="xMidYMid meet">
          {Array.from({ length: 29 }, (_, i) => {
            const y = 24 + i * 10;
            const middle = 170 + Math.sin(i * 0.42) * 32;
            return (
              <motion.path
                key={i}
                d={`M0 ${y} C280 ${y}, 340 ${middle}, 600 ${middle} S930 ${340 - y},1200 ${340 - y}`}
                fill="none"
                stroke={i % 5 === 0 ? "#999" : "#303030"}
                strokeWidth={i % 5 === 0 ? 1 : 0.6}
                style={{ pathLength: disabled ? 1 : pathLength }}
              />
            );
          })}
          {active &&
            [80, 150, 220, 290].map((y, i) => (
              <circle
                key={y}
                className="signal-particle"
                cx="0"
                cy="0"
                r="2"
                fill="white"
              >
                <animateMotion
                  dur={`${7 + i * 2}s`}
                  begin={`${i * -2}s`}
                  repeatCount="indefinite"
                  path={`M0 ${y} C280 ${y}, 340 170,600 170 S930 ${340 - y},1200 ${340 - y}`}
                />
              </circle>
            ))}
        </svg>
        <div className="signal-nucleus">
          <Icon name="sparkle" size={27} />
          <span>SIMPTECH AI</span>
          <i />
        </div>
      </motion.div>
      <div className="container signal-caption">
        <span>CONTEXT IN.</span>
        <span>HUMAN PURPOSE, AT THE CENTER.</span>
        <span>CLARITY OUT.</span>
      </div>
    </section>
  );
}
