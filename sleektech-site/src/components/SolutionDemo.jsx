import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Activity,
  ShieldCheck,
  Terminal,
  LoaderCircle,
} from "lucide-react";
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
        <SystemPreview mode={capability.visual} phase={phase} time={time} />
        {capability.id === "websites" && (
          <WebsiteBuild time={time} phase={phase} />
        )}
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

function WebsiteBuild({ time, phase }) {
  const checks = [
    ["Design tokens", "Page structure", "Responsive layout"],
    ["UI components", "Content routes", "Image optimization"],
    ["Keyboard access", "Mobile + tablet", "Forms + navigation"],
    ["Production build", "Release published", "Experience live"],
  ][phase];
  const progress = Math.min(1, (time - phase * 2800) / 2800);
  const command = [
    "compose experience",
    "build components",
    "validate experience",
    "publish release",
  ][phase];
  return (
    <div className="wb-build-console">
      <div>
        <Terminal size={12} />
        <span>EXPERIENCE STUDIO</span>
        <i />
      </div>
      <code>
        {"› " + command.slice(0, Math.floor(progress * 60))}
        <b className="wb-code-cursor">_</b>
      </code>
      {checks.map((label, index) => {
        const done = progress >= (index + 1) / 3;
        return (
          <div
            className={"wb-build-check" + (done ? " is-done" : "")}
            key={label}
          >
            {done ? (
              <Check size={11} />
            ) : (
              <LoaderCircle size={11} className="wb-task-spinner" />
            )}
            <span>{label}</span>
            <small>{done ? "Ready" : "Building"}</small>
          </div>
        );
      })}
      <div className="wb-build-progress">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
