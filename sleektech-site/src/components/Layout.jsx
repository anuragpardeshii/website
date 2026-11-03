import { useEffect, useRef, useState } from "react";
import { services, site } from "../data/content";
import { Reveal, ScrollProgress } from "./MotionSystem";
import { Button, Icon, Logo, TextLink } from "./ui";

const companyLinks = [
  { href: "/about", label: "About SleekTech", detail: "Our point of view" },
  { href: "/industries", label: "Industries", detail: "Built for your world" },
  {
    href: "/technologies",
    label: "Technology stack",
    detail: "The tools behind the craft",
  },
  {
    href: "/careers",
    label: "Careers",
    detail: "Good people, thoughtful work",
  },
];
export function Header({ path }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef(null);
  const menuButton = useRef(null);
  useEffect(() => {
    function close(event) {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (
        event.type === "pointerdown" &&
        header.current?.contains(event.target)
      )
        return;
      header.current?.querySelectorAll("details[open]").forEach((el) => {
        el.open = false;
        if (event.type === "keydown") el.querySelector("summary")?.focus();
      });
      if (event.type === "keydown") {
        setMobileOpen(false);
        if (mobileOpen) menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [mobileOpen]);
  return (
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <Logo />
        <button
          ref={menuButton}
          className="mobile-toggle icon-button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Icon name={mobileOpen ? "close" : "menu"} size={24} />
        </button>
        <nav
          id="primary-navigation"
          className={`main-nav ${mobileOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <details className="nav-dropdown" name="primary-menu">
            <summary className={path.startsWith("/services") ? "active" : ""}>
              Solutions
              <Icon name="chevron" size={14} />
            </summary>
            <div className="mega-menu">
              <div className="mega-intro">
                <span className="eyebrow">WHAT WE DO</span>
                <h3>
                  Good ideas.
                  <br />
                  Great execution.
                </h3>
                <TextLink href="/services">Explore all services</TextLink>
              </div>
              <div className="mega-links">
                {services.map((s) => (
                  <a key={s.slug} href={`/services/${s.slug}`}>
                    <span className={`service-icon ${s.accent}`}>
                      <Icon name={s.icon} />
                    </span>
                    <span>
                      <strong>{s.title}</strong>
                      <small>{s.short}</small>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </details>
          <a
            href="/work"
            aria-current={path.startsWith("/work") ? "page" : undefined}
          >
            Work
          </a>
          <a
            href="/approach"
            aria-current={path === "/approach" ? "page" : undefined}
          >
            Approach
          </a>
          <details
            className="nav-dropdown company-dropdown"
            name="primary-menu"
          >
            <summary
              className={
                ["/about", "/industries", "/technologies", "/careers"].includes(
                  path,
                )
                  ? "active"
                  : ""
              }
            >
              Studio
              <Icon name="chevron" size={14} />
            </summary>
            <div className="company-menu">
              {companyLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  <strong>{link.label}</strong>
                  <small>{link.detail}</small>
                </a>
              ))}
            </div>
          </details>
          <a
            href="/insights"
            aria-current={path.startsWith("/insights") ? "page" : undefined}
          >
            Insights
          </a>
          <Button className="nav-cta" href="/contact" icon="diagonal">
            Let’s talk
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function ContactCTA() {
  return (
    <section className="contact-cta">
      <div className="container">
        <div className="cta-label">
          <span>YOUR NEXT CHAPTER STARTS HERE.</span>
          <span>LET’S MAKE IT HAPPEN ↙</span>
        </div>
        <Reveal className="cta-editorial">
          <h2>
            What’s your
            <br />
            <span>next big move?</span>
          </h2>
          <a
            className="cta-big-arrow"
            href="/contact"
            aria-label="Start a project with SleekTech"
          >
            <Icon name="diagonal" size={64} />
          </a>
        </Reveal>
        <div className="cta-bottom">
          <p>
            A bold idea. A complex challenge. A better way to work.
            <br />
            We’d love to hear what you have in mind.
          </p>
          <TextLink href="/contact">Start a conversation</TextLink>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>
              Thoughtfully built software.
              <br />
              Simply better experiences.
            </p>
            <span className="footer-note">
              From a good idea to what’s next.
            </span>
          </div>
          <div>
            <h2>What we do</h2>
            {services.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`}>
                {s.title}
              </a>
            ))}
          </div>
          <div>
            <h2>Explore</h2>
            <a href="/work">Our work</a>
            <a href="/approach">Our approach</a>
            <a href="/industries">Industries</a>
            <a href="/technologies">Technology stack</a>
            <a href="/insights">Insights</a>
            <a href="/faq">FAQs</a>
          </div>
          <div>
            <h2>Say hello</h2>
            <a href="/about">About us</a>
            <a href="/careers">Careers</a>
            <a href="/contact">
              Start a project <Icon name="diagonal" size={14} />
            </a>
            {site.contactEmail && (
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
            )}
            <div className="footer-status">
              <span />
              Built for what’s next.
            </div>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          Sleek<span className="wordmark-tech">Tech</span>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <div>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/accessibility">Accessibility</a>
            <a href="/sitemap">Sitemap</a>
          </div>
          <span className="made-with">Made with care. And good code.</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children, path, hideCTA = false }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollProgress />
      <Header path={path} />
      <main id="main-content">
        {children}
        {!hideCTA && <ContactCTA />}
      </main>
      <Footer />
    </>
  );
}
