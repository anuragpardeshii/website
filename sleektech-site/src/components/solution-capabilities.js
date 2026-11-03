import {
  Globe2,
  Users,
  Layers3,
  ChartNoAxesCombined,
  ShoppingBag,
  Package,
  Bot,
} from "lucide-react";
import { services } from "../data/content";
import { buildCapabilities } from "./build-capabilities";
const details = [
  {
    id: "websites",
    icon: Globe2,
    app: "Forma",
    workspace: "Digital experience",
    steps: ["Design", "Develop", "Validate", "Launch"],
    tasks: [
      [
        "Experience strategy",
        "Audience research, information architecture, and conversion journeys.",
      ],
      [
        "Web & product engineering",
        "Responsive websites, SaaS platforms, mobile experiences, and content systems.",
      ],
      [
        "Launch & optimization",
        "Accessibility, performance budgets, search foundations, and release management.",
      ],
    ],
  },
  { ...buildCapabilities[2], id: "crm", icon: Users },
  {
    id: "erp",
    icon: Layers3,
    app: "Nexus",
    workspace: "Enterprise operations",
    steps: ["Request", "Approve", "Allocate", "Reconcile"],
    tasks: [
      [
        "Operating model design",
        "Process mapping, approval matrices, and role-based workspaces.",
      ],
      [
        "Enterprise integration",
        "Procurement, finance, resource planning, and connected master data.",
      ],
      [
        "Operational governance",
        "Audit trails, exception handling, access controls, and management reporting.",
      ],
    ],
  },
  { ...buildCapabilities[5], id: "analytics", icon: ChartNoAxesCombined },
  {
    id: "commerce",
    icon: ShoppingBag,
    app: "Arc",
    workspace: "Commerce operations",
    steps: ["Discover", "Checkout", "Fulfil", "Retain"],
    tasks: [
      [
        "Commerce experience",
        "Product discovery, merchandising, storefront design, and checkout journeys.",
      ],
      [
        "Transaction orchestration",
        "Payment integrations, order management, stock allocation, and fulfilment.",
      ],
      [
        "Customer retention",
        "Post-purchase communication, service workflows, and commercial analytics.",
      ],
    ],
  },
  {
    id: "logistics",
    icon: Package,
    app: "Atlas",
    workspace: "Supply chain visibility",
    steps: ["Receive", "Allocate", "Dispatch", "Deliver"],
    tasks: [
      [
        "Inventory intelligence",
        "SKU models, multi-location availability, stock movements, and replenishment.",
      ],
      [
        "Fulfilment coordination",
        "Warehouse workflows, carrier integrations, and exception management.",
      ],
      [
        "Operational assurance",
        "Shipment visibility, delivery milestones, reconciliation, and performance reporting.",
      ],
    ],
  },
];
export const solutionCapabilities = details
  .map((item, index) => ({
    ...item,
    title: services[index].title,
    summary: services[index].short,
    description: services[index].description,
    href: `/services/${services[index].slug}`,
    linkLabel: `Explore ${services[index].label}`,
    visual: services[index].visual,
    outcome: services[index].outcomes?.[0] || services[index].short,
  }))
  .concat({
    ...buildCapabilities[0],
    id: "automation",
    title: "AI & intelligent automation",
    href: "/work",
    linkLabel: "Explore AI product concepts",
    description:
      "AI agents, private enterprise knowledge, and voice experiences that connect customer conversations with accountable business workflows.",
    tasks: [
      [
        "Conversational & voice AI",
        "Intent mapping, voice interactions, appointment scheduling, and human escalation.",
      ],
      [
        "Enterprise intelligence",
        "Permission-aware retrieval, sourced answers, knowledge ingestion, and evaluation.",
      ],
      [
        "Workflow orchestration",
        "API integrations, traceable actions, service analytics, and quality assurance.",
      ],
    ],
  });
