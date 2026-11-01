import type { Service } from "../types";
import { services } from "../data/content";
import {
  SolutionExplorer,
  ConnectedSystems,
} from "../components/SolutionExperiences";
import { SystemPreview } from "../components/EnterpriseVisuals";
import {
  Breadcrumb,
  Button,
  Eyebrow,
  Icon,
  PageHero,
  SectionHeading,
  TextLink,
} from "../components/ui";

export function Services() {
  return (
    <>
      <PageHero
        eyebrow="OUR SERVICES"
        title={
          <>
            Built for your business.
            <br />
            <span className="accent-text">Designed for what’s next.</span>
          </>
        }
        description="One thoughtful partner for the websites, applications, and systems that move your business forward."
      />
      <SolutionExplorer />
      <ConnectedSystems />
      <section className="section soft-section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>CONNECTED THINKING</Eyebrow>
            <h2>
              Different challenges.
              <br />
              One joined-up approach.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              Your website, your product, and your operations should work
              together. So should the people building them.
            </p>
            <p>
              We can focus on a single challenge or connect the pieces into a
              wider digital experience. Strategy, design, and engineering stay
              in the same conversation from the start.
            </p>
            <TextLink href="/approach">Explore our approach</TextLink>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="WAYS TO WORK TOGETHER"
            title="A good fit for where you are."
          />
          <div className="three-grid engagement-grid">
            {[
              {
                n: "01",
                title: "Start something new",
                text: "Explore an idea, define the first release, and build a clear path from discovery to launch.",
              },
              {
                n: "02",
                title: "Improve what exists",
                text: "Bring a fresh perspective to your current website or product, and turn friction into a focused improvement plan.",
              },
              {
                n: "03",
                title: "Build for the next stage",
                text: "Extend your team with design and engineering support as your product, requirements, and business evolve.",
              },
            ].map((x) => (
              <div key={x.n}>
                <span className="step-number">{x.n}</span>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ServiceDetail({ service }: { service: Service }) {
  return (
    <>
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Services", href: "/services" },
            { label: service.title },
          ]}
        />
      </div>
      <section className="service-detail-hero">
        <div className="container detail-hero-grid">
          <div>
            <Eyebrow>{service.title}</Eyebrow>
            <h1>{service.headline}</h1>
            <p className="page-intro">{service.intro}</p>
            <Button href={`/contact?service=${service.slug}`} icon="diagonal">
              Let’s talk about your project
            </Button>
          </div>
          <div className={`service-detail-art ${service.accent}`}>
            <span className="detail-art-label">
              <Icon name={service.icon} />
              {service.title}
            </span>
            <SystemPreview
              mode={
                service.visual ||
                (service.slug === "workflow-automation" ? "erp" : "analytics")
              }
            />
            <span className="detail-art-caption">
              An original interface concept. A world of possibilities.
            </span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>THE OPPORTUNITY</Eyebrow>
            <h2>
              Useful software starts
              <br />
              with a real problem.
            </h2>
          </div>
          <div>
            <p className="lead-text">{service.problem}</p>
            <p>{service.solution}</p>
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT’S INCLUDED"
            title="The details make the difference."
            description="We shape the exact scope around your goals. Here’s what an engagement can include."
          />
          <div className="deliverables-grid">
            {service.deliverables.map((d, i) => (
              <div key={d}>
                <span>0{i + 1}</span>
                <h3>{d}</h3>
                <Icon name="check" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>BUILT WITH PURPOSE</Eyebrow>
            <h2>
              A better way
              <br />
              to move forward.
            </h2>
          </div>
          <div className="outcomes">
            {service.outcomes.map((o) => (
              <div key={o}>
                <span className="check-round">
                  <Icon name="check" size={18} />
                </span>
                <h3>{o}</h3>
              </div>
            ))}
            <p>
              <strong>A good fit for:</strong> {service.fit}
            </p>
            <TextLink href="/approach">See how we get there</TextLink>
          </div>
        </div>
      </section>
      <section className="section related-section">
        <div className="container">
          <SectionHeading
            eyebrow="CONNECTED CAPABILITIES"
            title="A little more of what we do."
          />
          <div className="related-services">
            {services
              .filter((s) => s.slug !== service.slug)
              .slice(0, 3)
              .map((s) => (
                <a href={`/services/${s.slug}`} key={s.slug}>
                  <span className={`service-icon ${s.accent}`}>
                    <Icon name={s.icon} />
                  </span>
                  <h3>{s.title}</h3>
                  <Icon name="diagonal" />
                </a>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
