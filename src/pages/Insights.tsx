import type { Article } from "../types";
import { useState } from "react";
import { articles } from "../data/content";
import { ArticleCard } from "../components/Sections";
import { ArticleArt } from "../components/ProductVisuals";
import {
  Breadcrumb,
  Eyebrow,
  Icon,
  PageHero,
  SectionHeading,
  TextLink,
} from "../components/ui";

export function Insights() {
  const [category, setCategory] = useState("All insights");
  const [query, setQuery] = useState("");
  const filtered = articles.filter(
    (a) =>
      (category === "All insights" || a.category === category) &&
      `${a.title} ${a.excerpt}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="THE SIMPTECH JOURNAL"
        title={
          <>
            A little perspective.
            <br />
            <span className="accent-text">A better way forward.</span>
          </>
        }
        description="Practical thinking on products, design, development, and making technology work better for your business."
      />
      <section className="section section-top-small">
        <div className="container">
          <div className="insights-controls">
            <div className="filter-row" aria-label="Filter articles">
              {[
                "All insights",
                ...new Set(articles.map((a) => a.category)),
              ].map((c) => (
                <button
                  key={c}
                  className={c === category ? "selected" : ""}
                  aria-pressed={c === category}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Icon name="search" size={18} />
              <input
                type="search"
                aria-label="Search insights"
                placeholder="Find an insight…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="sr-only" aria-live="polite">
            {filtered.length} articles found
          </div>
          {filtered.length ? (
            <div className="articles-grid">
              {filtered.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" size={32} />
              <h2>No insights found.</h2>
              <p>Try a different search or explore all our articles.</p>
              <button
                className="text-link"
                onClick={() => {
                  setCategory("All insights");
                  setQuery("");
                }}
              >
                Clear filters <Icon name="arrow" size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="section soft-section">
        <div className="container split-editorial">
          <div>
            <Eyebrow>LET’S THINK IT THROUGH</Eyebrow>
            <h2>
              Have a challenge
              <br />
              on your mind?
            </h2>
          </div>
          <div>
            <p className="lead-text">
              Sometimes a conversation is the most useful place to start.
            </p>
            <p>
              Whether you’re weighing a product idea, planning a redesign, or
              looking for a better way to work, we’re here to help make the next
              step clearer.
            </p>
            <TextLink href="/contact">Start the conversation</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}

export function ArticleDetail({ article }: { article: Article }) {
  const [copyStatus, setCopyStatus] = useState("");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Copy the URL from your browser to share this article.");
    }
  }
  return (
    <>
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Insights", href: "/insights" },
            { label: article.category },
          ]}
        />
      </div>
      <article>
        <header className="article-detail-heading container">
          <Eyebrow>{article.category}</Eyebrow>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div className="article-byline">
            <span className="author-avatar">S.</span>
            <span>
              SimpTech Editorial<span>Product, design & engineering</span>
            </span>
            <span className="article-reading">
              <Icon name="clock" size={16} />
              {article.minutes} min read
            </span>
          </div>
        </header>
        <div className="container article-cover">
          <ArticleArt type={article.visual} />
        </div>
        <div className="container article-reading-layout">
          <aside className="article-toc">
            <span className="eyebrow">IN THIS ARTICLE</span>
            <nav aria-label="Article contents">
              {article.sections.map(([title], i) => (
                <a href={`#section-${i + 1}`} key={title}>
                  {title}
                </a>
              ))}
            </nav>
            <button className="text-link" onClick={copyLink}>
              Share this article <Icon name="external" size={16} />
            </button>
            <span role="status" className="copy-status">
              {copyStatus}
            </span>
          </aside>
          <div className="article-prose">
            {article.sections.map(([title, text], i) => (
              <section key={title} id={`section-${i + 1}`}>
                <span className="article-section-number">0{i + 1}</span>
                <h2>{title}</h2>
                <p>{text}</p>
              </section>
            ))}
            <div className="article-end-note">
              <Icon name="sparkle" size={24} />
              <div>
                <h3>From a good question to a clear next step.</h3>
                <p>We help teams turn thoughtful ideas into useful software.</p>
                <TextLink href="/contact">Talk through your project</TextLink>
              </div>
            </div>
          </div>
        </div>
      </article>
      <section className="section soft-section">
        <div className="container">
          <SectionHeading
            eyebrow="KEEP YOUR CURIOSITY"
            title="A little more food for thought."
          />
          <div className="articles-grid two-articles">
            {articles
              .filter((a) => a.slug !== article.slug)
              .map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
