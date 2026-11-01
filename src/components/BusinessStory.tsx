import { Reveal, useSiteMotion } from "./MotionSystem";
import { Eyebrow, Icon } from "./ui";

const practices = [
  {
    n: "01",
    title: "Websites & digital experiences",
    text: "A sharper first impression. A clearer path to your next customer.",
    tags: "BRAND WEBSITES / WEB APPLICATIONS / COMMERCE",
    href: "/services/website-development",
    icon: "globe",
  },
  {
    n: "02",
    title: "Dashboards & business intelligence",
    text: "See the whole picture. Give every decision a stronger foundation.",
    tags: "ANALYTICS / REPORTING / DATA VISUALIZATION",
    href: "/services/business-analytics",
    icon: "chart",
  },
  {
    n: "03",
    title: "AI engines & intelligent chatbots",
    text: "Connect your knowledge to the people and workflows that need it.",
    tags: "AI SYSTEMS / KNOWLEDGE ASSISTANTS / CHATBOTS",
    href: "/services/ai-engine-development",
    icon: "sparkle",
  },
  {
    n: "04",
    title: "Software that runs your business",
    text: "Bring customers, teams, orders, and operations into sync.",
    tags: "CRM / ERP / INVENTORY / AUTOMATION",
    href: "/services/erp-development",
    icon: "layers",
  },
];
export function BusinessStory() {
  return (
    <section className="business-story" id="business-solutions">
      <div className="container business-story-grid">
        <Reveal className="business-story-intro">
          <Eyebrow>AMBITION, MEET EXECUTION.</Eyebrow>
          <h2>
            Big thinking.
            <br />
            Meticulous
            <br />
            <span>making.</span>
          </h2>
          <p>
            We bring design and engineering together to solve the things that
            hold your business back—and build what moves it forward.
          </p>
          <a href="/services" className="business-all-link">
            Discover our capabilities <Icon name="diagonal" size={18} />
          </a>
        </Reveal>
        <div className="business-practices">
          {practices.map((p) => (
            <Reveal key={p.n}>
              <a className="business-practice" href={p.href}>
                <span className="practice-number">{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <small>{p.tags}</small>
                </div>
                <Icon name="diagonal" size={22} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
