import { JobDetail } from "../../../components/CandidatePortal";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <JobDetail slug={slug} />;
}
