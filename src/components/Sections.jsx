import { useState } from "react";
import { articles, projects, services, testimonials } from "../data/content";
import { ArticleArt, ProjectVisual } from "./ProductVisuals";
import { Eyebrow, Icon, SectionHeading, Tag, TextLink } from "./ui";

export function ServiceGrid({ limit }) {
  return (
    <div className="services-grid">
      {services.slice(0, limit).map((service, i) => (
        <a
          className="service-card"
          key={service.slug}
          href={`/services/${service.slug}`}
        >
          <div className="service-card-top">
            <span className={`service-icon ${service.accent}`}>
              <Icon name={service.icon} size={24} />
            </span>
            <span className="service-number">0{i + 1}</span>
          </div>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <span className="service-card-link">
            Explore service <Icon name="arrow" size={18} />
          </span>
        </a>
      ))}
    </div>
  );
}

export function ProjectCard({ project, featured = false }) {
  return (
    <article className={`project-card ${featured ? "project-featured" : ""}`}>
      <a
        href={`/work/${project.slug}`}
        className={`project-image ${project.theme}`}
        aria-label={`Explore ${project.name} concept`}
      >
        <div className="project-image-label">
          <span>{project.name}</span>
          <span>CONCEPT EXPLORATION</span>
        </div>
        <div className="project-ui">
          <ProjectVisual type={project.visual} />
        </div>
        <span className="project-open">
          <Icon name="diagonal" size={22} />
        </span>
      </a>
      <div className="project-info">
        <div>
          <span className="project-category">{project.category}</span>
          <h3>
            <a href={`/work/${project.slug}`}>{project.title}</a>
          </h3>
          <p>{project.description}</p>
        </div>
        <div className="tag-list">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProjectGrid({ limit, filter = "All projects" }) {
  const list = projects.filter(
    (p) => filter === "All projects" || p.type === filter,
  );
  return (
    <div className="projects-grid">
      {list.slice(0, limit).map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
    </div>
  );
}

export function ArticleCard({ article }) {
  return (
    <article className="article-card">
      <a
        className="article-image"
        href={`/insights/${article.slug}`}
        aria-label={article.title}
      >
        <ArticleArt type={article.visual} />
        <span className="article-image-arrow">
          <Icon name="diagonal" size={20} />
        </span>
      </a>
      <div className="article-meta">
        <span>{article.category}</span>
        <span>{article.minutes} min read</span>
      </div>
      <h3>
        <a href={`/insights/${article.slug}`}>{article.title}</a>
      </h3>
      <p>{article.excerpt}</p>
      <TextLink href={`/insights/${article.slug}`}>Read the story</TextLink>
    </article>
  );
}

export function InsightsSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="A LITTLE PERSPECTIVE"
          title={
            <>
              Ideas worth
              <br className="desktop-break" /> thinking about.
            </>
          }
          description="Practical thoughts on building better digital experiences."
          link={{ href: "/insights", label: "Explore our insights" }}
        />
        <div className="articles-grid">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

const tech = [
  { name: "React", symbol: "⚛", color: "#087e9e" },
  { name: "Next.js", symbol: "N", color: "#161c27" },
  { name: "TypeScript", symbol: "TS", color: "#2876bd" },
  { name: "Node.js", symbol: "JS", color: "#45783e" },
  { name: "Python", symbol: "Py", color: "#3e6f97" },
  { name: "PostgreSQL", symbol: "P", color: "#396989" },
  { name: "AWS", symbol: "aws", color: "#283b4b" },
];
export function TechStrip() {
  return (
    <section className="tech-section">
      <div className="container">
        <div className="tech-heading">
          <span>GOOD IDEAS. SOLID FOUNDATIONS.</span>
          <a href="/technologies">
            Our technology toolkit <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="tech-logos">
          {tech.map((t) => (
            <span className="tech-logo" key={t.name}>
              <span
                style={{ color: t.color }}
                className={`tech-symbol tech-${t.name.toLowerCase().replace(".", "")}`}
              >
                {t.symbol}
              </span>
              <strong>{t.name}</strong>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnershipSection() {
  const [active, setActive] = useState(0);
  if (testimonials.length) {
    const t = testimonials[active];
    return (
      <section className="partnership-section">
        <div className="container partnership-grid">
          <div>
            <Eyebrow>IN GOOD COMPANY</Eyebrow>
            <h2>
              Good work.
              <br />
              Better relationships.
            </h2>
          </div>
          <div>
            <blockquote>“{t.quote}”</blockquote>
            <p className="quote-attribution">
              {t.name}
              <span>
                {t.role}, {t.company}
              </span>
            </p>
            {testimonials.length > 1 && (
              <div className="quote-controls">
                {testimonials.map((q, i) => (
                  <button
                    key={i}
                    aria-label={`Show testimonial from ${q.name}`}
                    aria-pressed={active === i}
                    onClick={() => setActive(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="partnership-section">
      <div className="container partnership-grid">
        <div>
          <Eyebrow>A PARTNER, NOT JUST A PROVIDER</Eyebrow>
          <h2>
            Good software starts
            <br />
            with good people.
          </h2>
          <TextLink href="/about">Get to know SimpTech</TextLink>
        </div>
        <div>
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <blockquote>
            You should feel as good about the people building your software as
            you do about the software itself.
          </blockquote>
          <div className="quote-attribution">
            <span className="promise-mark">
              <Icon name="handshake" size={24} />
            </span>
            <div>
              Our promise to your team
              <span>
                Clear conversations. Shared ownership. Thoughtful work.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
