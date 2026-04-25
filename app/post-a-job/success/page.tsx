import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PostJobSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">
        Your job is posted!
      </h1>
      <p className="text-brand-gray-500 leading-relaxed mb-8">
        Your listing is now live on Design Better Careers. Within 48 hours, you&apos;ll receive
        a curated shortlist of matched candidates directly to your email.
        Your role will also be featured in the next edition of The Roundup.
      </p>
      <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-6 text-left mb-8">
        <p className="font-semibold text-brand-black mb-3">What happens next</p>
        <ol className="flex flex-col gap-3 text-sm text-brand-gray-600 list-decimal list-inside">
          <li>Your listing is live and visible to all directory visitors.</li>
          <li>We&apos;ll match your role against our designer profiles and send you a shortlist within 48 hours.</li>
          <li>Your role will appear in The Roundup newsletter this Friday.</li>
          <li>You&apos;ll receive a view count report after 30 days.</li>
        </ol>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/talent">
          <Button variant="primary">Browse Talent Now</Button>
        </Link>
        <Link href="/jobs">
          <Button variant="secondary">View All Jobs</Button>
        </Link>
      </div>
    </div>
  );
}
