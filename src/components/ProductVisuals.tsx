import { Icon } from "./ui";

function Chart({ small = false }) {
  return (
    <svg
      className="revenue-chart"
      viewBox="0 0 440 130"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 20H440M0 60H440M0 100H440"
        stroke="#f1f0ef"
        strokeDasharray="4 4"
      />
      <path
        d="m0 113 24-10 20 8 24-26 25 8 26-28 22 6 25-15 22 8 25-28 23 7 24-24 20 9 25-25 23 5 24-18 18 7 25-23v131H0Z"
        fill="#f5f5f4"
      />
      <path
        d="m0 113 24-10 20 8 24-26 25 8 26-28 22 6 25-15 22 8 25-28 23 7 24-24 20 9 25-25 23 5 24-18 18 7 25-23"
        stroke="#9a9893"
        strokeWidth={small ? 3 : 2.6}
        strokeLinejoin="round"
      />
      <path
        d="m0 119 24-1 20-8 24 4 25-12 26 8 22-16 25 5 22-10 25 4 23-12 24 5 20-8 25 1 23-11 24 5 18-10 25 3"
        stroke="#d8d8d6"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
    </svg>
  );
}

export function Dashboard({ compact = false }) {
  return (
    <div
      className={`product-window dashboard-window ${compact ? "compact" : ""}`}
      aria-label="Meridian analytics interface concept with sample revenue and customer data"
      role="img"
    >
      <div className="window-top">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>meridian.app / overview</span>
        <Icon name="shield" size={12} />
      </div>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <div className="mock-logo">
            <span>m</span>meridian<span className="mock-logo-dot">.</span>
          </div>
          <small>WORKSPACE</small>
          {[
            ["layout", "Overview"],
            ["chart", "Analytics"],
            ["users", "Customers"],
            ["layers", "Products"],
          ].map(([icon, label], i) => (
            <div
              className={`mock-nav ${i === 0 ? "selected" : ""}`}
              key={label}
            >
              <Icon name={icon} size={13} />
              <span>{label}</span>
            </div>
          ))}
          <div className="mock-sidebar-bottom">
            <span className="mock-avatar">JD</span>
            <span>
              Jamie Davis<small>Workspace admin</small>
            </span>
          </div>
        </aside>
        <div className="dashboard-main">
          <div className="mock-page-title">
            <div>
              <h3>
                Business overview <span>✧</span>
              </h3>
              <p>A little clarity for your next big move.</p>
            </div>
            <span className="mock-date">
              This month <Icon name="chevron" size={10} />
            </span>
          </div>
          <div className="mock-metrics">
            {[
              ["Total revenue", "$48,250", "12.8%"],
              ["Active customers", "2,840", "8.2%"],
              ["Conversion rate", "4.68%", "2.4%"],
            ].map(([label, value, change]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
                <span>
                  ↗ {change}
                  <i> vs. last month</i>
                </span>
              </div>
            ))}
          </div>
          <div className="mock-chart-card">
            <div className="mock-card-title">
              <strong>Revenue overview</strong>
              <span>
                <i />
                Revenue <i />
                Previous period
              </span>
            </div>
            <div className="mock-chart-row">
              <div className="chart-labels">
                <span>$50k</span>
                <span>$25k</span>
                <span>$0</span>
              </div>
              <div className="chart-area">
                <Chart />
                <div className="chart-axis">
                  <span>01 Jun</span>
                  <span>07 Jun</span>
                  <span>14 Jun</span>
                  <span>21 Jun</span>
                  <span>30 Jun</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mock-bottom">
            <div>
              <strong>Recent activity</strong>
              <div>
                <span className="activity-icon">
                  <Icon name="bag" size={12} />
                </span>
                <span>
                  New subscription<small>Professional plan</small>
                </span>
                <b>+$249.00</b>
              </div>
              <div>
                <span className="activity-icon purple">
                  <Icon name="users" size={12} />
                </span>
                <span>
                  Workspace upgraded<small>Team plan</small>
                </span>
                <b>+$129.00</b>
              </div>
            </div>
            <div className="mock-goal">
              <strong>Monthly target</strong>
              <div className="goal-track">
                <span />
              </div>
              <small>
                <b>78%</b> of your monthly goal
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-blue-shape" />
      <div className="hero-grid" />
      <div className="hero-orbit" />
      <div className="hero-mini-label">
        <span /> IDEAS INTO IMPACT
      </div>
      <div className="hero-dashboard">
        <Dashboard />
      </div>
      <div className="floating-progress">
        <span className="progress-icon">
          <Icon name="check" size={21} />
        </span>
        <div>
          <strong>Built around your business</strong>
          <span>Designed to move you forward.</span>
        </div>
        <Icon name="sparkle" size={19} />
      </div>
      <div className="floating-code">
        <span>&lt;/&gt;</span>Thoughtfully engineered.
      </div>
      <svg
        className="hero-spark"
        viewBox="0 0 60 60"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M30 2v56M2 30h56M10 10l40 40M10 50l40-40"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
      <span className="visual-caption">
        A little glimpse of what’s possible. Concept interface.
      </span>
    </div>
  );
}

const tasks = [
  {
    title: "To do",
    color: "gray",
    cards: [
      ["Website exploration", "Design", "AS", "MI"],
      ["Customer interviews", "Research", "JD"],
      ["Content structure", "Planning", "KL"],
    ],
  },
  {
    title: "In progress",
    color: "blue",
    cards: [
      ["Build something great", "Development", "MI", "JD"],
      ["Dashboard components", "Design", "AS"],
    ],
  },
  {
    title: "Done",
    color: "green",
    cards: [
      ["A clear direction", "Strategy", "JD", "KL"],
      ["Design system", "Design", "AS", "MI"],
    ],
  },
];
export function Board() {
  return (
    <div
      className="product-window board-window"
      role="img"
      aria-label="Orbit project workspace concept showing sample tasks across three stages"
    >
      <div className="window-top">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>orbit.app / workspace</span>
        <Icon name="shield" size={12} />
      </div>
      <div className="board-toolbar">
        <div className="orbit-logo">
          <span>◒</span> orbit
        </div>
        <span>
          Workspace <Icon name="chevron" size={12} />
        </span>
        <div className="avatar-stack">
          <i>AS</i>
          <i>MI</i>
          <i>JD</i>
        </div>
      </div>
      <div className="board-content">
        <div className="board-title">
          <div>
            <small>WORKSPACE / PRODUCT TEAM</small>
            <h3>Great things, together.</h3>
          </div>
          <span className="mock-button">+ New task</span>
        </div>
        <div className="board-view">
          <span>
            <Icon name="layout" size={12} />
            Board view
          </span>
          <small>List view</small>
          <small>Timeline</small>
        </div>
        <div className="kanban">
          {tasks.map((col) => (
            <div className="kanban-column" key={col.title}>
              <div className="kanban-heading">
                <i className={col.color} />
                {col.title}
                <span>{col.cards.length}</span>
                <b>+</b>
              </div>
              {col.cards.map(([title, tag, ...people]) => (
                <div className="kanban-card" key={title}>
                  <span className={`task-tag ${tag.toLowerCase()}`}>{tag}</span>
                  <strong>{title}</strong>
                  <div>
                    <span>☷ &nbsp; 2</span>
                    <div className="avatar-stack">
                      {people.map((p) => (
                        <i key={p}>{p}</i>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Commerce() {
  return (
    <div
      className="product-window commerce-window"
      role="img"
      aria-label="Aster storefront concept featuring original illustrations of a vase and everyday objects"
    >
      <div className="commerce-nav">
        <strong>
          aster<span>®</span>
        </strong>
        <span>Objects &nbsp; Spaces &nbsp; Our story</span>
        <Icon name="bag" size={14} />
      </div>
      <div className="commerce-body">
        <div>
          <small>LESS, BUT LOVELIER.</small>
          <h3>
            Good things.
            <br />
            For the everyday.
          </h3>
          <p>
            Thoughtful objects for the spaces
            <br />
            and moments you call your own.
          </p>
          <span className="commerce-button">
            Explore the collection <Icon name="arrow" size={12} />
          </span>
        </div>
        <div className="still-life">
          <div className="vase">
            <div />
          </div>
          <div className="vase-shadow" />
          <div className="sculpture" />
          <div className="still-circle" />
          <div className="still-stem" />
        </div>
      </div>
      <div className="commerce-bottom">
        <span>Considered design.</span>
        <span>Made to stay.</span>
        <span>Beautifully everyday.</span>
      </div>
    </div>
  );
}

export function ProjectVisual({ type }: { type: string }) {
  return type === "board" ? (
    <Board />
  ) : type === "commerce" ? (
    <Commerce />
  ) : (
    <Dashboard compact />
  );
}

export function ArticleArt({ type }: { type: string }) {
  const labels: Record<string, string[]> = {
    blocks: ["01", "A better beginning.", "PRODUCT THINKING"],
    chart: ["02", "Clarity is a competitive edge.", "BUSINESS INTELLIGENCE"],
    flow: ["03", "Make room for the human.", "CONNECTED WORKFLOWS"],
  };
  const [number, title, label] = labels[type] || labels.blocks;
  return (
    <div className={`journal-art journal-${type}`} aria-hidden="true">
      <div className="journal-top">
        <span>SIMPTECH / PERSPECTIVES</span>
        <span>{number}</span>
      </div>
      <strong>{title}</strong>
      <div className="journal-graphic">
        {type === "blocks" ? (
          <span className="journal-asterisk">✳</span>
        ) : type === "chart" ? (
          <svg viewBox="0 0 360 150">
            <path
              d="M0 140 40 110 80 125 120 75 160 90 200 35 240 60 290 15 360 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M0 150H360M0 100H360M0 50H360"
              stroke="currentColor"
              opacity=".15"
            />
          </svg>
        ) : (
          <div className="journal-orbits">
            <i />
            <i />
            <i />
            <span>↗</span>
          </div>
        )}
      </div>
      <span className="journal-bottom">{label}</span>
    </div>
  );
}
