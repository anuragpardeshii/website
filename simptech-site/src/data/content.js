import { solutions } from "./solutions.js";
// Edit the site here. Project concepts are intentionally distinguished from client work.
export const site = {
  name: "SleekTech",
  tagline: "Complex challenges. Simple solutions.",
  origin: "https://simptech-digital-studio.teethfast.chatgpt.site",
  contactEmail: "", // Add a verified public email to enable the email handoff.
  description:
    "Distinctive websites. Connected business software. SleekTech designs and engineers CRM, ERP, analytics, commerce, and logistics platforms that move businesses forward.",
};

// Add only approved, attributable client quotes. The section appears automatically.
export const testimonials = [];
// Example shape: { quote: 'Approved quote', name: 'Full name', role: 'Role', company: 'Company' }

export const legacyServices = [
  {
    slug: "website-development",
    icon: "globe",
    title: "Website development",
    short: "A first impression that opens doors.",
    description:
      "Fast, accessible websites that bring your brand to life and turn interest into meaningful conversations.",
    headline: "Your business deserves a better first impression.",
    intro:
      "We bring strategy, design, and engineering together to build websites that feel like you—and work for the people you want to reach.",
    accent: "blue",
    deliverables: [
      "Brand-led interface design",
      "Responsive React development",
      "Accessible navigation and content",
      "CMS and content workflows",
      "Search foundations and performance",
      "Launch support and documentation",
    ],
    problem:
      "Your website should do more than look good. It needs to explain your value, help visitors find what matters, and make the next step feel natural.",
    solution:
      "We start with your audience and content, map clear journeys, and build a reusable design system. The result is a website your team can confidently maintain as your business evolves.",
    outcomes: [
      "A clear story from the first scroll",
      "A consistent experience on every screen",
      "A flexible foundation for new content",
    ],
    fit: "Company websites, service businesses, product launches, and content-led brands.",
  },
  {
    slug: "web-applications",
    icon: "code",
    title: "Web applications",
    short: "Your big idea. Beautifully engineered.",
    description:
      "Intuitive, reliable applications that connect your users, your data, and the way your business works.",
    headline: "Make the complex feel effortless.",
    intro:
      "From customer portals to operational platforms, we turn complicated requirements into useful software that people enjoy using.",
    accent: "purple",
    deliverables: [
      "Product discovery and user journeys",
      "Interactive prototypes",
      "Frontend and API development",
      "Authentication and access controls",
      "Integrations and automated testing",
      "Deployment and technical handover",
    ],
    problem:
      "Disconnected tools and awkward workflows make everyday work harder than it should be. A custom application can bring the right information and actions into one place.",
    solution:
      "We identify the essential workflows first, test the interface before building, and deliver in reviewable increments. Every feature earns its place by solving a real user problem.",
    outcomes: [
      "Workflows built around your users",
      "Connected data and fewer handoffs",
      "A product that can evolve with demand",
    ],
    fit: "Customer portals, booking platforms, collaboration tools, and internal applications.",
  },
  {
    slug: "admin-dashboards",
    icon: "layout",
    title: "Admin dashboards",
    short: "Everything you need. All in one place.",
    description:
      "Thoughtful control centers that make managing users, operations, and everyday decisions feel effortless.",
    headline: "Less switching tabs. More moving forward.",
    intro:
      "Give your team a clear, dependable place to manage the work that keeps your business running.",
    accent: "mint",
    deliverables: [
      "Role-based dashboards",
      "Search, filtering, and bulk actions",
      "User and permission management",
      "Operational reports",
      "Audit history and activity views",
      "Responsive data tables",
    ],
    problem:
      "Growing teams often outgrow spreadsheets before they have a replacement. Important actions become scattered across inboxes, tabs, and disconnected systems.",
    solution:
      "We map the decisions each role needs to make, then create focused views and safe, predictable interactions. Clear statuses and useful defaults keep daily operations moving.",
    outcomes: [
      "The right view for every role",
      "Fewer repetitive administrative steps",
      "Clearer ownership and operational visibility",
    ],
    fit: "Order management, service operations, inventory, and back-office teams.",
  },
  {
    slug: "business-analytics",
    icon: "chart",
    title: "Business analytics",
    short: "Turn your data into your next move.",
    description:
      "Clear reporting and purposeful visualizations that help your team see the bigger picture and act with confidence.",
    headline: "Find the story behind your numbers.",
    intro:
      "Bring scattered data into focus with analytics experiences designed around the questions your business needs to answer.",
    accent: "yellow",
    deliverables: [
      "Metric and reporting discovery",
      "Data source integration",
      "Interactive reporting dashboards",
      "Filters, comparisons, and exports",
      "Data quality checks",
      "Metric definitions and documentation",
    ],
    problem:
      "More charts do not always mean more clarity. Without shared definitions and reliable data, even a beautiful dashboard can send a team in the wrong direction.",
    solution:
      "We work backward from your decisions: agree on meaningful measures, connect the relevant sources, and design views that make patterns, exceptions, and next steps easy to understand.",
    outcomes: [
      "A shared understanding of key metrics",
      "Reports designed for real decisions",
      "Less time assembling recurring updates",
    ],
    fit: "Sales reporting, operations analysis, product analytics, and leadership dashboards.",
  },
  {
    slug: "saas-products",
    icon: "layers",
    title: "SaaS products",
    short: "From first idea to a product people love.",
    description:
      "Scalable product foundations, thoughtful onboarding, and the features that make your subscription business work.",
    headline: "Build the right product. Then build it right.",
    intro:
      "Move from a promising idea to a useful first release with a product partner who cares about the details and the bigger picture.",
    accent: "pink",
    deliverables: [
      "Product strategy and MVP scoping",
      "Design systems and prototyping",
      "Tenant and account architecture",
      "Subscriptions and billing integration",
      "Onboarding and product analytics",
      "Release planning and ongoing iteration",
    ],
    problem:
      "Early products face a difficult balance: move quickly enough to learn, while building a foundation that will not get in the way of what comes next.",
    solution:
      "We help define the smallest useful product, make architectural choices with your roadmap in mind, and create a steady feedback loop between your users and the team building for them.",
    outcomes: [
      "A focused, testable first release",
      "A consistent product experience",
      "A foundation for thoughtful growth",
    ],
    fit: "New subscription businesses, B2B products, and existing SaaS platforms ready to evolve.",
  },
  {
    slug: "workflow-automation",
    icon: "workflow",
    title: "Workflow automation",
    short: "Let your team focus on the good work.",
    description:
      "Connected systems and dependable automations that take repetitive tasks off your team’s plate.",
    headline: "Make room for the work that matters.",
    intro:
      "Connect your tools, remove unnecessary handoffs, and give repetitive work a reliable path from start to finish.",
    accent: "peach",
    deliverables: [
      "Workflow mapping and prioritization",
      "API and third-party integrations",
      "Approval and notification flows",
      "Scheduled jobs and data sync",
      "Error handling and recovery paths",
      "Monitoring and workflow documentation",
    ],
    problem:
      "Small manual tasks add up. Copying data, chasing approvals, and checking the same systems can take attention away from the work only your team can do.",
    solution:
      "We map the current process before automating it. Then we connect the right systems, keep human review where it matters, and make failures visible so nothing disappears into a black box.",
    outcomes: [
      "Fewer repetitive manual steps",
      "Clear exception handling and ownership",
      "More consistent processes across tools",
    ],
    fit: "Lead routing, onboarding, approvals, data synchronization, and recurring reporting.",
  },
];

export const projects = [
  {
    slug: "meridian-analytics",
    name: "Meridian",
    category: "Business analytics",
    type: "Analytics",
    title: "A clearer picture. A smarter next move.",
    description:
      "An analytics workspace that brings revenue, customers, and business performance into one considered view.",
    theme: "blue",
    visual: "analytics",
    tags: ["Product design", "Dashboard", "React"],
    challenge:
      "Business teams need to understand performance without stitching together a new spreadsheet every week. This concept explores how a focused workspace could make that routine simpler.",
    approach:
      "We organized the experience around three questions: what changed, what caused it, and what needs attention. A calm visual hierarchy keeps summary metrics visible while giving detailed analysis room to breathe.",
    features: [
      "A focused overview with meaningful period comparisons",
      "Revenue trends with clear visual hierarchy",
      "Role-aware views for different business questions",
      "Accessible tables and export-ready reports",
    ],
    stack: ["React", "TypeScript", "PostgreSQL", "Recharts"],
  },
  {
    slug: "orbit-workspace",
    name: "Orbit",
    category: "CRM & customer experience",
    type: "CRM",
    title: "Make every relationship count.",
    description:
      "A considered CRM workspace that brings contacts, conversations, and the next opportunity into one clear view.",
    theme: "cobalt",
    visual: "crm",
    tags: ["CRM", "Web application", "Automation"],
    challenge:
      "Customer context often lives across inboxes, spreadsheets, and individual memory. This concept brings opportunities, ownership, and conversations into one approachable workspace.",
    approach:
      "The design makes pipeline stages and relationship ownership visible. Focused contact records and clear next actions help sales teams keep context through every handoff.",
    features: [
      "A clear opportunity pipeline with meaningful stages",
      "Contact context, ownership, and follow-ups in one view",
      "Rules for routine notifications and handoffs",
      "A consistent workspace across teams",
    ],
    stack: ["React", "Node.js", "PostgreSQL", "Redis"],
  },
  {
    slug: "aster-commerce",
    name: "Aster",
    category: "E-commerce & order management",
    type: "Commerce",
    title: "An everyday brand. An exceptional experience.",
    description:
      "A connected commerce workspace that brings orders, stock availability, and fulfillment progress into focus.",
    theme: "sand",
    visual: "commerce",
    tags: ["Web design", "E-commerce", "Development"],
    challenge:
      "A growing storefront needs a dependable operation behind it. This concept connects the order record to stock allocation, fulfillment progress, and the information customer support needs to help.",
    approach:
      "Clear order stages, consistent product information, and operational context support the complete journey from product discovery to fulfillment. The workspace connects a considered storefront to the people delivering each order.",
    features: [
      "A clear overview of orders and fulfillment status",
      "Consistent product information and stock availability",
      "Focused views for commerce and operations teams",
      "Reusable patterns for order details and customer context",
    ],
    stack: ["React", "Next.js", "TypeScript", "Headless CMS"],
  },
  {
    slug: "atlas-logistics",
    name: "Atlas",
    category: "Inventory & logistics",
    type: "Logistics",
    title: "A business that keeps moving.",
    description:
      "An operations platform concept that connects warehouse stock, order preparation, and shipment visibility in one focused workspace.",
    theme: "ice",
    visual: "logistics",
    tags: ["Inventory", "Logistics", "Operations"],
    challenge:
      "Warehouse teams need to know what is available, what is allocated, and what needs attention. When stock and shipment records live separately, every handoff introduces another opportunity for confusion.",
    approach:
      "The concept follows the movement of an order from allocation to dispatch. Shared stock records, clear status changes, and exception-first views give teams useful context without overwhelming them with data.",
    features: [
      "Stock visibility across locations and storage zones",
      "Order allocation, picking, and dispatch stages",
      "Shipment progress and delivery exceptions",
      "Clear activity records for operational handoffs",
    ],
    stack: ["React", "Node.js", "PostgreSQL", "REST APIs"],
  },
];

export const articles = [
  {
    slug: "before-you-build-your-mvp",
    category: "Product thinking",
    title: "Before you build your MVP, ask these five questions.",
    excerpt:
      "A little clarity at the beginning can save a lot of complexity later. Start with the problem, not the feature list.",
    minutes: 5,
    visual: "blocks",
    sections: [
      [
        "Who has the problem?",
        "“Small businesses” is a market, not a user. Start with a specific person in a specific situation. What are they trying to accomplish? What gets in the way? Talk to people who encounter the problem regularly and listen for the workarounds they already use.",
      ],
      [
        "How do they solve it today?",
        "Your competition might be a spreadsheet, a weekly meeting, or a person who knows how everything works. Understanding the current approach helps you see what a new product must do better—and which familiar behaviors are worth keeping.",
      ],
      [
        "What is the smallest useful outcome?",
        "An MVP should complete a meaningful job, even if it serves a narrow audience. Write that outcome in one sentence. Then challenge every proposed feature: does it help the user reach the outcome, or can it wait until you have learned more?",
      ],
      [
        "What do you need to learn?",
        "Separate assumptions from facts. Perhaps you need to learn whether people will trust a workflow, return to a report, or pay to remove a manual step. Choose a first release that makes the most consequential assumption testable.",
      ],
      [
        "What happens after launch?",
        "Plan how you will gather feedback, observe friction, and decide what to change. Leave room in your schedule for iteration. The first release is the beginning of a conversation with your users, and the quality of that conversation matters as much as the release itself.",
      ],
    ],
  },
  {
    slug: "dashboards-that-drive-decisions",
    category: "Design & development",
    title: "Good dashboards start with better questions.",
    excerpt:
      "The most useful dashboard is rarely the one with the most charts. Here is how to design for decisions.",
    minutes: 4,
    visual: "chart",
    sections: [
      [
        "Start with a decision, not a data source",
        "Before choosing a chart, ask what the person looking at it needs to decide. A team lead might need to spot a growing backlog. A founder might need to understand whether customers are returning. These are different questions and deserve different views.",
      ],
      [
        "Give every metric context",
        "A number without a definition or comparison can be misleading. Make the time range visible. Explain what is included. Where comparisons are useful, compare like with like and make incomplete periods obvious.",
      ],
      [
        "Create a useful hierarchy",
        "Put the most important information first and let people move into detail when they need it. Consistent grouping, restrained color, and readable labels usually do more for understanding than an elaborate visualization.",
      ],
      [
        "Make exceptions easy to notice",
        "Operational dashboards should help people recognize when something needs attention. Use color sparingly, pair it with text or icons, and make it possible to investigate the underlying records.",
      ],
      [
        "Test with the people making the decisions",
        "Give someone a realistic question and ask them to use the dashboard to answer it. Watch where they hesitate. If they cannot explain what a number means or what to do next, the design needs another pass.",
      ],
    ],
  },
  {
    slug: "automate-the-right-things",
    category: "Business & technology",
    title: "Automate the repetitive. Keep the human.",
    excerpt:
      "A practical way to find automation opportunities without turning a messy process into a faster messy process.",
    minutes: 4,
    visual: "flow",
    sections: [
      [
        "Make the current process visible",
        "Write down the steps as they actually happen, including the workarounds. Who starts the process? What information is missing? Where does it wait? A simple map often reveals improvements before any code is written.",
      ],
      [
        "Look for predictable, repeated work",
        "Good early candidates follow clear rules, happen frequently, and involve information that is already digital. Examples include routing a qualified inquiry, synchronizing a status, or assembling a recurring report.",
      ],
      [
        "Keep judgment where it belongs",
        "Approvals, unusual cases, and high-impact decisions may still need a person. Design an explicit handoff with enough context for that person to act. Automation should reduce the effort around a decision without hiding the decision itself.",
      ],
      [
        "Design for the day something fails",
        "External tools change, connections break, and data arrives in unexpected shapes. Decide how failures will be surfaced, who owns recovery, and which actions are safe to retry. A dependable workflow has an understandable failure path.",
      ],
      [
        "Start small and observe",
        "Choose one workflow, agree on what improvement looks like, and compare the result with the original process. Expand once the team understands and trusts the automation. Useful progress is more valuable than an impressive diagram.",
      ],
    ],
  },
];

export const faqs = [
  {
    category: "Getting started",
    question: "What kinds of businesses do you work with?",
    answer:
      "We focus on teams that need a thoughtful website, a new digital product, or a better way to run their operations. The best starting point is a clear problem and someone on your team who can help us understand it.",
  },
  {
    category: "Getting started",
    question: "Can you help if we only have an idea?",
    answer:
      "Yes. Discovery is designed for exactly that stage. We work through your audience, the problem, the essential journeys, and the constraints before recommending what to build first.",
  },
  {
    category: "Getting started",
    question: "How much will my project cost?",
    answer:
      "Cost depends on scope, integrations, content, and the level of product complexity. After an initial conversation and any necessary discovery, we prepare a scoped proposal with deliverables, assumptions, and a payment schedule. We do not use a one-size-fits-all price.",
  },
  {
    category: "Working together",
    question: "How long does a typical project take?",
    answer:
      "A focused website and a custom business platform have very different timelines. We agree milestones after understanding the scope and identify dependencies such as content, feedback, and third-party access before setting a delivery plan.",
  },
  {
    category: "Working together",
    question: "Will we see progress during development?",
    answer:
      "Yes. We work in reviewable stages, share working software, and agree a regular feedback rhythm. You should be able to see what is complete, what is in progress, and which decisions need your input.",
  },
  {
    category: "Working together",
    question: "Can you work with our existing product or team?",
    answer:
      "Yes. We can begin with a focused review of your existing application, design system, or delivery process, then define an engagement that complements your team and respects the systems already in place.",
  },
  {
    category: "Delivery & support",
    question: "Will we own the code and design files?",
    answer:
      "Our proposals define ownership and licensing clearly. Bespoke deliverables are intended to be handed over to you under the agreed contract; third-party libraries, fonts, and services keep their own licenses.",
  },
  {
    category: "Delivery & support",
    question: "Can we update the website ourselves?",
    answer:
      "We build with reuse and clear content structure in mind. Depending on your needs, that can mean an integrated content management system or well-organized source files with documentation and a practical handover.",
  },
  {
    category: "Delivery & support",
    question: "Do you offer support after launch?",
    answer:
      "We can include post-launch support and ongoing improvements in your proposal. The scope, response expectations, and maintenance responsibilities are agreed up front so there is a clear plan after release.",
  },
];

export const steps = [
  {
    number: "01",
    title: "Understand",
    description:
      "Good work starts with good questions. We get to know your business, your users, and what success really means.",
    detail:
      "Stakeholder conversations, user journeys, requirements, and a focused project brief.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "We make the idea tangible. Clear journeys and thoughtful interfaces turn complexity into something you can see and test.",
    detail:
      "Information architecture, prototypes, interface design, and a reusable design system.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "Small steps. Visible progress. We develop, test, and refine together, keeping you involved in the decisions that matter.",
    detail:
      "Iterative development, integrations, automated checks, and regular project reviews.",
  },
  {
    number: "04",
    title: "Evolve",
    description:
      "Launch is a beginning. We help you put the product into people’s hands, learn from it, and plan what comes next.",
    detail:
      "Release preparation, documentation, handover, and an agreed plan for continued support.",
  },
];

export const industries = [
  {
    name: "Professional services",
    icon: "briefcase",
    description:
      "Client portals, service websites, and connected operations that give your team more time for the work clients value.",
    needs: ["Client onboarding", "Project visibility", "Document workflows"],
  },
  {
    name: "Retail & commerce",
    icon: "bag",
    description:
      "Considered storefronts and useful operational tools that connect the customer experience to the work behind it.",
    needs: ["E-commerce experiences", "Order management", "Sales reporting"],
  },
  {
    name: "SaaS & technology",
    icon: "layers",
    description:
      "Focused first releases, consistent product interfaces, and foundations designed to support the next stage of your product.",
    needs: ["MVP development", "Product dashboards", "Subscription journeys"],
  },
  {
    name: "Education & learning",
    icon: "book",
    description:
      "Accessible learning experiences and administrative tools that help educators, learners, and operations teams stay connected.",
    needs: ["Learning portals", "Enrollment workflows", "Progress reporting"],
  },
  {
    name: "Logistics & operations",
    icon: "box",
    description:
      "Clear views of complex operations, with dependable workflows that help teams coordinate people, information, and movement.",
    needs: [
      "Operations dashboards",
      "Workflow automation",
      "Systems integration",
    ],
  },
  {
    name: "Growing businesses",
    icon: "sprout",
    description:
      "Practical software for the point where spreadsheets and disconnected tools stop keeping up with your team.",
    needs: ["Internal applications", "Business websites", "Custom reporting"],
  },
];

export const services = solutions;
export const allServices = [
  ...services,
  ...legacyServices.filter((s) => !services.some((p) => p.slug === s.slug)),
];
