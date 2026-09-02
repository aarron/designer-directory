import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-brand-gray-50 border-t border-brand-gray-100 mt-24 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image src="/logo-black.png" alt="Design Better" width={160} height={35} className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-brand-gray-500 max-w-xs">
              Connecting senior design talent with the teams that need them.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Talent</p>
              <Link href="/talent" className="text-brand-gray-500 hover:text-brand-black transition-colors">Browse Designers</Link>
              <Link href="/join" className="text-brand-gray-500 hover:text-brand-black transition-colors">Create profile</Link>
              <Link href="/profile" className="text-brand-gray-500 hover:text-brand-black transition-colors">Edit Your Profile</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Employers</p>
              <Link href="/post-a-job" className="text-brand-gray-500 hover:text-brand-black transition-colors">Post a Job</Link>
              <Link href="/jobs" className="text-brand-gray-500 hover:text-brand-black transition-colors">Browse Jobs</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Design Better</p>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Podcast</a>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Newsletter</a>
              <a href="https://designbetter.team/" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Teams</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-brand-gray-400">
          <p>© {new Date().getFullYear()} The Curiosity Department LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-black transition-colors">Terms</Link>
            <a href="mailto:careers@thecuriositydepartment.com" className="hover:text-brand-black transition-colors">Contact</a>
            <a href="https://github.com/aarron/designer-directory/issues/new" target="_blank" rel="noreferrer" className="hover:text-brand-black transition-colors">Report a Bug</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
