import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-brand-gray-100 mt-24 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image src="/logo-black.png" alt="Design Better" width={120} height={26} className="h-6 w-auto" />
            </Link>
            <p className="text-sm text-brand-gray-500 max-w-xs">
              Connecting senior design talent with the teams that need them.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Talent</p>
              <Link href="/talent" className="text-brand-gray-500 hover:text-brand-black transition-colors">Browse Designers</Link>
              <Link href="/join" className="text-brand-gray-500 hover:text-brand-black transition-colors">Add Your Profile</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Employers</p>
              <Link href="/jobs" className="text-brand-gray-500 hover:text-brand-black transition-colors">Browse Jobs</Link>
              <Link href="/post-a-job" className="text-brand-gray-500 hover:text-brand-black transition-colors">Post a Job</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-brand-black">Design Better</p>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Podcast</a>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Newsletter</a>
              <a href="https://designbetterpodcast.com/p/design-better-for-teams" target="_blank" rel="noreferrer" className="text-brand-gray-500 hover:text-brand-black transition-colors">Teams</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-brand-gray-400">
          <p>© {new Date().getFullYear()} The Curiosity Department LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand-black transition-colors">Privacy</Link>
            <a href="mailto:jobs@thecuriositydepartment.com" className="hover:text-brand-black transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
