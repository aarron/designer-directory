import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; error?: string }>;
}) {
  const { name, error } = await searchParams;

  if (error) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
            Link not valid
          </h1>
          <p className="text-brand-gray-500 mb-8">
            This confirmation link is expired or invalid. Check your email for a fresh one, or
            request a new edit link below.
          </p>
          <Link href="/profile">
            <Button variant="secondary">Get a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
          {name ? `You're confirmed, ${name}!` : "You're confirmed!"}
        </h1>
        <p className="text-brand-gray-500 mb-8">
          Your profile is staying active in the directory. We&apos;ll check in again in 60 days.
          In the meantime, employers can still find and contact you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/talent">
            <Button variant="secondary">Browse the directory</Button>
          </Link>
          <Link href="/profile">
            <Button>Update your profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
