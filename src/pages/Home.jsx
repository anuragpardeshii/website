import { faqs, steps } from "../data/content";
import { HeroVisual } from "../components/ProductVisuals";
import {
  InsightsSection,
  PartnershipSection,
  ProjectGrid,
  ServiceGrid,
  TechStrip,
} from "../components/Sections";
import {
  Button,
  Eyebrow,
  FAQList,
  Icon,
  SectionHeading,
  TextLink,
} from "../components/ui";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <Eyebrow>YOUR IDEAS. OUR EXPERTISE.</Eyebrow>
            <h1>
              Big possibilities.
              <br />
              Simply{" "}
              <span className="hero-built">
                built.
                <svg viewBox="0 0 260 20" fill="none" aria-hidden="true">
                  <path
                    d="M3 14C63 0 172 0 255 9M38 18C108 7 180 6 226 10"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p>
              We turn complex challenges into thoughtful websites, powerful
              applications, and software that moves your business forward.
            </p>
            <div className="hero-actions">
              <Button href="/contact" icon="diagonal">
                Let’s build something great
              </Button>
              <TextLink href="/work">Explore our work</TextLink>
            </div>
            <div className="hero-trust">
              <span>
                <Icon name="check" size={15} />
                Thoughtfully designed
              </span>
              <span>
                <Icon name="check" size={15} />
                Built to grow
              </span>
            </div>
          </div>
          <HeroVisual />
        </div>
        <div className="container hero-foot">
          <span>SIMPLIFY THE COMPLEX. MAKE ROOM FOR WHAT’S NEXT.</span>
          <a href="#services">
            Discover what we do <span>↓</span>
          </a>
        </div>
      </section>
      <TechStrip />
      <section className="section services-section" id="services">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT WE DO"
            title={
              <>
                Your next chapter.
                <br />
                Our kind of challenge.
              </>
            }
            description="From your first website to your next big product, we build the tools that help you get there."
            link={{ href: "/services", label: "Explore all services" }}
          />
          <ServiceGrid />
        </div>
      </section>
      <section className="section work-section">
        <div className="container">
          <SectionHeading
            eyebrow="POSSIBILITIES, MADE TANGIBLE"
            title={
              <>
                Thoughtful ideas.
                <br />
                Real-world possibilities.
              </>
            }
            description="A look at the experiences we can create. Explore our original product concepts."
            link={{ href: "/work", label: "See all work" }}
          />
          <ProjectGrid limit={2} />
        </div>
      </section>
      <section className="section why-section">
        <div className="container why-layout">
          <div className="why-heading">
            <Eyebrow>THE SIMPTECH DIFFERENCE</Eyebrow>
            <h2>
              We care about
              <br />
              the <span className="blue-text">how.</span>
              <br />
              And the <span className="blue-text">why.</span>
            </h2>
            <p>
              Great software is more than good code. It’s understanding your
              business, sweating the details, and being a team you can count on.
            </p>
            <TextLink href="/approach">
              Meet your next development partner
            </TextLink>
          </div>
          <div className="benefits-grid">
            {[
              {
                icon: "target",
                title: "Your business comes first",
                text: "We get to know your goals before we get to work. Every decision starts with what matters to you.",
              },
              {
                icon: "sparkle",
                title: "Thoughtful by design",
                text: "Clean interfaces. Clear journeys. We make the complicated feel simple for the people using it.",
              },
              {
                icon: "code",
                title: "Built for the long run",
                text: "Maintainable code and considered architecture give your software room to grow with your business.",
              },
              {
                icon: "handshake",
                title: "A team in your corner",
                text: "Honest conversations, visible progress, and shared ownership. You’re part of the process, every step.",
              },
            ].map((b) => (
              <div className="benefit" key={b.title}>
                <Icon name={b.icon} size={27} />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section process-section">
        <div className="container">
          <SectionHeading
            eyebrow="A CLEAR PATH FORWARD"
            title="Good work doesn’t happen by accident."
            description="A collaborative process. A shared direction. No unnecessary complexity."
            link={{ href: "/approach", label: "How we work" }}
          />
          <div className="process-grid">
            {steps.map((s) => (
              <div className="process-step" key={s.number}>
                <span className="step-number">{s.number}</span>
                <h3>
                  {s.title}
                  <span>.</span>
                </h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PartnershipSection />
      <InsightsSection />
      <section className="section home-faq">
        <div className="container faq-layout">
          <div>
            <Eyebrow>LET’S CLEAR THINGS UP</Eyebrow>
            <h2>
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p>A few things you might be wondering before we get started.</p>
            <TextLink href="/faq">More questions, answered</TextLink>
          </div>
          <FAQList items={[faqs[0], faqs[1], faqs[2], faqs[7]]} />
        </div>
      </section>
    </>
  );
}
