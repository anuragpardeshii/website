import { industries, steps } from "../data/content";
import {
  Button,
  Eyebrow,
  Icon,
  PageHero,
  SectionHeading,
  TextLink,
} from "../components/ui";

export function About() {
  return (
    <>
      <PageHero
        eyebrow="HELLO, WE’RE SIMPTECH"
        title={
          <>
            We make technology
            <br />
            <span className="blue-text">feel a little more human.</span>
          </>
        }
        description="A software development studio with a simple point of view: the best digital experiences make life easier for the people using them."
      />
      <section className="about-statement">
        <div className="container">
          <div
            className="about-art"
            aria-label="Our approach connects people, ideas, and thoughtfully built products"
            role="img"
          >
            <div className="about-art-heading">
              People.
              <br />
              Purpose.
              <br />
              <span>Possibility.</span>
            </div>
            <div className="about-art-shapes">
              <div className="shape-ring" />
              <div className="shape-blue" />
              <div className="shape-grid" />
              <span className="shape-star">✳</span>
              <div className="shape-label">
                <Icon name="sparkle" />
                Complex made simple.
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>WHY WE’RE HERE</Eyebrow>
            <h2>
              Good software should
              <br />
              open doors.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              A clearer way to work. A better experience for your customers. A
              promising idea finally made real.
            </p>
            <p>
              That’s the kind of progress we care about. We bring design and
              engineering into the same conversation, taking the time to
              understand your business before deciding what to build.
            </p>
            <p>
              Our name is a reminder of what we aim for: technology that makes
              the complex feel simple. Not by skipping the hard thinking, but by
              doing it with care.
            </p>
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT WE STAND FOR"
            title="A few things we don’t compromise on."
          />
          <div className="values-grid">
            {[
              {
                icon: "target",
                title: "Purpose before pixels",
                text: "We start with the problem and the people. The right solution follows from asking better questions.",
              },
              {
                icon: "handshake",
                title: "Clarity builds trust",
                text: "We say what we mean, make our work visible, and have the important conversations early.",
              },
              {
                icon: "sparkle",
                title: "Craft is in the details",
                text: "Small choices add up. We care about the interface, the code, and the experience of working together.",
              },
              {
                icon: "sprout",
                title: "Build for tomorrow",
                text: "We make considered choices so your product remains useful, understandable, and adaptable.",
              },
            ].map((v) => (
              <div className="value-card" key={v.title}>
                <Icon name={v.icon} size={28} />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>BETTER, TOGETHER</Eyebrow>
            <h2>
              Think of us as
              <br />
              part of your team.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              You bring the knowledge of your business. We bring a fresh
              perspective and the skills to make things happen.
            </p>
            <p>
              The best work happens when those strengths come together. We
              create space for honest feedback, shared decisions, and a clear
              view of what’s next.
            </p>
            <TextLink href="/approach">Get to know our process</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}

export function Approach() {
  return (
    <>
      <PageHero
        eyebrow="OUR APPROACH"
        title={
          <>
            Clear thinking.
            <br />
            <span className="blue-text">Thoughtful execution.</span>
          </>
        }
        description="A collaborative way of working that turns a complex challenge into clear, manageable steps. You know where we are, where we’re going, and why."
      />
      <section className="section section-top-small">
        <div className="container approach-timeline">
          {steps.map((s) => (
            <div className="approach-row" key={s.number}>
              <span className="approach-number">{s.number}</span>
              <div>
                <h2>
                  {s.title}
                  <span className="blue-text">.</span>
                </h2>
                <p className="lead-text">{s.description}</p>
              </div>
              <div className="approach-output">
                <span>WHAT THIS LOOKS LIKE</span>
                <p>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section soft-section">
        <div className="container">
          <SectionHeading
            eyebrow="NO GUESSWORK"
            title="You’re in the loop. Always."
          />
          <div className="three-grid">
            {[
              {
                icon: "users",
                title: "A shared working rhythm",
                text: "We agree how we communicate, when we review progress, and who makes decisions before the work begins.",
              },
              {
                icon: "layout",
                title: "Progress you can see",
                text: "Working prototypes and software make feedback specific. We keep a shared view of priorities, blockers, and next steps.",
              },
              {
                icon: "shield",
                title: "A considered handover",
                text: "Documentation, source files, and a practical walkthrough make your team ready to take ownership after launch.",
              },
            ].map((x) => (
              <div className="simple-feature" key={x.title}>
                <Icon name={x.icon} size={26} />
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container narrow centered">
          <Eyebrow>START WITH A CONVERSATION</Eyebrow>
          <h2>
            You don’t need
            <br />
            all the answers yet.
          </h2>
          <p className="lead-text">
            Bring the challenge, the ambition, or the thing that isn’t working.
            We’ll help you find a sensible next step.
          </p>
          <Button href="/contact" icon="diagonal">
            Tell us what you have in mind
          </Button>
        </div>
      </section>
    </>
  );
}

export function Industries() {
  return (
    <>
      <PageHero
        eyebrow="BUILT FOR YOUR WORLD"
        title={
          <>
            Different businesses.
            <br />
            <span className="blue-text">The same thoughtful approach.</span>
          </>
        }
        description="Every industry has its own language, workflows, and challenges. We start by understanding yours, then build around the people who use it."
      />
      <section className="section section-top-small">
        <div className="container industries-grid">
          {industries.map((i) => (
            <article className="industry-card" key={i.name}>
              <span className="service-icon blue">
                <Icon name={i.icon} size={25} />
              </span>
              <h2>{i.name}</h2>
              <p>{i.description}</p>
              <ul>
                {i.needs.map((n) => (
                  <li key={n}>
                    <Icon name="check" size={16} />
                    {n}
                  </li>
                ))}
              </ul>
              <TextLink
                href={`/contact?industry=${encodeURIComponent(i.name)}`}
              >
                Let’s explore your challenge
              </TextLink>
            </article>
          ))}
        </div>
      </section>
      <section className="section soft-section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>YOUR CONTEXT MATTERS</Eyebrow>
            <h2>
              We bring curiosity.
              <br />
              You bring the context.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              We don’t assume your business works like everyone else’s.
            </p>
            <p>
              We work with your team to understand important rules, existing
              systems, accessibility needs, and operational constraints. Where
              specialist expertise is needed, we identify it early and include
              the right people in the process.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

const technologyGroups = [
  {
    title: "Experiences people enjoy",
    label: "FRONTEND",
    description:
      "Responsive, accessible interfaces built from reusable components.",
    tools: [
      ["React", "Flexible interfaces and reusable components."],
      ["Next.js", "Content-led sites and full-stack web experiences."],
      ["TypeScript", "Clearer contracts and maintainable application code."],
      ["HTML & CSS", "The foundations of accessible, responsive experiences."],
    ],
  },
  {
    title: "The work behind the experience",
    label: "BACKEND & DATA",
    description:
      "Dependable APIs, well-structured data, and services that work together.",
    tools: [
      ["Node.js", "APIs, integrations, and application services."],
      ["Python", "Data workflows, automation, and backend services."],
      ["PostgreSQL", "Structured application data and reporting."],
      ["Redis", "Caching and background workflow coordination."],
    ],
  },
  {
    title: "Ready for the real world",
    label: "DELIVERY & QUALITY",
    description:
      "A considered path from local development to a maintainable live product.",
    tools: [
      ["AWS", "Infrastructure matched to the application’s needs."],
      ["Docker", "Consistent development and deployment environments."],
      ["GitHub", "Source control, reviews, and delivery workflows."],
      ["Playwright", "Browser testing for essential user journeys."],
    ],
  },
];
export function Technologies() {
  return (
    <>
      <PageHero
        eyebrow="OUR TECHNOLOGY TOOLKIT"
        title={
          <>
            Good tools.
            <br />
            <span className="blue-text">Better judgment.</span>
          </>
        }
        description="We choose technology to fit the problem, your team, and the long-term needs of your business. Here are some of the tools that can form that foundation."
      />
      {technologyGroups.map((group) => (
        <section className="section tech-group" key={group.label}>
          <div className="container">
            <SectionHeading
              eyebrow={group.label}
              title={group.title}
              description={group.description}
            />
            <div className="tool-grid">
              {group.tools.map(([title, text]) => (
                <div key={title}>
                  <span className="tool-monogram">
                    {title === "TypeScript"
                      ? "TS"
                      : title === "PostgreSQL"
                        ? "Pg"
                        : title === "HTML & CSS"
                          ? "<>"
                          : title.slice(0, 2)}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section soft-section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>THE RIGHT FOUNDATION</Eyebrow>
            <h2>
              The stack follows
              <br />
              the strategy.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              A popular tool is not automatically the right tool.
            </p>
            <p>
              We consider your existing systems, internal skills, budget,
              hosting requirements, and expected scale. The goal is software
              your team can understand and maintain, with as little unnecessary
              complexity as possible.
            </p>
            <TextLink href="/contact">
              Talk through your technology choices
            </TextLink>
          </div>
        </div>
      </section>
    </>
  );
}

export function Careers() {
  return (
    <>
      <PageHero
        eyebrow="CAREERS AT SIMPTECH"
        title={
          <>
            Care about the craft?
            <br />
            <span className="blue-text">You’re in good company.</span>
          </>
        }
        description="We’re interested in people who ask thoughtful questions, care about the details, and make the people around them better."
      />
      <section className="section section-top-small">
        <div className="container">
          <div className="careers-banner">
            <Icon name="sparkle" size={46} />
            <div>
              <h2>
                Meaningful problems.
                <br />
                Room to do good work.
              </h2>
              <p>
                Our ideal way of working is collaborative, curious, and grounded
                in respect—for our teammates, our clients, and the people using
                what we build.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="WHAT WE VALUE"
            title="Bring your perspective. Keep your curiosity."
          />
          <div className="three-grid">
            <div className="simple-feature">
              <Icon name="book" size={28} />
              <h3>Keep learning</h3>
              <p>
                Ask why, share what you discover, and stay open to a better way
                of doing things.
              </p>
            </div>
            <div className="simple-feature">
              <Icon name="users" size={28} />
              <h3>Make others better</h3>
              <p>
                Communicate clearly, offer useful feedback, and treat every
                discipline as part of the same team.
              </p>
            </div>
            <div className="simple-feature">
              <Icon name="target" size={28} />
              <h3>Care about the outcome</h3>
              <p>
                Look beyond the task to understand the person, the problem, and
                the difference your work makes.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>OPPORTUNITIES</Eyebrow>
            <h2>
              Let’s stay
              <br />
              in the conversation.
            </h2>
          </div>
          <div>
            <p className="lead-text">
              There are no open roles listed right now.
            </p>
            <p>
              If our approach resonates with you, you can prepare an
              introduction through our contact page. Include your area of
              interest and a link to work you’re proud of. Please don’t include
              sensitive personal documents.
            </p>
            <Button href="/contact?interest=careers" icon="diagonal">
              Introduce yourself
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
