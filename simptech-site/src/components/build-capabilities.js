import {
  AudioLines,
  Bot,
  Database,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

export const buildCapabilities = [
  {
    id: "agents",
    title: "AI agents & chatbots",
    icon: Bot,
    summary: "Intelligent automation. Accountable execution.",
    description:
      "Purpose-built agents that connect knowledge, business systems, and customer conversations to resolve work end to end.",
    app: "Relay",
    workspace: "Customer operations",
    outcome: "From an incoming request to a resolved customer issue.",
    steps: ["Understand", "Retrieve", "Take action", "Resolve"],
    tasks: [
      [
        "Conversational design",
        "Intent mapping, knowledge retrieval, and contextual responses.",
      ],
      [
        "Workflow orchestration",
        "API integrations, business rules, and human escalation paths.",
      ],
      [
        "Quality & observability",
        "Evaluation suites, interaction analytics, and traceable actions.",
      ],
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise AI",
    icon: ShieldCheck,
    summary: "Institutional knowledge. Decision-ready intelligence.",
    description:
      "Private knowledge workspaces that turn fragmented enterprise information into contextual answers with source-level traceability.",
    app: "Nexus",
    workspace: "Enterprise knowledge",
    outcome: "From a business question to a sourced, permission-aware answer.",
    steps: ["Ask", "Authorize", "Retrieve", "Synthesize"],
    tasks: [
      [
        "Knowledge architecture",
        "Document ingestion, semantic search, and retrieval-augmented generation.",
      ],
      [
        "Access & governance",
        "Role-based permissions, sensitive-data handling, and audit trails.",
      ],
      [
        "Enterprise integration",
        "Identity providers, internal platforms, and private deployment options.",
      ],
    ],
  },
  {
    id: "crm",
    title: "CRM platforms",
    icon: Users,
    summary: "Connected relationships. Coordinated revenue operations.",
    description:
      "A unified customer operating model that aligns lead intelligence, pipeline visibility, and account ownership across your teams.",
    app: "Orbit",
    workspace: "Revenue operations",
    outcome: "From a new opportunity to an informed, coordinated handoff.",
    steps: ["Capture", "Enrich", "Qualify", "Assign"],
    tasks: [
      [
        "Customer lifecycle design",
        "Contact models, sales stages, and a shared history of every interaction.",
      ],
      [
        "Sales enablement",
        "Lead scoring, territory routing, follow-ups, and approval workflows.",
      ],
      [
        "Operational visibility",
        "Pipeline reporting, forecasting views, and CRM data migration.",
      ],
    ],
  },
  {
    id: "saas",
    title: "SaaS & mobile apps",
    icon: Smartphone,
    summary: "Product ambition. Production-grade delivery.",
    description:
      "Scalable digital products that connect considered user experiences with dependable architecture, subscription operations, and release management.",
    app: "Forma",
    workspace: "Product platform",
    outcome: "From a validated release to a seamless subscription experience.",
    steps: ["Build", "Validate", "Deploy", "Activate"],
    tasks: [
      [
        "Product strategy & UX",
        "Discovery, experience mapping, prototypes, and reusable design systems.",
      ],
      [
        "Full-stack engineering",
        "Web and mobile applications, APIs, authentication, and billing.",
      ],
      [
        "Release & reliability",
        "CI/CD pipelines, automated QA, monitoring, and ongoing iteration.",
      ],
    ],
  },
  {
    id: "voice",
    title: "Voice agents",
    icon: AudioLines,
    summary: "Natural conversations. Operational follow-through.",
    description:
      "Voice experiences that qualify inquiries, coordinate appointments, and keep customer records in sync—with a clear path to your team.",
    app: "Echo",
    workspace: "Voice operations",
    outcome: "From an inbound conversation to a confirmed appointment.",
    steps: ["Connect", "Understand", "Schedule", "Confirm"],
    tasks: [
      [
        "Conversation engineering",
        "Call flows, intent recognition, interruption handling, and escalation.",
      ],
      [
        "Business-system connectivity",
        "Calendar availability, CRM context, and appointment management.",
      ],
      [
        "Service operations",
        "Call summaries, disposition tracking, and quality review workflows.",
      ],
    ],
  },
  {
    id: "data",
    title: "Data & internal tools",
    icon: Database,
    summary: "Trusted information. Confident execution.",
    description:
      "Connected data platforms and operational workspaces that bring reporting, approvals, and business-critical decisions into one clear view.",
    app: "Meridian",
    workspace: "Data operations",
    outcome: "From fragmented source systems to an actionable business view.",
    steps: ["Ingest", "Transform", "Validate", "Publish"],
    tasks: [
      [
        "Data engineering",
        "Source integrations, ETL pipelines, data models, and quality checks.",
      ],
      [
        "Business intelligence",
        "KPI frameworks, executive dashboards, and self-service reporting.",
      ],
      [
        "Internal applications",
        "Approval systems, operational consoles, and exception management.",
      ],
    ],
  },
];
