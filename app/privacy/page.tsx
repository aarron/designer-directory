import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Design Better Careers",
  description: "How Design Better Careers collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "April 26, 2026";
const CONTACT_EMAIL = "careers@thecuriositydepartment.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm text-brand-gray-400 mb-2">Last updated {LAST_UPDATED}</p>
          <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">Privacy Policy</h1>
          <p className="text-brand-gray-600 leading-relaxed">
            Design Better Careers is operated by The Curiosity Department LLC. This policy explains what personal
            information we collect, how we use it, and your rights regarding that information. By using our
            site you agree to the practices described here.
          </p>
        </div>

        <div className="bg-white border border-brand-gray-100 rounded-xl divide-y divide-brand-gray-100">

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">1. Information we collect</h2>
            <div className="flex flex-col gap-5 text-sm text-brand-gray-600 leading-relaxed">
              <div>
                <p className="font-semibold text-brand-black mb-1">Designer profiles</p>
                <p>When you add yourself to the talent directory, we collect your name, email address, profile photo, professional background (role, skills, experience level, location), work preferences, and availability status. Your email is never displayed publicly.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-black mb-1">Job postings</p>
                <p>When you post a job, we collect your name, business email address, company name, and the details of the role. Payment is processed by Stripe — we do not store card numbers or financial details on our servers.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-black mb-1">Usage data</p>
                <p>We collect anonymised analytics (page views, referral sources, device type) via Vercel Analytics. We do not use advertising trackers or sell usage data.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-black mb-1">Communications</p>
                <p>If you contact us via email or through the site, we retain that correspondence to respond to your inquiry.</p>
              </div>
            </div>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">2. How we use your information</h2>
            <ul className="flex flex-col gap-2 text-sm text-brand-gray-600 leading-relaxed list-disc list-inside">
              <li>To publish and maintain your designer profile or job listing on the site</li>
              <li>To send transactional emails (magic links, job confirmation, profile update reminders)</li>
              <li>To send you a curated candidate shortlist if you post a job</li>
              <li>To process payments securely via Stripe</li>
              <li>To improve the site through anonymised analytics</li>
              <li>To contact you about your listing or profile when necessary</li>
            </ul>
            <p className="text-sm text-brand-gray-600 leading-relaxed mt-4">
              We do not sell your personal information to third parties. We do not use your data for advertising.
            </p>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">3. Third-party services</h2>
            <div className="flex flex-col gap-4 text-sm text-brand-gray-600 leading-relaxed">
              <p>We use the following third-party services to operate the site. Each has its own privacy policy.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: "Stripe", purpose: "Payment processing", url: "https://stripe.com/privacy" },
                  { name: "Resend", purpose: "Transactional email delivery", url: "https://resend.com/privacy" },
                  { name: "Neon", purpose: "Database hosting", url: "https://neon.tech/privacy" },
                  { name: "Vercel", purpose: "Hosting and analytics", url: "https://vercel.com/legal/privacy-policy" },
                  { name: "Vercel Blob", purpose: "Profile photo storage", url: "https://vercel.com/legal/privacy-policy" },
                ].map(({ name, purpose, url }) => (
                  <div key={name} className="bg-brand-gray-50 rounded-lg p-3">
                    <p className="font-medium text-brand-black">{name}</p>
                    <p className="text-brand-gray-500 text-xs mt-0.5">{purpose}</p>
                    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-brand-gray-400 hover:text-brand-black transition-colors mt-1 inline-block">Privacy policy →</a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">4. Data retention</h2>
            <div className="flex flex-col gap-3 text-sm text-brand-gray-600 leading-relaxed">
              <p><span className="font-medium text-brand-black">Designer profiles</span> — retained as long as your profile is active. You can hide your profile at any time using the link in any email we send you, or by visiting <Link href="/profile" className="text-brand-black underline underline-offset-2">/profile</Link>. To permanently delete your data, email us.</p>
              <p><span className="font-medium text-brand-black">Job postings</span> — listings expire after 60 days and are deactivated automatically. The underlying record is retained for our business records.</p>
              <p><span className="font-medium text-brand-black">Payment records</span> — retained as required by law and Stripe's data retention policies.</p>
            </div>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">5. Your rights</h2>
            <p className="text-sm text-brand-gray-600 leading-relaxed mb-3">
              You have the right to access, correct, or delete the personal information we hold about you.
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-black underline underline-offset-2">{CONTACT_EMAIL}</a>.
            </p>
            <p className="text-sm text-brand-gray-600 leading-relaxed">
              If you are located in the European Economic Area or the UK, you may also have rights under GDPR,
              including the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">6. Cookies</h2>
            <p className="text-sm text-brand-gray-600 leading-relaxed">
              We use a single session cookie to authenticate admin users. We do not use advertising cookies
              or tracking pixels. Vercel Analytics uses privacy-preserving, cookieless measurement by default.
            </p>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">7. Security</h2>
            <p className="text-sm text-brand-gray-600 leading-relaxed">
              All data is transmitted over HTTPS. Profile edit access is controlled via unique tokens sent
              to your registered email address. We do not store passwords. Payment data is handled entirely
              by Stripe and never touches our servers.
            </p>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">8. Changes to this policy</h2>
            <p className="text-sm text-brand-gray-600 leading-relaxed">
              We may update this policy from time to time. The date at the top of this page reflects when it
              was last revised. Continued use of the site after changes are posted constitutes acceptance of
              the updated policy.
            </p>
          </section>

          <section className="p-8">
            <h2 className="font-display font-bold text-brand-black text-lg mb-4">9. Contact</h2>
            <p className="text-sm text-brand-gray-600 leading-relaxed">
              Questions about this policy? Get in touch:<br />
              <strong className="text-brand-black">The Curiosity Department LLC</strong><br />
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-black underline underline-offset-2">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
