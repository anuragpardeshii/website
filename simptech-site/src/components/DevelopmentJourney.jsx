import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Braces,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  FileCode2,
  Files,
  Folder,
  GitBranch,
  Globe2,
  Grip,
  Layers,
  LayoutTemplate,
  LockKeyhole,
  Mail,
  Maximize2,
  MoreHorizontal,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  X,
} from "lucide-react";
import { useSiteMotion } from "./MotionSystem";
import "./development-journey.css";

const stages = [
  {
    label: "Request",
    icon: Mail,
    title: "Every great build\nstarts with a hello.",
    description:
      "An idea, a conversation, a little ambition. Your next chapter starts here.",
    note: "An idea worth building.",
    app: "Inbox",
    file: "New project request",
    duration: 6500,
  },
  {
    label: "Planning",
    icon: GitBranch,
    title: "A clear plan.\nA shared direction.",
    description:
      "We connect the dots. The right questions become a roadmap everyone can see.",
    note: "Clarity before complexity.",
    app: "Project space",
    file: "Forma / Project roadmap",
    duration: 7000,
  },
  {
    label: "Design",
    icon: Layers,
    title: "Thoughtfully made.\nDown to the detail.",
    description:
      "From first sketch to final interaction. We shape an experience that feels just right.",
    note: "Good design is a conversation.",
    app: "Design studio",
    file: "Forma / Booking experience",
    duration: 8500,
  },
  {
    label: "Code",
    icon: Code2,
    title: "Good thinking.\nMeet great code.",
    description:
      "Build, run, refine. Thoughtful engineering brings every considered detail to life.",
    note: "Small changes. Better experiences.",
    app: "Visual Studio Code",
    file: "forma-web — Booking.tsx",
    duration: 14500,
  },
  {
    label: "Go live",
    icon: Globe2,
    title: "Ready for the world.\nBuilt for what’s next.",
    description:
      "Reviewed, tested, and ready to go. A live experience, and a partner beyond launch.",
    note: "Your idea. Out in the world.",
    app: "Production",
    file: "Forma / Production deployment",
    duration: 10000,
  },
];
const ease = [0.22, 1, 0.36, 1];

function WindowBar({ stage }) {
  return (
    <div className="dj-window-bar">
      <div className="dj-window-dots">
        <i />
        <i />
        <i />
      </div>
      <span className="dj-window-title">{stage.file}</span>
      <span className="dj-window-action">
        <Maximize2 size={12} />
        <MoreHorizontal size={16} />
      </span>
    </div>
  );
}

function StatusPill({ children, complete = false }) {
  return (
    <span className={`dj-status ${complete ? "is-complete" : ""}`}>
      {complete ? <Check size={12} /> : <span className="dj-status-dot" />}
      {children}
    </span>
  );
}

function BookingScene({ time }) {
  const received = time > 650;
  const accepted = time > 3600;
  return (
    <div className="dj-booking-scene">
      <aside className="dj-inbox-sidebar">
        <span className="dj-app-brand">
          <span className="dj-brand-icon">s.</span> Studio inbox
        </span>
        <div className="dj-inbox-nav is-active">
          <Mail size={14} /> Requests <span>01</span>
        </div>
        <div className="dj-inbox-nav">
          <Send size={14} /> Sent
        </div>
        <div className="dj-inbox-nav">
          <CalendarDays size={14} /> Discovery calls
        </div>
        <span className="dj-sidebar-bottom">
          <span className="dj-online-dot" /> Open to possibilities
        </span>
      </aside>
      <div className="dj-message-area">
        <div className="dj-scene-toolbar">
          <span>Good things start here.</span>
          <Search size={14} />
        </div>
        <motion.div
          className="dj-request-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: received ? 1 : 0, y: received ? 0 : 20 }}
          transition={{ duration: 0.65, ease }}
        >
          <div className="dj-request-top">
            <span className="dj-mail-icon">
              <Mail size={19} />
            </span>
            <span>NEW PROJECT REQUEST</span>
            <span>Just now</span>
          </div>
          <div className="dj-request-sender">
            <div className="dj-avatar">F</div>
            <div>
              <strong>The team at Forma</strong>
              <span>to SleekTech Studio</span>
            </div>
            <MoreHorizontal size={17} />
          </div>
          <h3>
            Let’s build something
            <br />
            people love using.
          </h3>
          <p>
            We’re opening a new movement studio.
            <br />
            Can you help us make booking feel effortless?
          </p>
          <div className="dj-request-tags">
            <span>Website & booking</span>
            <span>A fresh start</span>
          </div>
          <div className={`dj-request-accept ${accepted ? "is-accepted" : ""}`}>
            {accepted ? (
              <>
                <CheckCheck size={15} /> Discovery call booked{" "}
                <span>Let’s make it happen.</span>
              </>
            ) : (
              <>
                <CalendarDays size={15} /> Book a discovery call{" "}
                <ArrowUpRight size={15} />
              </>
            )}
          </div>
        </motion.div>
        <AnimatePresence>
          {accepted && (
            <motion.div
              className="dj-booking-notice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="dj-online-dot" /> One conversation. A world of
              possibility.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const planTasks = [
  [
    "01",
    "Understand the ambition",
    "Discovery & project goals",
    "Scope agreed",
    1000,
  ],
  [
    "02",
    "Map the experience",
    "User journeys & structure",
    "Journey mapped",
    2400,
  ],
  [
    "03",
    "Make a plan together",
    "Milestones & priorities",
    "Ready for design",
    3900,
  ],
];

function PlanningScene({ time }) {
  return (
    <div className="dj-planning-scene">
      <div className="dj-scene-toolbar">
        <span>
          <Folder size={13} /> Projects <ChevronRight size={12} /> <b>Forma</b>
        </span>
        <span className="dj-collaborators">
          <i>F</i>
          <i>S</i>
          <span>One team</span>
        </span>
      </div>
      <div className="dj-plan-heading">
        <div>
          <span className="dj-small-label">THE PROJECT BLUEPRINT</span>
          <h3>Less friction. More flow.</h3>
        </div>
        <StatusPill complete={time > 4700}>
          {time > 4700 ? "Plan approved" : "Connecting the dots"}
        </StatusPill>
      </div>
      <div className="dj-plan-grid">
        <div className="dj-plan-tasks">
          {planTasks.map(([number, title, description, status, at]) => (
            <motion.div
              className={`dj-plan-task ${time > at ? "is-done" : ""}`}
              key={number}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: time > at - 600 ? 1 : 0,
                x: time > at - 600 ? 0 : -10,
              }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="dj-task-check">
                {time > at ? <Check size={15} /> : number}
              </span>
              <div>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
              <span className="dj-task-status">
                {time > at ? status : "In progress"}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="dj-project-note">
          <span>
            <Sparkles size={14} /> THE NORTH STAR
          </span>
          <strong>
            Find a class.
            <br />
            Make it yours.
            <br />
            <em>Keep coming back.</em>
          </strong>
          <div>
            <span className="dj-note-line" />
            <span className="dj-note-line" />
          </div>
          <span>Simple for people. Solid underneath.</span>
        </div>
      </div>
      <div className="dj-user-flow">
        <span className="dj-small-label">THE HAPPY PATH</span>
        <div>
          {["Discover", "Choose a class", "Book a spot", "You’re in"].map(
            (label, i) => (
              <div className="dj-flow-step" key={label}>
                <motion.span
                  initial={false}
                  animate={{ opacity: time > 1300 + i * 650 ? 1 : 0.32 }}
                >
                  <span>{i === 3 ? <Check size={12} /> : `0${i + 1}`}</span>
                  {label}
                </motion.span>
                {i < 3 && <ArrowRight size={15} />}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function FormaPreview({ refined = true, live = false }) {
  return (
    <div
      className={`dj-forma ${refined ? "is-refined" : ""} ${live ? "is-live" : ""}`}
    >
      <div className="dj-forma-nav">
        <strong>
          forma<span>®</span>
        </strong>
        <div>
          <span>The studio</span>
          <span>Our classes</span>
          <span className="dj-forma-nav-cta">
            Find your class <ArrowUpRight size={9} />
          </span>
        </div>
      </div>
      <div className="dj-forma-main">
        <div className="dj-forma-copy">
          <span>MOVEMENT, MADE FOR YOU.</span>
          <strong>
            {refined ? (
              <>
                Find your
                <br />
                <em>kind of flow.</em>
              </>
            ) : (
              <>
                A space
                <br />
                to move.
              </>
            )}
          </strong>
          <p>
            A little time for yourself.
            <br />A whole new way to feel.
          </p>
          <span className="dj-forma-cta">
            {live ? "Find your flow" : "Explore the classes"}
            <ArrowUpRight size={11} />
          </span>
          <span className="dj-forma-footnote">
            <i /> Your next good habit starts here.
          </span>
        </div>
        <div className="dj-forma-art">
          <div className="dj-forma-orbit orbit-a" />
          <div className="dj-forma-orbit orbit-b" />
          <div className="dj-forma-orbit orbit-c" />
          <span className="dj-forma-art-label">
            A LITTLE SPACE.
            <br />A NEW PERSPECTIVE.
          </span>
          <span className="dj-forma-art-star">✳</span>
          <div className="dj-class-card">
            <span>
              <i /> YOUR MOMENT OF CALM
            </span>
            <strong>
              Morning flow <ArrowUpRight size={13} />
            </strong>
            <span>
              45 min <i /> All levels <span>09:00 AM</span>
            </span>
          </div>
        </div>
      </div>
      <div className="dj-forma-bottom">
        <span>Move with intention.</span>
        <span>
          01 — FIND YOUR BALANCE <ArrowDown size={10} />
        </span>
      </div>
    </div>
  );
}

function DesignScene({ time }) {
  const refined = time > 3000;
  return (
    <div className="dj-design-scene">
      <div className="dj-design-tools">
        <span>
          <MousePointer2 size={14} className="is-selected" />
          <Square size={14} />
          <span>T</span>
          <Circle size={14} />
          <Grip size={15} />
        </span>
        <span>
          Desktop / 1440 <ChevronDown size={12} />
        </span>
        <span>
          <Play size={12} /> Prototype
        </span>
      </div>
      <div className="dj-design-workspace">
        <aside className="dj-layers">
          <span className="dj-small-label">
            LAYERS <Plus size={11} />
          </span>
          {[
            ["Frame", LayoutTemplate],
            ["Navigation", Layers],
            ["Hero section", Layers],
            ["Typography", Braces],
            ["Class booking", CalendarDays],
          ].map(([label, Icon]) => (
            <div
              className={label === "Hero section" ? "is-selected" : ""}
              key={label}
            >
              <Icon size={12} />
              {label}
            </div>
          ))}
          <div className="dj-palette">
            <span className="dj-small-label">THE PALETTE</span>
            <span>
              <i />
              <i />
              <i />
              <i />
            </span>
            <small>Clear. Bold. Connected.</small>
          </div>
        </aside>
        <div className="dj-design-artboard">
          <span className="dj-artboard-label">
            Homepage{" "}
            <span>{refined ? "Refined together" : "First exploration"}</span>
          </span>
          <div className={`dj-design-selection ${refined ? "is-refined" : ""}`}>
            <FormaPreview refined={refined} />
            <i />
            <i />
            <i />
            <i />
          </div>
          <motion.div
            className="dj-design-cursor"
            initial={false}
            animate={{ x: refined ? 100 : 0, y: refined ? 24 : 0 }}
            transition={{ duration: 1.1, ease }}
          >
            <MousePointer2 size={18} fill="currentColor" />
            <span>SleekTech</span>
          </motion.div>
        </div>
        <aside className="dj-design-properties">
          <span className="dj-small-label">DESIGN</span>
          <span>
            Layout <Settings2 size={12} />
          </span>
          <div>
            <span>
              W <b>1440</b>
            </span>
            <span>
              H <b>960</b>
            </span>
          </div>
          <span>Typography</span>
          <strong>Aa</strong>
          <small>Inter / SleekTech system</small>
          <span>Fill</span>
          <div className="dj-design-fill">
            <i />
            {refined ? "#185BF1" : "#F4F5F7"}
          </div>
          <span>Spacing</span>
          <div>
            <span>
              ↔ <b>64</b>
            </span>
            <span>
              ↕ <b>80</b>
            </span>
          </div>
        </aside>
      </div>
      <AnimatePresence>
        {time > 5200 && (
          <motion.div
            className="dj-design-comment"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <span className="dj-avatar">F</span>
            <div>
              <strong>“That feels like us.”</strong>
              <span>Design approved. Let’s build it.</span>
            </div>
            <span className="dj-approval-check">
              <Check size={14} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const sourceLines = [
  'import { motion } from "motion/react";',
  'import { ClassCard } from "./ClassCard";',
  "",
  "export default function Booking() {",
  "  return (",
  '    <motion.section className="booking">',
  "      <span>Movement, made for you.</span>",
  "      <h1>Find your kind of flow.</h1>",
  '      <ClassCard time="09:00" />',
  "      <button>Book a session</button>",
  "    </motion.section>",
  "  );",
  "}",
];

function HighlightCode({ text }) {
  return text
    .split(
      /("[^"]*"|'[^']*'|\b(?:import|from|export|default|function|return)\b|\b(?:Booking|ClassCard)\b|<\/?[\w.]+|\bclassName\b)/g,
    )
    .map((part, i) => {
      const type = /^["']/.test(part)
        ? "string"
        : /^(import|from|export|default|function|return)$/.test(part)
          ? "keyword"
          : /^</.test(part)
            ? "tag"
            : /^(Booking|ClassCard)$/.test(part)
              ? "function"
              : part === "className"
                ? "attribute"
                : "plain";
      return (
        <span className={`dj-token-${type}`} key={i}>
          {part}
        </span>
      );
    });
}

function CodeScene({ time }) {
  const typed = Math.max(0, Math.floor((time - 350) / 8));
  const editing = time > 4800 && time < 6900;
  const edited = time >= 6900;
  const terminal = time > 7700;
  let remaining = typed;
  const code = sourceLines.map((original, i) => {
    let line = original;
    if (i === 9 && time > 5600) {
      const replacement = "Find your flow".slice(
        0,
        Math.floor((time - 5600) / 70),
      );
      line = `      <button>${replacement}</button>`;
    }
    const visible = line.slice(0, Math.max(0, remaining));
    remaining -= original.length + 1;
    return {
      line: visible,
      cursor: remaining < 0 && remaining >= -(original.length + 1),
      index: i,
    };
  });
  return (
    <div className="dj-code-scene">
      <aside className="dj-activity-bar">
        <Files size={19} />
        <Search size={18} />
        <GitBranch size={18} />
        <Braces size={19} />
        <span />
        <Settings2 size={18} />
      </aside>
      <aside className="dj-file-tree">
        <div>
          EXPLORER <MoreHorizontal size={13} />
        </div>
        <span>
          <ChevronDown size={11} /> FORMA-WEB
        </span>
        <span>
          <ChevronDown size={11} />
          <Folder size={12} /> src
        </span>
        <span className="dj-file-indent">
          <ChevronDown size={11} />
          <Folder size={12} /> components
        </span>
        <span className="dj-file-active">
          <FileCode2 size={12} /> Booking.tsx <i>{edited ? "M" : ""}</i>
        </span>
        <span className="dj-file-indent">
          <FileCode2 size={12} /> ClassCard.tsx
        </span>
        <span className="dj-file-indent">
          <span className="dj-css-icon">#</span> styles.css
        </span>
        <span>
          <Braces size={12} /> package.json
        </span>
        <div className="dj-code-branch">
          <GitBranch size={11} /> feat/booking-experience
        </div>
      </aside>
      <div className="dj-editor">
        <div className="dj-editor-tabs">
          <span>
            <FileCode2 size={13} /> Booking.tsx{" "}
            {editing || edited ? <i /> : <X size={11} />}
          </span>
          <span>
            <span className="dj-css-icon">#</span> styles.css
          </span>
          <Play size={12} />
        </div>
        <div className="dj-editor-breadcrumb">
          src <ChevronRight size={10} /> components <ChevronRight size={10} />{" "}
          Booking.tsx
        </div>
        <div className={`dj-code-lines ${terminal ? "has-terminal" : ""}`}>
          {code.map(({ line, cursor, index }) => (
            <div
              className={`dj-code-line ${index === 9 && (editing || edited) ? "is-edited" : ""}`}
              key={index}
            >
              <span className="dj-line-number">{index + 1}</span>
              <code>
                <HighlightCode text={line} />
                {cursor && !edited && <i className="dj-code-caret" />}
              </code>
              {index === 9 && edited && (
                <span className="dj-line-edit-label">refined</span>
              )}
            </div>
          ))}
        </div>
        <AnimatePresence>
          {terminal && (
            <motion.div
              className="dj-terminal"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 148, opacity: 1 }}
              transition={{ duration: 0.55, ease }}
            >
              <div className="dj-terminal-tabs">
                <span>
                  PROBLEMS <i>0</i>
                </span>
                <span>OUTPUT</span>
                <span>TERMINAL</span>
                <span>
                  <Terminal size={10} /> zsh <Plus size={10} />
                </span>
              </div>
              <div className="dj-terminal-content">
                <div>
                  <span className="dj-terminal-prompt">❯</span>{" "}
                  <span>npm run dev</span>
                </div>
                {time > 8900 && (
                  <div>
                    <span className="dj-terminal-success">✓</span> Ready in
                    380ms{" "}
                    <span className="dj-terminal-muted">— localhost:5173</span>
                  </div>
                )}
                {time > 10300 && (
                  <div>
                    <span className="dj-terminal-prompt">❯</span> npm run build
                  </div>
                )}
                {time > 11600 && (
                  <div>
                    <span className="dj-terminal-success">✓</span> Compiled
                    successfully{" "}
                    <span className="dj-terminal-muted">
                      · ready for production
                    </span>
                  </div>
                )}
                <span className="dj-terminal-cursor" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="dj-code-statusbar">
        <span>
          <GitBranch size={11} /> feat/booking <CheckCheck size={11} />{" "}
          <span>0 errors · 0 warnings</span>
        </span>
        <span>
          {edited ? "Changes saved" : "TypeScript JSX"}
          <span>UTF-8</span>
          <Bell size={10} />
        </span>
      </div>
      <AnimatePresence>
        {time > 12300 && (
          <motion.div
            className="dj-build-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>
              <Check size={14} />
            </span>
            <div>
              <strong>Looking good. Running beautifully.</strong>
              <small>Latest changes are ready to ship.</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const deploySteps = [
  ["Code review", "Every detail, considered.", 500],
  ["Quality checks", "Tested across screens.", 1400],
  ["Production build", "Optimized and ready.", 2400],
  ["Deploy to production", "A new home on the web.", 3500],
];

function LaunchScene({ time }) {
  const live = time > 4800;
  return (
    <div className="dj-launch-scene">
      <AnimatePresence mode="wait" initial={false}>
        {!live ? (
          <motion.div
            key="pipeline"
            className="dj-deploy-panel"
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="dj-deploy-header">
              <span className="dj-deploy-symbol">
                <Globe2 size={22} />
              </span>
              <div>
                <span className="dj-small-label">THE FINAL MILE</span>
                <h3>Good to go. Built to last.</h3>
              </div>
              <StatusPill complete={time > 4000}>
                {time > 4000 ? "Deployment ready" : "Preparing for launch"}
              </StatusPill>
            </div>
            <div className="dj-deploy-commit">
              <GitBranch size={13} />
              <span>main</span>
              <span>Refine booking experience</span>
              <code>a8f2c1d</code>
            </div>
            <div className="dj-deploy-steps">
              {deploySteps.map(([label, description, at], i) => (
                <div key={label} className={time > at ? "is-done" : ""}>
                  <span className="dj-deploy-check">
                    {time > at ? <Check size={14} /> : <span />}
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </div>
                  <span>
                    {time > at
                      ? "Passed"
                      : time > at - 1000
                        ? "Running…"
                        : "Queued"}
                  </span>
                  {i < 3 && <i />}
                </div>
              ))}
            </div>
            <div className="dj-deploy-footer">
              <ShieldCheck size={13} /> A little care at every step. Confidence
              at launch.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="live"
            className="dj-live-panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease }}
          >
            <div className="dj-browser-bar">
              <span>
                <ArrowRight size={12} />
                <RotateCcw size={11} />
              </span>
              <span className="dj-browser-address">
                <LockKeyhole size={10} /> forma.example{" "}
                <ArrowUpRight size={11} />
              </span>
              <StatusPill complete>Live</StatusPill>
            </div>
            <FormaPreview live />
            <div className="dj-live-notice">
              <span>
                <Check size={13} />
              </span>
              <strong>From “what if” to out in the world.</strong>
              <span>Deployed with care.</span>
              <Sparkles size={15} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const scenes = [
  BookingScene,
  PlanningScene,
  DesignScene,
  CodeScene,
  LaunchScene,
];

export function DevelopmentJourney() {
  const host = useRef(null);
  const clock = useRef({ index: 0, elapsed: 0, last: 0 });
  const [frame, setFrame] = useState({ index: 0, elapsed: 0 });
  const [pageVisible, setPageVisible] = useState(true);
  const { disabled, systemReduced } = useSiteMotion();
  const inView = useInView(host, { amount: 0.2 });
  const running = !disabled && inView && pageVisible;
  const stage = stages[frame.index];
  const Scene = scenes[frame.index];
  // Reduced motion presents a complete, static booking request.
  const sceneTime = systemReduced ? stage.duration - 1 : frame.elapsed;

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    let id;
    let lastPaint = 0;
    clock.current.last = 0;
    function tick(now) {
      const state = clock.current;
      if (state.last) state.elapsed += Math.min(now - state.last, 100);
      state.last = now;
      if (state.elapsed >= stages[state.index].duration) {
        state.index = (state.index + 1) % stages.length;
        state.elapsed = 0;
      }
      if (now - lastPaint > 50) {
        setFrame({ index: state.index, elapsed: state.elapsed });
        lastPaint = now;
      }
      id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);

  return (
    <section
      className="development-journey"
      ref={host}
      aria-label="From first hello to a live website: our development journey"
      data-running={running}
      data-stage={frame.index}
    >
      <div className="dj-main">
        <div className="dj-story">
          <div className="dj-story-eyebrow">
            <span>THE SLEEKTECH PROCESS</span>
            <span>0{frame.index + 1} / 05</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={frame.index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: disabled ? 0 : 0.4, ease }}
            >
              <h2>
                {stage.title.split("\n").map((line, i) => (
                  <span key={line} className={i === 1 ? "dj-title-accent" : ""}>
                    {line}
                  </span>
                ))}
              </h2>
              <p>{stage.description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="dj-story-note">
            <span />
            <span>{stage.note}</span>
          </div>
          <span className="dj-story-signature">
            From first hello
            <br />
            to <code>hello, world.</code>
            <ArrowUpRight size={25} />
          </span>
        </div>
        <div className="dj-stage-wrap">
          <div className="dj-workspace-label">
            <span>
              <stage.icon size={12} />
              {stage.app}
            </span>
            <span>
              <span className="dj-online-dot" /> Illustrative project / Forma
            </span>
          </div>
          <div
            className={`dj-window ${frame.index === 3 ? "is-code" : ""}`}
            aria-hidden="true"
          >
            <WindowBar stage={stage} />
            <div className="dj-scene-container">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={frame.index}
                  className="dj-scene"
                  initial={{
                    opacity: 0,
                    y: 16,
                    scale: 0.985,
                    filter: "blur(3px)",
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.99,
                    filter: "blur(3px)",
                  }}
                  transition={{ duration: disabled ? 0 : 0.4, ease }}
                >
                  <Scene time={sceneTime} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
