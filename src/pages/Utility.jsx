import { useState } from "react";
import { articles, faqs, projects, services } from "../data/content";
import { Button, FAQList, Icon, PageHero } from "../components/ui";

export function FAQ() {
  const [filter, setFilter] = useState("All questions");
  return (
    <>
      <PageHero
        eyebrow="FREQUENTLY ASKED QUESTIONS"
        title={
          <>
            Good questions.
            <br />
            <span className="blue-text">Straight answers.</span>
          </>
        }
        description="What to expect, how we work, and a few things to know before starting a project together."
      />
      <section className="section section-top-small">
        <div className="container faq-page-layout">
          <aside className="faq-categories">
            <span className="eyebrow">EXPLORE BY TOPIC</span>
            {["All questions", ...new Set(faqs.map((f) => f.category))].map(
              (f) => (
                <button
                  onClick={() => setFilter(f)}
                  className={f === filter ? "selected" : ""}
                  aria-pressed={filter === f}
                  key={f}
                >
                  {f}
                  <Icon name="arrow" size={17} />
                </button>
              ),
            )}
          </aside>
          <div>
            <FAQList
              items={faqs.filter(
                (f) => filter === "All questions" || f.category === filter,
              )}
            />
            <div className="faq-more">
              <h2>Still something on your mind?</h2>
              <p>
                Every project is a little different. We’re happy to help you
                think yours through.
              </p>
              <Button href="/contact" icon="diagonal">
                Let’s talk
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const policies = {
  privacy: {
    title: "Your privacy matters.",
    eyebrow: "PRIVACY",
    intro: "A clear explanation of how this website handles information.",
    sections: [
      [
        "Information you enter",
        "The project brief form processes the details you enter in your browser. The form does not send your name, email, company, or project description to SimpTech or a third-party form service. You can download the resulting brief to your device.",
      ],
      [
        "Optional saved drafts",
        "If you choose “Save a draft on this device,” the form stores your draft in this browser’s local storage when you prepare your brief. It remains there until you use “Clear saved draft” or clear your browser data. Avoid saving personal information on a shared device.",
      ],
      [
        "Email handoff",
        "If a contact email is available and you choose the email option, the site opens your email application with a prepared message. Review the message before sending. Your email provider handles the message under its own policies.",
      ],
      [
        "Hosting and essential technical data",
        "The hosting provider may process technical information needed to deliver and protect this website, such as request logs, IP addresses, and browser details. Hosting access and authentication may also use essential storage. These functions are controlled by the hosting platform.",
      ],
      [
        "Analytics and external services",
        "This application does not include advertising pixels, third-party analytics, or a newsletter tracker. The font is served with the website. Links to other websites are subject to those websites’ privacy practices.",
      ],
      [
        "Questions and changes",
        "Use the contact page to find the currently available contact options. If the site’s data handling changes, this page should be updated to describe the new behavior.",
      ],
    ],
  },
  terms: {
    title: "A few things to know.",
    eyebrow: "WEBSITE TERMS",
    intro: "The purpose of this website and the content you’ll find here.",
    sections: [
      [
        "About this website",
        "This website introduces SimpTech’s proposed services, approach, and original product explorations. Its content is informational. A specific project’s scope, pricing, timeline, support, and ownership are agreed separately in a written agreement.",
      ],
      [
        "Original concepts and sample data",
        "Projects labeled as concepts are self-initiated explorations. Product names, interface data, and example transactions within those visuals are illustrative. They are not evidence of client relationships, live products, or measured business outcomes.",
      ],
      [
        "Project briefs",
        "Preparing or downloading a project brief does not submit an inquiry, reserve availability, create a contract, or confirm a project. If you use an email handoff, the message still needs to be reviewed and sent from your own email application.",
      ],
      [
        "Content and third-party materials",
        "The site’s copy and interface concepts are provided to explain the studio’s approach. Third-party technology names identify tools and do not imply endorsement or a formal partnership. Open-source software and fonts retain their respective licenses.",
      ],
      [
        "External links",
        "Some pages or documentation may link to outside resources. Those resources are maintained independently and can change. Check their own terms and information before relying on them.",
      ],
    ],
  },
  accessibility: {
    title: "Built to include more people.",
    eyebrow: "ACCESSIBILITY",
    intro:
      "A usable experience should be part of the foundation, not an afterthought.",
    sections: [
      [
        "Our approach",
        "The website is designed with semantic headings, descriptive links, labeled form controls, visible keyboard focus, and responsive layouts. We aim to make the content understandable and the essential journeys usable with a keyboard.",
      ],
      [
        "Navigation and interaction",
        "Use the skip link to move directly to the main content. Navigation menus and FAQ panels can be opened with the keyboard. Escape closes an open navigation dropdown. Forms use browser validation and announce status messages.",
      ],
      [
        "Motion and visual content",
        "The site respects the reduced-motion preference on your device. Interface illustrations have descriptive labels, and decorative elements are hidden from assistive technology. Information is conveyed through text as well as color.",
      ],
      [
        "A work in progress",
        "Accessibility is an ongoing practice. Automated checks can identify some issues, but do not establish complete conformance. The website has not undergone an independent accessibility certification.",
      ],
      [
        "Share a difficulty",
        "If a page or interaction is difficult to use, prepare a message through the contact page. Include the page, the action you were trying to complete, and any browser or assistive technology details you are comfortable sharing.",
      ],
    ],
  },
};

export function Policy({ kind }) {
  const p = policies[kind];
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.intro} />
      <section className="section section-top-small">
        <div className="container policy-content">
          {p.sections.map(([title, text]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

export function Sitemap() {
  const groups = [
    {
      title: "Explore SimpTech",
      links: [
        ["Home", "/"],
        ["Services", "/services"],
        ["Our work", "/work"],
        ["Our approach", "/approach"],
        ["About us", "/about"],
        ["Industries", "/industries"],
        ["Technology stack", "/technologies"],
        ["Careers", "/careers"],
        ["Insights", "/insights"],
        ["Frequently asked questions", "/faq"],
        ["Contact", "/contact"],
      ],
    },
    {
      title: "Our services",
      links: services.map((s) => [s.title, `/services/${s.slug}`]),
    },
    {
      title: "Product explorations",
      links: projects.map((p) => [p.name, `/work/${p.slug}`]),
    },
    {
      title: "From the journal",
      links: articles.map((a) => [a.title, `/insights/${a.slug}`]),
    },
    {
      title: "The details",
      links: [
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
        ["Accessibility", "/accessibility"],
      ],
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="FIND YOUR WAY"
        title="A place for everything."
        description="Every page, a little easier to find."
      />
      <section className="section section-top-small">
        <div className="container sitemap-grid">
          {groups.map((g) => (
            <div key={g.title}>
              <h2>{g.title}</h2>
              {g.links.map(([label, url]) => (
                <a href={url} key={url}>
                  {label}
                  <Icon name="arrow" size={16} />
                </a>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="not-found container">
      <span className="not-found-number">
        404<span>.</span>
      </span>
      <h1>A small detour.</h1>
      <p>This page isn’t here, but there’s plenty more to explore.</p>
      <div>
        <Button href="/">Back to the homepage</Button>
        <Button variant="secondary" href="/services" icon={null}>
          Explore our services
        </Button>
      </div>
    </section>
  );
}
