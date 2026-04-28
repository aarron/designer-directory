import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function JobClosedPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; company?: string }>;
}) {
  const { title, company } = await searchParams;

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
          Role marked as filled
        </h1>
        {title && company && (
          <p className="text-brand-gray-500 mb-2">
            <strong className="text-brand-black">{title}</strong> at {company}
          </p>
        )}
        <p className="text-brand-gray-500 mb-8">
          Your listing has been removed from the job board. Congratulations on the hire!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/post-a-job">
            <Button variant="secondary">Post another role</Button>
          </Link>
          <Link href="/talent">
            <Button>Browse designers</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
