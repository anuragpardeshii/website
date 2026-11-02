import { notFound } from "next/navigation";
import TalentApp from "../../../../components/TalentApp";
export const metadata = {
  title: "Record details · Sleektech Talent",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (
    (kind !== "jobs" && kind !== "applications") ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      id,
    )
  )
    notFound();
  return <TalentApp record={{ type: kind, id }} />;
}
