import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer data-theme="dark" className="mt-24 py-14" style={{ background: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="flex flex-col gap-4 max-w-xs">
            <Link href="/" className="inline-block hover:opacity-75 transition-opacity duration-[120ms]">
              <Image src="/logo-white.png" alt="Design Better" width={148} height={35} className="h-8 w-auto" />
            </Link>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
              Connecting senior design talent with the teams that need them.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-[15px]">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Talent</p>
              <Link href="/talent" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Browse Designers</Link>
              <Link href="/join" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Create profile</Link>
              <Link href="/profile" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Edit Your Profile</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Employers</p>
              <Link href="/post-a-job" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Post a Job</Link>
              <Link href="/jobs" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Browse Jobs</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Design Better</p>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Podcast</a>
              <a href="https://designbetterpodcast.com" target="_blank" rel="noreferrer" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Newsletter</a>
              <a href="https://designbetter.team/" target="_blank" rel="noreferrer" className="transition-colors duration-[120ms] hover:text-[#FF4725]" style={{ color: "var(--text-2)" }}>Teams</a>
            </div>
          </div>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px]"
          style={{ borderTop: "1px solid var(--divider)", color: "var(--text-3)" }}
        >
          <p>© {new Date().getFullYear()} The Curiosity Department LLC. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[var(--text-1)] transition-colors duration-[120ms]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-1)] transition-colors duration-[120ms]">Terms</Link>
            <a href="mailto:careers@thecuriositydepartment.com" className="hover:text-[var(--text-1)] transition-colors duration-[120ms]">Contact</a>
            <a href="https://github.com/aarron/designer-directory/issues/new" target="_blank" rel="noreferrer" className="hover:text-[var(--text-1)] transition-colors duration-[120ms]">Report a Bug</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
