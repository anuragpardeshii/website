import { useState } from "react";
import { projects } from "../data/content";
import { ProjectGrid } from "../components/Sections";
import { SystemPreview } from "../components/EnterpriseVisuals";
import { WhatWeBuild } from "../components/WhatWeBuild";
import {
  Breadcrumb,
  Button,
  Eyebrow,
  Icon,
  PageHero,
  SectionHeading,
  Tag,
  TextLink,
} from "../components/ui";

export function Work() {
  const [filter, setFilter] = useState("All projects");
  return (
    <>
      <PageHero
        eyebrow="OUR WORK & EXPLORATIONS"
        title={
          <>
            Ideas you can see.
            <br />
            <span className="blue-text">Possibilities you can build on.</span>
          </>
        }
        description="Original product concepts that show how we think about design, technology, and the problems software can solve."
      />
      <WhatWeBuild workPage />
      <section className="section section-top-small" id="project-concepts">
        <div className="container">
          <div className="work-concepts-heading">
            <Eyebrow>SELECTED PRODUCT EXPLORATIONS</Eyebrow>
            <h2>Ideas, made tangible.</h2>
            <p>
              Explore the design thinking and engineering approach behind our
              original product concepts.
            </p>
          </div>
          <div className="filter-row" aria-label="Filter projects">
            {["All projects", "Analytics", "CRM", "Commerce", "Logistics"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={filter === f ? "selected" : ""}
                >
                  {f}
                </button>
              ),
            )}
          </div>
          <div aria-live="polite" className="sr-only">
            {
              projects.filter(
                (p) => filter === "All projects" || p.type === filter,
              ).length
            }{" "}
            projects shown
          </div>
          <ProjectGrid filter={filter} />
          <div className="concept-note">
            <Icon name="sparkle" size={20} />
            <p>
              These are self-initiated design and development concepts, created
              to make our approach tangible. Names, interfaces, and sample data
              are illustrative; they are not client endorsements or delivered
              client projects.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProjectDetail({ project }) {
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Our work", href: "/work" },
            { label: project.name },
          ]}
        />
      </div>
      <section className="project-detail-heading">
        <div className="container">
          <Eyebrow>CONCEPT EXPLORATION · {project.name}</Eyebrow>
          <h1>{project.title}</h1>
          <div className="project-detail-sub">
            <p>{project.description}</p>
            <div className="tag-list">
              {project.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        <div className={`project-showcase ${project.theme}`}>
          <div className="showcase-brand">
            {project.name}
            <span>DESIGNED TO MAKE A DIFFERENCE.</span>
          </div>
          <SystemPreview mode={project.visual} />
        </div>
      </div>
      <section className="section">
        <div className="container case-study-grid">
          <aside>
            <span className="eyebrow">PROJECT AT A GLANCE</span>
            <dl>
              <dt>Project type</dt>
              <dd>Self-initiated concept</dd>
              <dt>Focus</dt>
              <dd>{project.category}</dd>
              <dt>Suggested toolkit</dt>
              <dd>{project.stack.join(", ")}</dd>
              <dt>Scope</dt>
              <dd>
                Product strategy, interface design, and frontend exploration
              </dd>
            </dl>
          </aside>
          <div className="case-study-copy">
            <Eyebrow>THE CHALLENGE</Eyebrow>
            <h2>A better everyday experience.</h2>
            <p>{project.challenge}</p>
            <Eyebrow>THE APPROACH</Eyebrow>
            <h2>Clarity at every step.</h2>
            <p>{project.approach}</p>
            <Eyebrow>THE EXPERIENCE</Eyebrow>
            <h2>Purposeful in the details.</h2>
            <ul className="check-list">
              {project.features.map((f) => (
                <li key={f}>
                  <Icon name="check" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="case-note">
              This is an original product exploration. The interface contains
              sample data and does not represent a live commercial product or
              measured client results.
            </div>
            <Button href={`/contact?project=${project.slug}`} icon="diagonal">
              Build something like this
            </Button>
          </div>
        </div>
      </section>
      <section className="next-project">
        <div className="container">
          <span>KEEP EXPLORING</span>
          <a href={`/work/${next.slug}`}>
            <h2>{next.name}</h2>
            <Icon name="diagonal" size={42} />
          </a>
          <p>{next.description}</p>
        </div>
      </section>
    </>
  );
}
