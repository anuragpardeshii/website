import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Globe2,
  Code2,
  PanelsTopLeft,
  ChartNoAxesCombined,
  Layers3,
  Workflow,
  Check,
  Plus,
  Minus,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Zap,
  Target,
  Users,
  BookOpen,
  BriefcaseBusiness,
  ShoppingBag,
  Package,
  Sprout,
  Mail,
  Download,
  Search,
  Clock3,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

const icons = {
  arrow: ArrowRight,
  diagonal: ArrowUpRight,
  back: ArrowLeft,
  globe: Globe2,
  code: Code2,
  layout: PanelsTopLeft,
  chart: ChartNoAxesCombined,
  layers: Layers3,
  workflow: Workflow,
  check: Check,
  plus: Plus,
  minus: Minus,
  menu: Menu,
  close: X,
  chevron: ChevronDown,
  next: ChevronRight,
  shield: ShieldCheck,
  sparkle: Sparkles,
  handshake: HeartHandshake,
  zap: Zap,
  target: Target,
  users: Users,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  bag: ShoppingBag,
  box: Package,
  sprout: Sprout,
  mail: Mail,
  download: Download,
  search: Search,
  clock: Clock3,
  external: ExternalLink,
  success: CheckCircle2,
};
export function Icon({ name = "arrow", size = 20, ...props }) {
  const Component = icons[name] || ArrowRight;
  return (
    <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
export function Button({
  href,
  children,
  variant = "primary",
  icon = "arrow",
  className = "",
  ...props
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      {...(href ? { href } : { type: "button" })}
      className={`button button-${variant} ${className}`}
      {...props}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </Tag>
  );
}
export function TextLink({ href, children, className = "", ...props }) {
  return (
    <a className={`text-link ${className}`} href={href} {...props}>
      {children}
      <Icon name="arrow" size={18} />
    </a>
  );
}
export function Eyebrow({ children, light = false }) {
  return (
    <span className={`eyebrow ${light ? "eyebrow-light" : ""}`}>
      <span />
      {children}
    </span>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  align = "",
}) {
  return (
    <div className={`section-heading ${align}`}>
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && <TextLink href={link.href}>{link.label}</TextLink>}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section className={`page-hero ${className}`}>
      <div className="container">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p className="page-intro">{description}</p>
        {children}
      </div>
    </section>
  );
}
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a>
      {items.map((item, i) => (
        <span key={item.label}>
          <Icon name="next" size={13} />
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span aria-current={i === items.length - 1 ? "page" : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function Logo({ light = false }) {
  return (
    <a
      href="/"
      className={`logo ${light ? "logo-light" : ""}`}
      aria-label="SimpTech home"
    >
      <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <path d="m22 3-17 17h15l-4 15L34 16H19L22 3Z" fill="currentColor" />
      </svg>
      <span>
        Simp<span className="logo-tech">Tech</span>
        <span className="logo-dot">.</span>
      </span>
    </a>
  );
}
export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}
export function FAQList({ items, prefix = "faq" }) {
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <details key={item.question}>
          <summary id={`${prefix}-${i}`}>
            {item.question}
            <span className="faq-toggle">
              <Icon name="plus" size={18} />
            </span>
          </summary>
          <div className="faq-answer" aria-labelledby={`${prefix}-${i}`}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
