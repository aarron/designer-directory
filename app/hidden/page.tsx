import Link from "next/link";
import { db } from "@/lib/db";

export default async function HiddenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const designer = token
    ? await db.designer.findUnique({ where: { editToken: token }, select: { firstName: true } })
    : null;

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-brand-gray-100 rounded-xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-gray-100 flex items-center justify-center mx-auto mb-5 text-2xl">
          👋
        </div>
        <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
          Your profile is hidden
        </h1>
        <p className="text-brand-gray-500 leading-relaxed mb-6">
          {designer?.firstName ? `Thanks, ${designer.firstName}. ` : ""}Your profile is no longer visible in the Design Better Careers directory. Your information is saved, so you can reactivate anytime you&apos;re ready.
        </p>
        {token && (
          <Link
            href={`/api/confirm?token=${token}`}
            className="inline-flex items-center justify-center rounded bg-brand-red px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 mb-4"
          >
            Reactivate my profile
          </Link>
        )}
        <p className="text-xs text-brand-gray-400 mt-4">
          Changed your mind?{" "}
          <Link href="/profile" className="underline hover:text-brand-black transition-colors">
            Use your email to get your edit link
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
