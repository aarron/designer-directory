import { getCorpusStats, formatSubscribers } from "@/lib/corpus";
import { SuccessStoryForm } from "./SuccessStoryForm";

export default async function SuccessStoryPage() {
  const corpusStats = await getCorpusStats();
  const subscriberLabel = formatSubscribers(corpusStats?.subscribers);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SuccessStoryForm subscriberLabel={subscriberLabel} />
    </div>
  );
}
