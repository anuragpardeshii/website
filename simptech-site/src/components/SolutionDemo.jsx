import { AnimatePresence, motion } from "motion/react";
import { Check, ArrowUpRight, Activity, ShieldCheck } from "lucide-react";
import { SystemPreview } from "./EnterpriseVisuals";
import { useSiteMotion } from "./MotionSystem";
import { buildDemos, phaseAt } from "./BuildDemos";
const scenes = {
  crm: buildDemos[2],
  analytics: buildDemos[5],
  automation: buildDemos[0],
};
const milestones = {
  websites: [
    "Design system approved",
    "Responsive pages assembled",
    "Quality checks complete",
    "Your next chapter is live",
  ],
  erp: [
    "Purchase request received",
    "Approval policy verified",
    "Resources allocated",
    "Finance records reconciled",
  ],
  commerce: [
    "Product added to basket",
    "Payment authorized",
    "Order routed to fulfilment",
    "Customer journey connected",
  ],
  logistics: [
    "Stock received at warehouse",
    "Inventory reserved",
    "Carrier handoff confirmed",
    "Delivery milestone recorded",
  ],
};
export function SolutionDemo({ time, capability }) {
  const { disabled } = useSiteMotion();
  const Scene = scenes[capability.id];
  if (Scene) return <Scene time={time} />;
  const phase = phaseAt(time);
  return (
    <div className="solution-live-demo" data-phase={phase}>
      <div className="solution-live-preview">
        <SystemPreview mode={capability.visual} phase={phase} />
        {capability.id === "websites" && (
          <div
            className={
              "solution-mobile-preview" + (phase >= 2 ? " is-visible" : "")
            }
          >
            <div className="solution-mobile-speaker" />
            <span>forma®</span>
            <strong>
              Built for
              <br />
              <em>what’s next.</em>
            </strong>
            <small>DESIGNED FOR EVERY SCREEN</small>
          </div>
        )}
      </div>
      <div className="solution-live-status">
        <div className="solution-live-label">
          <Activity size={13} />
          <span>CONNECTED WORKFLOW</span>
          <span className="solution-live-dot" />
        </div>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            className="solution-live-milestone"
            key={phase}
            initial={disabled ? false : { opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: disabled ? 0 : -9 }}
            transition={{ duration: disabled ? 0 : 0.16 }}
          >
            <span className="solution-live-check">
              <Check size={17} />
            </span>
            <div>
              <span>{capability.steps[phase]}</span>
              <strong>{milestones[capability.id][phase]}</strong>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="solution-live-progress">
          {capability.steps.map((step, i) => (
            <div key={step} className={i <= phase ? "is-done" : ""}>
              <i />
              <span>{step}</span>
            </div>
          ))}
        </div>
        <p>
          <ShieldCheck size={12} />
          Clear ownership. Connected records. Visible progress.
        </p>
      </div>
    </div>
  );
}
