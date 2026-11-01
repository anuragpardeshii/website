import { faqs } from "../data/content";
import { WorkspacePreview } from "../components/WorkspacePreview";
import {
  ConnectedSystems,
  ProjectShowreel,
  SolutionExplorer,
} from "../components/SolutionExperiences";
import { Reveal } from "../components/MotionSystem";
import { Button, Eyebrow, FAQList, Icon, TextLink } from "../components/ui";

const process = [
  {
    icon: "search",
    title: "Understand the problem",
    text: "We map your goals, your users, and the way your business works.",
    output: "01 / DISCOVERY",
  },
  {
    icon: "layout",
    title: "Make it tangible",
    text: "Explore real screens and test the important journeys before we build.",
    output: "02 / DESIGN",
  },
  {
    icon: "code",
    title: "Build it together",
    text: "Working software, regular demos, and a clear view of what comes next.",
    output: "03 / DEVELOPMENT",
  },
  {
    icon: "diagonal",
    title: "Launch with confidence",
    text: "Test the details, prepare your team, and plan for what comes after launch.",
    output: "04 / LAUNCH",
  },
];

export default function Home() {
  return (
    <>
      <section className="v2-hero">
        <div className="container">
          <div className="v2-hero-copy">
            <div className="studio-label">
              <span /> INDEPENDENT THINKING. CONNECTED SOFTWARE.
            </div>
            <h1>
              Better websites.
              <br />
              <span>Smarter business software.</span>
            </h1>
            <p>
              From your first impression to your everyday operations.
              <br className="desktop-break" /> We design and build the
              technology that brings it all together.
            </p>
            <div className="hero-actions">
              <Button href="/contact">Start a project</Button>
              <Button href="/work" variant="secondary" icon="diagonal">
                Explore our work
              </Button>
            </div>
          </div>
          <WorkspacePreview />
          <div className="hero-footnote">
            <span>YOUR BUSINESS, BETTER CONNECTED</span>
            <span>
              Strategy <i /> Design <i /> Development
            </span>
          </div>
        </div>
      </section>
      <section className="v2-intro">
        <div className="container v2-intro-layout">
          <Eyebrow>LESS FRICTION. MORE POSSIBILITY.</Eyebrow>
          <Reveal>
            <h2>
              Your next stage deserves
              <br />
              <span className="quiet-text">a better way to work.</span>
            </h2>
            <p>
              A website that tells your story. A CRM your team actually enjoys.
              Operations that stay in sync. We turn the complicated parts of
              your business into simple, useful experiences.
            </p>
            <TextLink href="/about">Get to know SimpTech</TextLink>
          </Reveal>
        </div>
      </section>
      <ProjectShowreel />
      <SolutionExplorer />
      <ConnectedSystems />
      <section className="v2-process section">
        <div className="container">
          <div className="work-section-heading">
            <div>
              <Eyebrow>FROM THE FIRST CONVERSATION</Eyebrow>
              <h2>
                A clear path.
                <br />
                <span className="quiet-text">At every step.</span>
              </h2>
            </div>
            <TextLink href="/approach">How we work together</TextLink>
          </div>
          <div className="v2-process-grid">
            {process.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div className="process-icon">
                  <Icon name={step.icon} size={22} />
                </div>
                <span className="process-label">{step.output}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
          <div className="v2-engineering">
            <span>Thoughtful design. Dependable foundations.</span>
            <div>
              React <i /> TypeScript <i /> Node.js <i /> PostgreSQL
            </div>
            <TextLink href="/technologies">Our toolkit</TextLink>
          </div>
        </div>
      </section>
      <section className="section home-faq">
        <div className="container faq-layout">
          <div>
            <Eyebrow>BEFORE WE GET STARTED</Eyebrow>
            <h2>
              Good questions.
              <br />
              <span className="quiet-text">Clear answers.</span>
            </h2>
            <TextLink href="/faq">More about working together</TextLink>
          </div>
          <FAQList items={[faqs[1], faqs[2], faqs[5], faqs[7]]} />
        </div>
      </section>
    </>
  );
}
