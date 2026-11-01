import type { ReactNode } from "react";
import type { allServices, projects, articles } from "./data/content";
export type ChildrenProps = { children: ReactNode; className?: string };
export type Service = (typeof allServices)[number] & { visual?: string };
export type Project = (typeof projects)[number];
export type Article = (typeof articles)[number];
