/**
 * Adds the nine design roles from a LinkedIn "Monday roundup" post (Frank Bach,
 * 2026-09-01). Every listing lives on Liftoff, so the apply URL is the Liftoff
 * share link the post pointed at.
 *
 * companyUrl is set only where the domain was actually verified against the
 * post's own description of the company. Notably brightwave.io is a *different*
 * company (AI-agent compliance infrastructure, not financial research), so it is
 * deliberately left out — a wrong domain produces another company's logo.
 * Unverified companies get no companyUrl and will render a lettermark.
 *
 * Descriptions are paraphrased from the post's facts rather than copied.
 */

const ADMIN = "https://designbetter.careers/api/admin/jobs";
const SECRET = process.env.ADMIN_SECRET ?? "careers";
const DRY = process.argv.includes("--dry-run");

const JOBS = [
  {
    company: "Runyon",
    title: "Senior Director, Product Design",
    location: "Remote",
    remote: true,
    role: "Product Design",
    experienceLevel: "Late Career (9+ years)",
    jobUrl: "https://app.onliftoff.com/s/NERsFl",
    description:
      "Product and venture studio whose partners include Amazon, Goldman Sachs, Disney and JPMorgan. Leads the design practice while staying hands-on with the work.",
  },
  {
    company: "SONATA",
    title: "Founding Design Engineer",
    location: "New York, NY",
    remote: false,
    role: "Design Systems",
    experienceLevel: "Mid Career (3-8 years)",
    jobUrl: "https://app.onliftoff.com/s/ZUfmoW",
    description:
      "Stealth healthcare startup combining AI with human coaches and doctors. Founded by the first PM at Linear, with a co-founder who was an early Ramp engineer.",
  },
  {
    company: "Graphite",
    title: "Senior Product Designer",
    location: "New York, NY",
    remote: false,
    role: "Product Design",
    experienceLevel: "Mid Career (3-8 years)",
    companyUrl: "https://graphite.dev", // verified: code review for teams on GitHub
    jobUrl: "https://app.onliftoff.com/s/zLHyHj",
    description:
      "Code review for fast-moving engineering teams. Series A, backed by a16z and GitHub's founder. Team of 24, with this role owning design end to end.",
  },
  {
    company: "Brightwave",
    title: "Founding Product Designer",
    location: "New York, NY / Boulder, CO / Bay Area",
    remote: false,
    role: "Product Design",
    experienceLevel: "Mid Career (3-8 years)",
    jobUrl: "https://app.onliftoff.com/s/expS54",
    description:
      "AI research assistant for financial analysis. Series A, named to TIME's Best Inventions. Data-heavy product design work.",
  },
  {
    company: "Liftoff",
    title: "Staff / Senior Product Designer",
    location: "New York, NY / London, UK",
    remote: false,
    role: "Product Design",
    experienceLevel: "Late Career (9+ years)",
    companyUrl: "https://onliftoff.com", // verified: hiring and networking platform
    jobUrl: "https://app.onliftoff.com/s/kSmrN1",
    description:
      "Design-led team building a job matchmaking platform based on trusted referrals. Suits someone with an interest in social products.",
  },
  {
    company: "Lora",
    title: "Founding Product Designer / Head of Design",
    location: "New York, NY",
    remote: false,
    role: "Product Design",
    experienceLevel: "Late Career (9+ years)",
    jobUrl: "https://app.onliftoff.com/s/9wMwBJ",
    description:
      "New consumer app about self-understanding, founded by Michelle Parsons, former CPO of Hinge and co-founder of Lex. Ground-floor, zero-to-one design.",
  },
  {
    company: "Sway",
    title: "Founding Product Designer",
    location: "San Francisco, CA",
    remote: false,
    role: "Product Design",
    experienceLevel: "Mid Career (3-8 years)",
    jobUrl: "https://app.onliftoff.com/s/tl340r",
    description:
      "Group voting platform helping communities organise around elections. Backed by Neo, building toward the 2026 midterms.",
  },
  {
    company: "Automat",
    title: "Founding Designer",
    location: "San Francisco, CA",
    remote: false,
    role: "Product Design",
    experienceLevel: "Mid Career (3-8 years)",
    jobUrl: "https://app.onliftoff.com/s/ojFp8W",
    description:
      "AI agents for document processing and repetitive back-office work. Founded by creative technologists from Google Creative Lab and Google Robotics.",
  },
  {
    company: "Ladder",
    title: "Lead Product Designer",
    location: "Remote — US and Canada",
    remote: true,
    role: "Product Design",
    experienceLevel: "Late Career (9+ years)",
    jobUrl: "https://app.onliftoff.com/s/An6aX6",
    description:
      "Strength training app, an Apple App of the Year finalist, profitable with $100M+ raised. Deep mobile consumer craft.",
  },
];

console.log(`\n${JOBS.length} roles from the Liftoff roundup${DRY ? " [dry run]" : ""}\n`);

let added = 0;
for (const j of JOBS) {
  const payload = {
    ...j,
    typeOfRole: "Full-time",
    posterFirstName: "Aarron",
    posterLastName: "Walter",
    posterEmail: "aarronwalter@gmail.com",
  };
  const flag = j.companyUrl ? "logo: domain verified" : "logo: lettermark (domain unverified)";
  if (DRY) {
    console.log(`  · ${j.company} — ${j.title}  [${flag}]`);
    continue;
  }
  try {
    const res = await fetch(ADMIN, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": SECRET },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`  ✓ ${j.company} — ${j.title}  [${flag}]`);
      added++;
    } else {
      console.log(`  ✗ ${j.company} — ${j.title}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.log(`  ✗ ${j.company}: ${err.message}`);
  }
}

if (!DRY) console.log(`\nAdded ${added}/${JOBS.length}\n`);
