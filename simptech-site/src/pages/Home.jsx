import { faqs, steps } from "../data/content";
import { HeroHoverGrid } from "../components/HeroHoverGrid";
import { DevelopmentJourney } from "../components/DevelopmentJourney";
import { WhatWeBuild } from "../components/WhatWeBuild";
import { InsightsSection, PartnershipSection } from "../components/Sections";
import { ConnectedSystems } from "../components/SolutionExperiences";
import { MagneticLink, Reveal } from "../components/MotionSystem";
import { Eyebrow, FAQList, Icon, TextLink } from "../components/ui";

const differences = [
  [
    "target",
    "Business first. Always.",
    "We connect every design and engineering decision to the way your business actually works.",
  ],
  [
    "sparkle",
    "Design with a point of view.",
    "Distinctive on the outside. Intuitive on the inside. Experiences people understand and remember.",
  ],
  [
    "code",
    "Built beyond the launch.",
    "Clear architecture, considered integrations, and maintainable code give your next chapter room to grow.",
  ],
  [
    "handshake",
    "A partner in your corner.",
    "Direct conversations, visible progress, and shared ownership. You stay part of the process.",
  ],
];
export default function Home() {
  return (
    <>
      <section className="editorial-hero">
        <HeroHoverGrid />
        <div className="container">
          <div className="hero-kicker">
            <span>
              <i />
              DIGITAL EXPERIENCES. REAL BUSINESS IMPACT.
            </span>
            <span>STRATEGY × DESIGN × ENGINEERING</span>
          </div>
          <div className="editorial-hero-heading">
            <Reveal>
              <h1>
                Ambition, meet
                <br />
                <span>execution.</span>
                <i className="hero-asterisk" aria-hidden="true">
                  ✳
                </i>
              </h1>
            </Reveal>
            <Reveal className="hero-editorial-aside" delay={0.12}>
              <p>
                We turn complex challenges into exceptional websites and
                connected business software.
              </p>
              <MagneticLink href="/contact">
                Let’s build what’s next
              </MagneticLink>
              <a className="hero-explore-link" href="#solutions">
                Explore our solutions <Icon name="arrow" size={16} />
              </a>
            </Reveal>
          </div>
          <DevelopmentJourney />
          <div className="hero-art-bottom">
            <span>INDEPENDENT THINKING. INTEGRATED SOLUTIONS.</span>
            <a href="#solutions">
              SCROLL TO EXPLORE <span>↓</span>
            </a>
          </div>
        </div>
      </section>
      <div
        className="capability-marquee"
        role="img"
        aria-label="Websites, CRM and ERP, business intelligence, digital commerce, connected operations"
      >
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((n) => (
            <div key={n}>
              {[
                "WEBSITES",
                "CRM & ERP",
                "BUSINESS INTELLIGENCE",
                "DIGITAL COMMERCE",
                "CONNECTED OPERATIONS",
              ].map((t) => (
                <span key={t}>
                  {t}
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <section className="studio-intro">
        <div className="container">
          <Eyebrow>SMALL DETAILS. BIG AMBITIONS.</Eyebrow>
          <Reveal>
            <h2>
              Your technology should be
              <br />
              your <span>unfair advantage.</span>
            </h2>
            <div className="studio-intro-bottom">
              <p>
                From the first impression to the systems behind the scenes, we
                bring strategy, design, and engineering together to make your
                business work better.
              </p>
              <TextLink href="/about">Meet SleekTech</TextLink>
            </div>
          </Reveal>
        </div>
      </section>
      <WhatWeBuild />
      <ConnectedSystems />
      <section className="difference-section">
        <div className="container">
          <Reveal className="work-section-heading">
            <div>
              <Eyebrow>THE SLEEKTECH DIFFERENCE</Eyebrow>
              <h2>
                More than good code.
                <br />
                <span className="quiet-text">A better way forward.</span>
              </h2>
            </div>
            <p>
              Thoughtful by design.
              <br />
              Dependable by development.
            </p>
          </Reveal>
          <div className="difference-grid">
            {differences.map(([icon, title, text], i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="difference-icon">
                  <Icon name={icon} size={25} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="editorial-process">
        <div className="container">
          <div className="work-section-heading">
            <div>
              <Eyebrow>FROM IDEA TO IMPACT</Eyebrow>
              <h2>
                A clear path.
                <br />
                At every step.
              </h2>
            </div>
            <TextLink href="/approach">How we work together</TextLink>
          </div>
          <div className="process-runway">
            {steps.map((s, i) => (
              <Reveal className="process-stop" key={s.title} delay={i * 0.09}>
                <div className="process-point">
                  <i />
                  <span />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text || s.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="engineering-strip">
        <div className="container">
          <div>
            <span>GOOD IDEAS DESERVE SOLID FOUNDATIONS.</span>
            <TextLink href="/technologies">Our engineering toolkit</TextLink>
          </div>
          <div className="engineering-wordmarks">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "Node.js",
              "Python",
              "PostgreSQL",
              "AWS",
            ].map((t, i) => (
              <span key={t}>
                {i === 0 && <b>⚛</b>}
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
      <PartnershipSection />
      <div className="editorial-insights">
        <InsightsSection />
      </div>
      <section className="section home-faq">
        <div className="container faq-layout">
          <div>
            <Eyebrow>A GOOD PLACE TO START</Eyebrow>
            <h2>
              Big ideas.
              <br />A few questions.
            </h2>
            <TextLink href="/faq">Find more answers</TextLink>
          </div>
          <FAQList items={[faqs[1], faqs[2], faqs[5], faqs[7]]} />
        </div>
      </section>
    </>
  );
}
