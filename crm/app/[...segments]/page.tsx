import { notFound } from "next/navigation";
import CrmApp from "../../components/CrmApp";

export default async function Page({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const [section, record, detail] = segments;
  const lists = [
    "pipeline",
    "leads",
    "customers",
    "projects",
    "tasks",
    "communications",
    "integrations",
    "users",
    "notifications",
  ];
  const records = [
    "leads",
    "customers",
    "projects",
    "communications",
    "tasks",
    "users",
  ];
  const uuid =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const valid =
    segments.length === 1
      ? lists.includes(section)
      : segments.length === 2
        ? record === "new"
          ? ["leads", "projects", "tasks", "communications"].includes(section)
          : records.includes(section) && uuid.test(record)
        : segments.length === 3 &&
          section === "leads" &&
          uuid.test(record) &&
          detail === "brief";
  if (!valid) notFound();
  return <CrmApp />;
}
