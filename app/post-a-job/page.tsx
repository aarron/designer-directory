import type { Metadata } from "next";
import { getCorpusStats, formatSubscribers } from "@/lib/corpus";
import { PostAJobClient } from "./PostAJobClient";

export const metadata: Metadata = {
  title: "Post a Job | Design Better Careers",
  description: "Reach thousands of senior designers through Design Better. Post a job and get a curated shortlist of matched candidates delivered to your inbox.",
};

export default async function PostAJobPage() {
  const corpusStats = await getCorpusStats();
  const subscriberLabel = formatSubscribers(corpusStats?.subscribers);

  return <PostAJobClient subscriberLabel={subscriberLabel} />;
}
