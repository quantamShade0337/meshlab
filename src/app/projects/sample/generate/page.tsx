import { GenerateProgress } from "@/components/generation/generate-progress";

export const metadata = {
  title: "Generating — Meshlab",
};

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job } = await searchParams;
  return <GenerateProgress jobId={job} />;
}
