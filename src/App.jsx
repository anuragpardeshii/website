import { useEffect } from "react";
import { MotionProvider } from "./components/MotionSystem";
import { Layout } from "./components/Layout";
import { articles, projects, allServices, site } from "./data/content";
import Home from "./pages/Home";
import { ServiceDetail, Services } from "./pages/Services";
import { ProjectDetail, Work } from "./pages/Work";
import {
  About,
  Approach,
  Careers,
  Industries,
  Technologies,
} from "./pages/Company";
import { ArticleDetail, Insights } from "./pages/Insights";
import { Contact } from "./pages/Contact";
import { FAQ, NotFound, Policy, Sitemap } from "./pages/Utility";

const basePages = [
  {
    path: "/",
    title: "Better websites. Smarter business software.",
    description: site.description,
    component: Home,
  },
  {
    path: "/services",
    title: "Software development services",
    description:
      "Website development, CRM, ERP, dashboards and business analytics, e-commerce and order management, and inventory and logistics software.",
    component: Services,
  },
  {
    path: "/work",
    title: "Our work & product explorations",
    description:
      "Explore original product concepts for CRM, analytics, commerce, and logistics. Discover the SimpTech approach in action.",
    component: Work,
  },
  {
    path: "/approach",
    title: "Our approach",
    description:
      "From discovery and design to development and launch: a collaborative, transparent approach to building useful software.",
    component: Approach,
  },
  {
    path: "/about",
    title: "About SimpTech",
    description:
      "Meet the thinking behind SimpTech. A software development studio making complex technology feel simple and human.",
    component: About,
  },
  {
    path: "/industries",
    title: "Industries we build for",
    description:
      "Digital solutions for professional services, retail, SaaS, education, logistics, and growing businesses.",
    component: Industries,
  },
  {
    path: "/technologies",
    title: "Our technology toolkit",
    description:
      "Explore our approach to React, Next.js, TypeScript, Node.js, Python, PostgreSQL, and dependable software delivery.",
    component: Technologies,
  },
  {
    path: "/careers",
    title: "Careers",
    description:
      "Thoughtful people, meaningful problems, and room to do good work. Explore our working values and current opportunities.",
    component: Careers,
  },
  {
    path: "/insights",
    title: "Insights on products, design & development",
    description:
      "Practical articles about planning an MVP, designing useful dashboards, and automating the right workflows.",
    component: Insights,
  },
  {
    path: "/faq",
    title: "Frequently asked questions",
    description:
      "Straight answers about project scope, timelines, collaboration, ownership, and post-launch support.",
    component: FAQ,
  },
  {
    path: "/contact",
    title: "Let’s build something great",
    description:
      "Tell us about your next website, application, or software project. Prepare a clear brief and take the next step.",
    component: Contact,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "How this website handles form details, optional saved drafts, and essential hosting information.",
    component: () => <Policy kind="privacy" />,
  },
  {
    path: "/terms",
    title: "Website terms",
    description:
      "Information about the purpose of this website, original concepts, project briefs, and third-party materials.",
    component: () => <Policy kind="terms" />,
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    description:
      "Our approach to keyboard navigation, readable content, accessible forms, and reduced motion.",
    component: () => <Policy kind="accessibility" />,
  },
  {
    path: "/sitemap",
    title: "Sitemap",
    description:
      "Find every service, project exploration, insight, and company page on the SimpTech website.",
    component: Sitemap,
  },
];
export const routes = [
  ...basePages,
  ...allServices.map((s) => ({
    path: `/services/${s.slug}`,
    title: s.title,
    description: s.description,
    component: () => <ServiceDetail service={s} />,
  })),
  ...projects.map((p) => ({
    path: `/work/${p.slug}`,
    title: `${p.name} — ${p.category} concept`,
    description: p.description,
    component: () => <ProjectDetail project={p} />,
  })),
  ...articles.map((a) => ({
    path: `/insights/${a.slug}`,
    title: a.title,
    description: a.excerpt,
    component: () => <ArticleDetail article={a} />,
  })),
];
export function getRoute(path) {
  return (
    routes.find(
      (r) =>
        r.path === path.replace(/\/$/, "") || (r.path === "/" && path === "/"),
    ) || {
      path: "/404",
      title: "Page not found",
      description: "Find your way back to SimpTech.",
      component: NotFound,
    }
  );
}
export default function App({ path = "/" }) {
  const route = getRoute(path);
  const Page = route.component;
  useEffect(() => {
    document.title = `${route.title} | ${site.name}`;
  }, [route.title]);
  return (
    <MotionProvider>
      <Layout
        path={path}
        hideCTA={path === "/contact" || route.path === "/404"}
      >
        <Page />
      </Layout>
    </MotionProvider>
  );
}
