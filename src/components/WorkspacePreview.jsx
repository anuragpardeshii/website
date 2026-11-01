import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SystemPreview } from "./EnterpriseVisuals";
import { useSiteMotion } from "./MotionSystem";
import { Icon } from "./ui";

const views = [
  {
    label: "Business overview",
    icon: "chart",
    mode: "analytics",
    note: "The numbers that matter, in one clear view.",
    href: "/services/business-analytics",
  },
  {
    label: "Sales pipeline",
    icon: "users",
    mode: "crm",
    note: "Every relationship. Every next step. Connected.",
    href: "/services/crm-development",
  },
  {
    label: "Operations",
    icon: "layers",
    mode: "erp",
    note: "One shared picture of the work behind the scenes.",
    href: "/services/erp-development",
  },
];

export function WorkspacePreview() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const { disabled } = useSiteMotion();
  const view = views[active];
  function navigate(event, index) {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % views.length;
    else if (event.key === "ArrowLeft")
      next = (index + views.length - 1) % views.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = views.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }
  return (
    <div className="workspace-frame">
      <div className="workspace-toolbar">
        <span className="workspace-mark">
          <Icon name="layers" size={16} /> THE CONNECTED BUSINESS
        </span>
        <span className="workspace-sample">
          <i /> INTERACTIVE CONCEPT
        </span>
      </div>
      <div
        className="workspace-tabs"
        role="tablist"
        aria-label="Explore a sample business workspace"
      >
        {views.map((item, index) => (
          <button
            key={item.mode}
            type="button"
            role="tab"
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`workspace-tab-${index}`}
            aria-controls="workspace-panel"
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div
        className="workspace-panel"
        id="workspace-panel"
        role="tabpanel"
        aria-labelledby={`workspace-tab-${active}`}
        tabIndex={0}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view.mode}
            initial={disabled ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: disabled ? 0 : 0.15 }}
          >
            <SystemPreview mode={view.mode} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="workspace-caption">
        <p>{view.note}</p>
        <a href={view.href}>
          Explore the possibilities <Icon name="diagonal" size={16} />
        </a>
      </div>
      <span className="workspace-disclosure">
        Original interface concept. All figures and records are illustrative.
      </span>
    </div>
  );
}
