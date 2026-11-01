import { faqs } from "../data/content";
import { CinematicHero } from "../components/CinematicHero";
import { CinematicMotion } from "../components/CinematicMotion";
import { IntelligenceStudio } from "../components/IntelligenceStudio";
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
      <CinematicMotion />
      <CinematicHero />
      <section className="workspace-section section" id="studio-workspace">
        <div className="container">
          <Reveal className="cinema-section-heading">
            <div>
              <Eyebrow>01 / SOFTWARE, MADE HUMAN</Eyebrow>
              <h2>
                One business.
                <br />
                <span className="quiet-text">A clearer picture.</span>
              </h2>
            </div>
            <p>
              Your customers, your operations, your next big decision. Bring it
              all into focus with software that feels like it was made for you.
              Because it is.
            </p>
          </Reveal>
          <div className="workspace-scene" data-image-reveal>
            <WorkspacePreview />
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
      <IntelligenceStudio />
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
                <div className="process-icon" aria-hidden="true">
                  0{i + 1}
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
