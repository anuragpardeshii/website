"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  X,
  Search,
  LayoutDashboard,
  Layers3,
  Users,
  BriefcaseBusiness,
  ListTodo,
  Mail,
  Settings2,
  LogOut,
  Menu,
  CalendarDays,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  Globe,
  ArrowLeft,
  Building2,
  CircleDot,
  Upload,
  RefreshCw,
  Link2,
  MessageCircle,
  Clock3,
  Pencil,
  Bell,
} from "lucide-react";

export type Row = Record<string, any>;
export function workspaceURL(kind: "crm" | "talent" | "marketing") {
  const configured =
    kind === "crm"
      ? process.env.NEXT_PUBLIC_CRM_URL
      : kind === "talent"
        ? process.env.NEXT_PUBLIC_TALENT_URL
        : process.env.NEXT_PUBLIC_MARKETING_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  )
    return (
      window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      { crm: 3001, talent: 3002, marketing: 5173 }[kind]
    );
  return "";
}

const icons: Record<string, any> = {
  edit: Pencil,
  bell: Bell,
  arrow: ArrowUpRight,
  right: ArrowRight,
  plus: Plus,
  close: X,
  search: Search,
  overview: LayoutDashboard,
  pipeline: Layers3,
  clients: Users,
  users: Users,
  projects: BriefcaseBusiness,
  tasks: ListTodo,
  messages: Mail,
  settings: Settings2,
  logout: LogOut,
  menu: Menu,
  calendar: CalendarDays,
  file: FileText,
  sparkles: Sparkles,
  check: Check,
  chevron: ChevronRight,
  globe: Globe,
  back: ArrowLeft,
  company: Building2,
  dot: CircleDot,
  upload: Upload,
  refresh: RefreshCw,
  link: Link2,
  whatsapp: MessageCircle,
  clock: Clock3,
};
export function Icon({
  name,
  size = 18,
  ...props
}: {
  name: string;
  size?: number;
  [key: string]: any;
}) {
  const Component = icons[name] || CircleDot;
  return (
    <Component size={size} strokeWidth={1.65} aria-hidden="true" {...props} />
  );
}
export function Brand({
  label,
  href = "/",
  light = false,
}: {
  label?: string;
  href?: string;
  light?: boolean;
}) {
  return (
    <a
      href={href}
      className={"brand " + (light ? "brand-light" : "")}
      aria-label={"SleekTech " + (label || "home")}
    >
      <svg
        viewBox="0 0 48 48"
        width="30"
        height="30"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17 4H44L34 14H21L16 19H26L16 29H4V17L17 4Z" />
        <path
          d="M17 4H44L34 14H21L16 19H26L16 29H4V17L17 4Z"
          transform="rotate(180 24 24)"
        />
      </svg>
      <span>sleektech</span>
      {label && (
        <>
          {" "}
          <em>{label}</em>
        </>
      )}
    </a>
  );
}
export async function api(path: string, options: Row = {}) {
  const { body, ...rest } = options;
  let response: Response;
  try {
    response = await fetch("/api" + path, {
      ...rest,
      credentials: "include",
      headers: {
        "X-Sleektech-Request": "1",
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
    });
  } catch (error: any) {
    if (error?.name === "AbortError") throw error;
    throw new Error(
      "The workspace is unavailable. Check that the shared API is running and try again.",
    );
  }
  let result: Row;
  try {
    result = await response.json();
  } catch {
    throw new Error("The workspace is unavailable. Please try again.");
  }
  if (!response.ok) {
    const error = new Error(
      result.error || "This request could not be completed.",
    ) as Error & { status?: number; fields?: Row };
    error.status = response.status;
    error.fields = result.fields;
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("sleektech:unauthorized"));
    throw error;
  }
  return result;
}
export const money = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: Number(value) >= 100000 ? "compact" : "standard",
  }).format(Number(value || 0));
export const date = (value: any, options: Row = {}) =>
  value
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        ...options,
      }).format(new Date(value))
    : "Not set";
export const initials = (name: string = "") =>
  name
    .split(" ")
    .map((v) => v[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const values = (form: HTMLFormElement) =>
  Object.fromEntries(new FormData(form));
export function Button({
  children,
  icon,
  variant = "",
  className = "",
  ...props
}: any) {
  return (
    <button
      className={
        "button inline-flex items-center justify-center gap-2 transition-colors duration-200 motion-reduce:transition-none " +
        variant +
        " " +
        className
      }
      {...props}
    >
      {icon && <Icon name={icon} size={16} />} {children}
    </button>
  );
}
export function Field({ label, children, hint, ...props }: any) {
  const generatedId = React.useId();
  const inputId = props.id || generatedId;
  const inputProps = {
    id: inputId,
    "aria-describedby": hint ? inputId + "-help" : undefined,
  };
  return (
    <div className={"field " + (props.wide ? "wide" : "")}>
      <label htmlFor={inputId}>{label}</label>
      {children ? (
        React.cloneElement(children, inputProps)
      ) : (
        <input
          {...Object.fromEntries(
            Object.entries(props).filter(([k]) => k !== "wide"),
          )}
          {...inputProps}
        />
      )}{" "}
      {hint && <small id={inputId + "-help"}>{hint}</small>}
    </div>
  );
}
export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={
        "badge " + (tone || String(children).toLowerCase().replaceAll(" ", "-"))
      }
    >
      <span />
      {children}
    </span>
  );
}
export function Avatar({ name, tone = "" }: { name: string; tone?: string }) {
  return <span className={"avatar " + tone}>{initials(name)}</span>;
}
export function Empty({
  title = "Nothing here yet",
  children,
  icon = "layers",
}: {
  title?: string;
  children?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="empty">
      <Icon name={icon} size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return children ? (
    <div
      className={"notice " + (error ? "error" : "")}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  ) : null;
}
export function Dialog({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={"dialog " + (wide ? "dialog-wide" : "")}
      onCancel={onClose}
      aria-label={title}
    >
      <header>
        <div>
          <span className="eyebrow">SLEEKTECH WORKSPACE</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <Icon name="search" size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <Icon name="close" size={14} />
        </button>
      )}
    </label>
  );
}
export function useView(defaultView = "overview") {
  const [view, setView] = useState(defaultView);
  useEffect(() => {
    const update = () =>
      setView(new URLSearchParams(location.search).get("view") || defaultView);
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, [defaultView]);
  const navigate = (value: string) => {
    setView(value);
    const url = new URL(location.href);
    url.searchParams.set("view", value);
    history.pushState({}, "", url);
  };
  return [view, navigate] as const;
}
export function useAction() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<any>, message = "") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      if (message) setNotice(message);
      return result ?? true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { error, notice, busy, run, setError, setNotice };
}
export function useData(path: string | null) {
  const [state, setState] = useState<{
    path: string | null;
    data: Row | null;
    error: string;
  }>({ path: null, data: null, error: "" });
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    controller.current?.abort();
    if (!path) return null;
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    try {
      const data = await api(path, { signal: request.signal });
      if (!request.signal.aborted) setState({ path, data, error: "" });
      return data;
    } catch (error: any) {
      if (!request.signal.aborted)
        setState({ path, data: null, error: error.message });
      return null;
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    reload();
    return () => controller.current?.abort();
  }, [reload]);
  return {
    data: state.path === path ? state.data : null,
    error: state.path === path ? state.error : "",
    loading,
    reload,
  };
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="loading-bar" />
      Loading your workspace…
    </div>
  );
}
export function PageHeading({ eyebrow, title, description, children }: any) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}
export function Stats({
  items,
}: {
  items: {
    label: string;
    value: ReactNode;
    detail: string;
    icon: string;
    href?: string;
  }[];
}) {
  return (
    <div className="stats">
      {items.map((item) => {
        const Element = item.href ? "a" : "div";
        return (
          <Element
            href={item.href}
            className="stat motion-safe:transition-shadow motion-safe:duration-300 hover:shadow-sm"
            key={item.label}
          >
            <div>
              {item.label}
              <Icon name={item.icon} size={16} />
            </div>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </Element>
        );
      })}
    </div>
  );
}
export function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: any) {
  return (
    <section className={"panel min-w-0 " + className}>
      <div className="panel-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Activity({ items }: { items: Row[] }) {
  return items.length ? (
    <div className="activity">
      {items.slice(0, 6).map((item) => (
        <div key={item.id}>
          <span className="activity-dot" />
          <div>
            <p>{item.action}</p>
            <small>
              {item.actor || "Workspace"} · {date(item.created_at)}
            </small>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Empty title="Your activity starts here">
      Updates to your workspace appear here.
    </Empty>
  );
}
export function Shell({
  product,
  user,
  demo,
  items,
  view,
  onView,
  children,
  onLogout,
  topbarActions,
}: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={"sidebar " + (open ? "is-open" : "")}>
        <Brand label={product} href={product === "CRM" ? "/" : "/manage"} />
        <div className="workspace-label">
          <span className="workspace-icon">
            <Icon name="company" />
          </span>
          <div>
            SleekTech workspace
            <small>{demo ? "Local demonstration" : "Team workspace"}</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label={product + " navigation"}>
          {items.map((item: Row) => {
            const Element = item.href ? "a" : "button";
            return (
              <Element
                href={item.href}
                key={item.id}
                className={view === item.id ? "active" : ""}
                aria-current={view === item.id ? "page" : undefined}
                onClick={(event: React.MouseEvent) => {
                  if (
                    item.href &&
                    (event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0)
                  )
                    return;
                  if (item.href) event.preventDefault();
                  onView(item.id);
                  setOpen(false);
                }}
              >
                <Icon name={item.icon} />
                {item.label}
                {item.count !== undefined && <small>{item.count}</small>}
              </Element>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="eyebrow">CONNECTED BY DESIGN</span>
            <p>
              {product === "CRM"
                ? "From first conversation to lasting partnership."
                : "Thoughtful hiring. Exceptional possibilities."}
            </p>
            {workspaceURL(product === "CRM" ? "talent" : "crm") && (
              <a
                href={
                  workspaceURL(product === "CRM" ? "talent" : "crm") +
                  (product === "CRM" ? "/manage" : "")
                }
              >
                {product === "CRM"
                  ? "Open Talent workspace"
                  : "Open CRM workspace"}
                <Icon name="arrow" size={14} />
              </a>
            )}
          </div>
          <div className="user">
            <Avatar name={user.name} />
            <div>
              <b>{user.name}</b>
              <small>{user.role.replaceAll("_", " ")}</small>
            </div>
            <button
              className="icon-button"
              title="Sign out"
              aria-label="Sign out"
              onClick={onLogout}
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="workspace-body min-w-0">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(!open)}
            >
              <Icon name="menu" />
            </button>
            <span className="topbar-product">
              {product === "CRM" ? "Revenue workspace" : "Talent workspace"}
            </span>
            <Icon name="chevron" size={13} />
            <b>{items.find((i: Row) => i.id === view)?.label || "Overview"}</b>
          </div>
          <div>
            {topbarActions}
            <span className="live-dot" />
            <span className="topbar-status">
              {demo ? "Demo workspace" : "Connected workspace"}
            </span>
            {product === "Talent" && (
              <a className="topbar-link" href="/">
                View careers page <Icon name="arrow" size={14} />
              </a>
            )}
          </div>
        </header>
        <main id="main" className="workspace-main">
          {demo && (
            <div className="demo-strip">
              <span>DEMO</span>Example records for exploring the product.
              Outbound sending is disabled.
            </div>
          )}
          {children}
        </main>
        <footer className="workspace-footer">
          <span>SLEEKTECH / {product.toUpperCase()}</span>
          <span>Clarity in every next step.</span>
        </footer>
      </div>
    </div>
  );
}
export function AuthGate({
  children,
  candidate = false,
  staffRedirect,
  allowedRoles = ["admin"],
  title = "Welcome to your workspace.",
}: {
  children: (
    user: Row,
    demo: boolean,
    logout: () => Promise<void>,
  ) => ReactNode;
  candidate?: boolean;
  staffRedirect?: string;
  allowedRoles?: readonly ("super_admin" | "admin" | "sales" | "recruiter")[];
  title?: string;
}) {
  const [user, setUser] = useState<Row | null>(null);
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);
  const [register, setRegister] = useState(false);
  const action = useAction();
  useEffect(() => {
    api("/auth/me")
      .then((r) => {
        setUser(r.user);
        setDemo(r.demo);
      })
      .catch((e) => action.setError(e.message))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    const clear = () => setUser(null);
    window.addEventListener("sleektech:unauthorized", clear);
    return () => window.removeEventListener("sleektech:unauthorized", clear);
  }, []);
  const logout = async () => {
    await api("/auth/logout", { method: "POST", body: {} });
    setUser(null);
  };
  // Candidate entry points can send hiring staff to their authorized workspace.
  const redirectStaff = Boolean(
    candidate &&
    staffRedirect &&
    user &&
    ["super_admin", "admin", "recruiter"].includes(user.role),
  );
  useEffect(() => {
    if (redirectStaff && staffRedirect) window.location.replace(staffRedirect);
  }, [redirectStaff, staffRedirect]);
  if (!ready || redirectStaff) return <Loading />;
  if (
    user &&
    ((candidate && user.role === "candidate") ||
      (!candidate &&
        (allowedRoles.includes(user.role) ||
          (user.role === "super_admin" && allowedRoles.includes("admin")))))
  )
    return children(user, demo, logout);
  if (user)
    return (
      <div className="auth-wrap auth-restricted">
        <div className="auth-form">
          <Brand />
          <h1>
            {candidate
              ? "Use a candidate account."
              : "This workspace is restricted."}
          </h1>
          <p>
            You are signed in as {user.email}.{" "}
            {candidate
              ? "Sign out to apply with your personal candidate account."
              : `Your ${user.role} account does not have access to this workspace. Sign in with an authorized account or contact your administrator.`}
          </p>
          <div className="auth-access-actions">
            {user.role === "candidate" && (
              <a
                className="button ghost"
                href={(workspaceURL("talent") || "") + "/account"}
              >
                Go to your candidate account
              </a>
            )}
            {["super_admin", "admin", "sales"].includes(user.role) && (
              <a className="button ghost" href={workspaceURL("crm") || "/"}>
                Open CRM
              </a>
            )}
            {["super_admin", "admin", "recruiter"].includes(user.role) && (
              <a
                className="button ghost"
                href={(workspaceURL("talent") || "") + "/manage"}
              >
                Open recruitment
              </a>
            )}
            <Button disabled={action.busy} onClick={() => action.run(logout)}>
              Sign out
            </Button>
          </div>
          <Notice error>{action.error}</Notice>
        </div>
      </div>
    );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = values(event.currentTarget);
    const result = await action.run(() =>
      api(register ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: { ...form, consent: form.consent === "on" },
      }),
    );
    if (result) setUser(result.user);
  }
  return (
    <div className="auth-wrap">
      <div className="auth-story">
        <Brand light label={candidate ? "careers" : "workspace"} />
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h2>
          {candidate ? (
            <>
              Good work.
              <br />
              Great possibilities.
            </>
          ) : (
            <>
              Relationships.
              <br />
              People.
              <br />
              <span>Progress.</span>
            </>
          )}
        </h2>
        <p>
          {candidate
            ? "Bring your perspective to meaningful problems. One profile, a thoughtful application, and clarity at every step."
            : "The connected workspace for building better customer relationships and exceptional teams."}
        </p>
        <div className="auth-art" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <small>INDEPENDENT THINKING. INTEGRATED SOLUTIONS.</small>
      </div>
      <div className="auth-form">
        <a
          href={candidate ? "/" : workspaceURL("marketing") || "/"}
          className="back-link"
        >
          <Icon name="back" size={15} />
          {candidate ? "Back to careers" : "SleekTech"}
        </a>
        <p className="eyebrow">
          {candidate ? "CANDIDATE PORTAL" : "SLEEKTECH WORKSPACE"}
        </p>
        <h1>{register ? "Make your next move." : title}</h1>
        <p>
          {register
            ? "Create your account to save your profile and track applications."
            : "Sign in to continue where you left off."}
        </p>
        <form onSubmit={submit}>
          {register && (
            <Field
              label="Full name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          )}
          <Field
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
          <PasswordField
            label="Password"
            name="password"
            autoComplete={register ? "new-password" : "current-password"}
            minLength={register ? 15 : 1}
            maxLength={128}
            required
            hint={register ? "Use at least 15 characters." : undefined}
          />
          {register && (
            <label className="checkbox-field">
              <input name="consent" type="checkbox" required />I agree to the
              candidate privacy notice and processing of my application details.{" "}
              <a href="/privacy">Read notice</a>
            </label>
          )}
          <Notice error>{action.error}</Notice>
          <Button
            disabled={action.busy}
            type="submit"
            className="full"
            icon="right"
          >
            {action.busy
              ? "Please wait…"
              : register
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>
        {candidate && (
          <p className="auth-switch">
            {register ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => {
                setRegister(!register);
                action.setError("");
              }}
            >
              {register ? "Sign in" : "Create an account"}
            </button>
          </p>
        )}
        {!candidate && demo && (
          <div className="demo-entry">
            <span>Explore the local preview</span>
            <Button
              variant="secondary"
              className="full"
              disabled={action.busy}
              onClick={() =>
                action.run(async () => {
                  const r = await api("/auth/demo", {
                    method: "POST",
                    body: {},
                  });
                  setUser(r.user);
                })
              }
              icon="arrow"
            >
              Enter demo workspace
            </Button>
            <small>Example data. No outbound messages.</small>
          </div>
        )}
        <p className="auth-footnote">
          {candidate
            ? "Your profile is private to you and authorized recruiting staff."
            : "Staff access is provisioned by your workspace administrator."}
        </p>
      </div>
    </div>
  );
}

export function PasswordField({ label = "Password", hint, ...props }: any) {
  const [visible, setVisible] = useState(false);
  const id = React.useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-control">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={hint ? id + "-hint" : undefined}
        />
        <button
          type="button"
          aria-label={
            visible
              ? "Hide " + label.toLowerCase()
              : "Show " + label.toLowerCase()
          }
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export function PasswordReset() {
  const tokenCaptured = useRef(false);
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const action = useAction();
  useEffect(() => {
    if (tokenCaptured.current) return;
    tokenCaptured.current = true;
    setToken(
      new URLSearchParams(window.location.hash.slice(1)).get("token") || "",
    );
    window.history.replaceState(null, "", window.location.pathname);
    setReady(true);
  }, []);
  return (
    <div className="auth-wrap auth-restricted">
      <div className="auth-form">
        <Brand />
        <h1>{done ? "Password updated." : "Set a new password."}</h1>
        <p>
          {done
            ? "Your previous sessions have been signed out. Use your new password to sign in."
            : "Choose a unique passphrase with at least 15 characters."}
        </p>
        <Notice error>{action.error}</Notice>
        {done ? (
          <a className="button section-space" href="/">
            Continue to sign in
          </a>
        ) : !ready ? (
          <Loading />
        ) : !token ? (
          <Notice error>
            This reset link is missing or expired. Ask your administrator for a
            new one.
          </Notice>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = values(event.currentTarget);
              if (form.password !== form.confirm) {
                action.setError("The passwords do not match.");
                return;
              }
              const result = await action.run(() =>
                api("/auth/reset-password", {
                  method: "POST",
                  body: { token, password: form.password },
                }),
              );
              if (result) {
                setToken("");
                setDone(true);
              }
            }}
          >
            <PasswordField
              label="New password"
              name="password"
              autoComplete="new-password"
              minLength={15}
              maxLength={128}
              required
            />
            <PasswordField
              label="Confirm password"
              name="confirm"
              autoComplete="new-password"
              minLength={15}
              maxLength={128}
              required
            />
            <Button type="submit" disabled={action.busy}>
              {action.busy ? "Updating…" : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
