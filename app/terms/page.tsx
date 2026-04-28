import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Design Better Careers",
  description: "Terms governing use of Design Better Careers by employers and designers.",
};

const LAST_UPDATED = "April 27, 2026";
const CONTACT_EMAIL = "careers@thecuriositydepartment.com";
const COMPANY = "The Curiosity Department LLC";
const APP_NAME = "Design Better Careers";
const APP_URL = "https://designbetter.careers";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm text-brand-gray-400 mb-2">Last updated {LAST_UPDATED}</p>
          <h1 className="font-display text-display-sm font-bold text-brand-black mb-4">
            Terms of Service
          </h1>
          <p className="text-brand-gray-600 leading-relaxed">
            {APP_NAME} is operated by {COMPANY} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            By using {APP_URL} (&ldquo;the Service&rdquo;), you agree to these Terms of Service.
            Please read them carefully. If you do not agree, do not use the Service.
          </p>
        </div>

        <div className="bg-white border border-brand-gray-100 rounded-xl divide-y divide-brand-gray-100">

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">1. Who We Are and What We Do</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              {APP_NAME} is a talent directory and job board connecting design professionals with employers.
              Designers can create free profiles to be discovered by hiring teams. Employers can post
              job listings, access the talent directory, and receive curated candidate shortlists.
              We do not act as a recruiter, staffing agency, or employment intermediary.
              Any hiring relationship formed through the Service is solely between the employer and the
              designer — {COMPANY} is not a party to that relationship.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">2. Designer Accounts</h2>
            <ul className="text-brand-gray-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Creating a profile is free. You must provide accurate information.</li>
              <li>You are responsible for keeping your edit link secure. It grants full access to your profile.</li>
              <li>
                By submitting a profile you grant {COMPANY} a non-exclusive, royalty-free license to display
                your profile information on the Service for the purpose of connecting you with employers.
              </li>
              <li>You may delete your profile at any time from your edit page.</li>
              <li>
                Profiles that go unconfirmed for more than 60 days may be temporarily hidden to keep the
                directory accurate. You can reactivate your profile at any time via your edit link.
              </li>
              <li>
                You must not create profiles for other people or misrepresent your identity, experience,
                or credentials.
              </li>
            </ul>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">3. Employer Listings</h2>
            <ul className="text-brand-gray-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Job listings are available as a one-time purchase. Pricing is displayed at the time of
                purchase and is subject to change for future purchases.
              </li>
              <li>Listings are active for 60 days from the date your payment clears.</li>
              <li>
                You must post only legitimate, real job opportunities. Listings for pyramid schemes,
                multi-level marketing, misleading roles, or fraudulent employers will be removed without
                refund.
              </li>
              <li>
                You are solely responsible for the accuracy of your job listing, including compensation,
                role requirements, and company information.
              </li>
              <li>
                Candidate profile information shared with you through our matching system is for
                recruiting purposes only. You may not sell, redistribute, or use it for any other purpose.
              </li>
              <li>
                We reserve the right to reject or remove any listing at our sole discretion.
              </li>
            </ul>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">4. Payments and Refunds</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed mb-3">
              Payments are processed securely by Stripe. By completing a purchase, you authorize
              {COMPANY} to charge the amount shown at checkout.
            </p>
            <ul className="text-brand-gray-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>All sales are final.</strong> We do not offer refunds once a listing has gone live
                and the candidate shortlist has been delivered.
              </li>
              <li>
                If your listing is removed by us due to a violation of these Terms, no refund will be issued.
              </li>
              <li>
                If a technical error on our part prevents your listing from going live, we will either
                fix the issue or issue a full refund at our discretion. Contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-red hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                within 7 days.
              </li>
              <li>
                Coupon codes are valid for a single use per purchase unless otherwise stated and cannot
                be applied retroactively.
              </li>
            </ul>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">5. Acceptable Use</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed mb-3">You agree not to:</p>
            <ul className="text-brand-gray-600 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>
                Scrape, harvest, or collect profile data using automated tools without our written
                consent.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service or its underlying
                infrastructure.
              </li>
              <li>
                Harass, spam, or contact designers outside of a legitimate recruiting context.
              </li>
              <li>
                Submit false, misleading, or defamatory content in any profile, job listing, or
                communication.
              </li>
            </ul>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">6. Intellectual Property</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              The {APP_NAME} name, logo, and all original content created by {COMPANY} are the
              intellectual property of {COMPANY}. You retain ownership of any content you submit
              (profile text, job descriptions). You grant us a license to display that content as
              described in these Terms. You may not reproduce, distribute, or create derivative works
              from our original content without written permission.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">
              7. Disclaimers and Limitation of Liability
            </h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed mb-3">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              express or implied. We do not guarantee that:
            </p>
            <ul className="text-brand-gray-600 text-sm leading-relaxed space-y-2 list-disc list-inside mb-3">
              <li>Any employer will contact, interview, or hire any designer.</li>
              <li>Any designer profile will match a specific job listing.</li>
              <li>The Service will be uninterrupted, error-free, or secure at all times.</li>
            </ul>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              To the maximum extent permitted by law, {COMPANY}&apos;s total liability to you for any
              claim arising out of or relating to these Terms or your use of the Service shall not
              exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">8. Termination</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              We reserve the right to suspend or terminate access to the Service for any user who
              violates these Terms, without notice and without refund. You may stop using the Service
              at any time. Designer profiles can be deleted from the edit page. These Terms survive
              termination with respect to sections 4, 6, 7, and 9.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">9. Governing Law</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              These Terms are governed by the laws of the State of Tennessee, without regard to its
              conflict of law provisions. Any disputes shall be resolved in the state or federal courts
              located in Tennessee. If you are a consumer in a jurisdiction that requires disputes to
              be handled locally, this section does not affect your statutory rights.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">10. Changes to These Terms</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will update
              the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the Service after
              changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section className="p-6">
            <h2 className="font-semibold text-brand-black mb-3">11. Contact</h2>
            <p className="text-brand-gray-600 text-sm leading-relaxed">
              Questions about these Terms?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-red hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
