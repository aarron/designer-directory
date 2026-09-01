/**
 * Second pass on the nine Liftoff roundup roles: real job descriptions,
 * verified company domains, official apply URLs, and logos.
 *
 * The first pass only had the LinkedIn post's one-line blurbs. The Liftoff
 * pages are client-rendered, so the detail had to be read from a real browser;
 * this script writes what that produced.
 *
 * Notes worth keeping:
 *  - Liftoff's "$X Match Incentive" is a referral bounty paid to whoever refers
 *    a candidate. It is NOT the salary, so compensation stays null unless the
 *    employer published a range. None of these did.
 *  - Sway's listing now 404s, so that row is deactivated rather than enriched.
 *  - Domains here were read off each employer's own Liftoff listing. Several
 *    (runautomat.com, joinladder.com, getlora.com) are nothing like the company
 *    name and would have been guessed wrong.
 */

const ADMIN = "https://designbetter.careers/api/admin/jobs";
const SECRET = process.env.ADMIN_SECRET ?? "careers";
const CF = "https://d2kibfarzybme5.cloudfront.net/companies/";
const DRY = process.argv.includes("--dry-run");

const UPDATES = [
  {
    company: "Runyon",
    title: "Senior Director, Product Design",
    location: "Remote",
    remote: true,
    experienceLevel: "Late Career (9+ years)",
    companyUrl: "https://www.runyon.io",
    jobUrl: "https://runyon.bamboohr.com/careers/60",
    liftoffLogo: `${CF}42674c5a_fd97_4083_8277_07d4255c2e5a.jpg`,
    description: `This role is remote.

Runyon is a product and venture studio focused on growth. We are a team of user-centered designers and strategists that crafts new products, experiences and ventures. Our partners include some of the most impactful organizations in the world: Amazon, Goldman Sachs, Disney, New York Life, American Express, MetLife, JPMorgan, Nerdwallet, Target and others.

We're looking for a Senior Director of Product Design to lead and actively contribute to the creation of user-centered concepts, prototypes, and experiences across the full design spectrum – from early, low-fidelity exploration through to high-fidelity, production-ready outputs – with the expectation that you work fluidly across that range.

This role sits within the cross-disciplinary leadership team and plays a key part in shaping both the work and how we approach it – setting the bar for product design craft through direct contribution. This role will also have a leadership role in shaping our AI-driven product approach, bringing design into implementation with emerging technologies, and exploring how our AI-stack can accelerate how ideas are generated, tested, and brought to life.

The ideal candidate:

• Leads product design work end-to-end – translating research insights and strategic direction into clear, compelling user experiences that balance desirability, viability, and feasibility
• Generates and iterates rapidly on concepts across the full design spectrum – crafting low-fidelity explorations, functional prototypes, and high-fidelity outputs, while guiding teams through validation and refinement
• Sets the bar for craft through hands-on contribution – owning high-impact product moments and simplifying complex systems into intuitive, elegant experiences
• Brings deep proficiency with modern design and prototyping tools (Figma), along with a growing fluency in AI-powered design and coding tools to accelerate workflows
• Mentors designers across levels and contributes to the evolution of Product Design at Runyon – exploring new tools, systems, and ways of working that strengthen the craft
• Has 15+ years of product / UX design experience, with significant time spent within in-house product teams; experience in design studios or agencies is a strong complement`,
  },
  {
    company: "SONATA",
    title: "Design Engineer",
    location: "New York, NY",
    remote: false,
    experienceLevel: "Mid Career (3-8 years)",
    jobUrl: "https://app.onliftoff.com/s/ZUfmoW",
    description: `This role is in-person based in New York, NY.

SONATA provides preventive healthcare built around your complete health picture. We do comprehensive diagnostics—genomics, epigenetics, blood biomarkers, and more. Ranges tuned to your DNA, not population averages. Our care team combines AI, coaches, and doctors.

Founded by: Sagan, a medical doctor and ex-McKinsey healthcare consultant who was the first PM hire at Linear, and David, a software engineer who joined Ramp as one of the first 10 engineers and helped scale the company from $0.5M to $700M ARR. David also worked on clinical genomics at Flatiron Health.

We're looking for a Founding Design Engineer to bring craft and elegance to healthcare software. You'll build both the web experiences that communicate our vision and the product features that make complex health data beautiful and actionable.

What you'll do:

• Build interactive web experiences and landing pages that explain personalized healthcare
• Create product features with beautiful, scalable UI components—health dashboards, AI chat interfaces, genomic visualizations
• Implement complex React components for data-heavy interfaces and continuous health monitoring
• Work closely with founders to rapidly prototype and ship new feature concepts
• Create smooth animations and micro-interactions that make health data feel approachable and engaging

You should have:

• Strong eye for design and attention to visual details
• Solid frontend engineering skills with React and TypeScript
• Experience building both marketing websites and complex product features
• Portfolio showing creative use of code, smooth interactions, and strong visual design
• Interest in making complex healthcare information accessible and engaging through great UX

We're backed by Sunflower Capital (first check at Cohere, Retool & Vercel) and BoxGroup (early investor at Ramp, Oscar Health, and Ro).

As a founding team member, you'll own our web presence and core product interfaces while having meaningful equity in the company.`,
  },
  {
    company: "Graphite",
    title: "Senior Product Designer",
    location: "New York, NY",
    remote: false,
    experienceLevel: "Mid Career (3-8 years)",
    companyUrl: "https://graphite.dev",
    jobUrl: "https://jobs.ashbyhq.com/graphite/46ede294-f5a6-4892-8e17-8d813f02b208",
    liftoffLogo: `${CF}146f80b1_626c_411d_9785_84bf61f337c4.jpg`,
    description: `This role is based in NYC and is in person.

Our product

Graphite is modern code review for fast-moving teams - we help engineers write better pull requests, review and leave more actionable feedback on code changes, stay unblocked, and ship faster.

We started Graphite because we missed internal code review tools like Phabricator (at Facebook) and Critique (Google) that help engineers create, approve, and ship incremental changes. We want to make well-designed, high-quality developer tooling accessible to everyone.

Our company

We're a small-but-mighty team of 24 based in Manhattan in the heart of Soho, with a passionate and rapidly growing group of users at top engineering orgs like Datadog, Bolt, Brex, Ramp, and Snowflake.

We raised a $20m Series A (featured in TechCrunch) led by Peter Levine at Andreessen Horowitz (who led GitHub's Series A), with participation from folks like Tom Preston-Werner (founder of GitHub), Sam Lambert (Planetscale CEO & ex-GitHub CTO), Sebastian Markbåge (creator of React), and many more.

About the role

Graphite is growing rapidly, we're looking for a senior product designer to help us execute on our user experience vision, bring innovative and impactful features to our users, and evolve our design system.

Rethinking the way fast-moving software engineering teams write and review code every day is no small feat, and we believe that the best solutions are built when most talented, ambitious, and dedicated people with diverse backgrounds come together. We're a fast-paced product and design driven company with an extremely talented and insightful engineering team.

The ideal candidate has:

• 7+ years of experience
• Full stack, UX and visual design skills
• Can translate ambiguous user needs into concrete requirements and design solutions
• Interest in workflow or design / dev tools are a plus`,
  },
  {
    company: "Brightwave",
    title: "Founding Product Designer",
    location: "New York, NY / Boulder, CO / Bay Area",
    remote: false,
    experienceLevel: "Late Career (9+ years)",
    companyUrl: "https://brightwave.io",
    jobUrl: "https://app.onliftoff.com/s/expS54",
    liftoffLogo: `${CF}2fa7d7aa_0c57_4801_8ffc_b280670ec2fc.jpg`,
    description: `We work in person 3 days a week in beautiful offices at our New York City and Boulder sites, and will do the same in the Bay Area as the team there grows.

Brightwave is on a mission to transform the way humans understand the world around them, starting with the $23T financial services industry. We are hiring a Founding Product Designer to solve complex UX/UI challenges at the intersection of AI and investment research. We have excellent traction, with a working product and customers who have demonstrated a very high willingness to pay.

We are hiring in New York City, Boulder, and the Bay Area.

Brightwave is backed by some of the largest institutional asset managers in the world as well as angels from OpenAI, Databricks, Uber and LinkedIn. We hire seasoned professionals who have exceptional experiences, and fit the job to the person as a rule. Our founding team includes Staff and Senior Staff-level engineers from organizations like Meta and Databricks alongside go-to-market leaders from Goldman Sachs, UBS and McKinsey.

Reach out if you want to do the best work of your career with a stacked bench of focused, good-humored people who are building a must-have product in an enormous market.`,
  },
  {
    company: "Liftoff",
    title: "Staff / Senior Product Designer",
    location: "New York, NY / London, UK",
    remote: false,
    experienceLevel: "Late Career (9+ years)",
    companyUrl: "https://onliftoff.com",
    jobUrl: "https://app.onliftoff.com/s/kSmrN1",
    liftoffLogo: `${CF}f0fa4275_0414_444c_b71e_ae57ce4bb2f3.jpg`,
    description: `We are looking for someone based in New York, to work in a hybrid setup 1-2 days/week with our team in our office in FiDi.

Liftoff is a hiring and networking platform that enables people to find incredible opportunities and talent, through people they trust. Liftoff eliminates the pain of today's hiring processes by providing the easiest way to discover and connect with the best people for the job, through social networks and trusted recommendations.

We are seeking an NY-based Principal-level or Senior-level Designer to join our team, which is based in NY and London. We are an incredibly design-led company, and put a lot of care into building a consumer product that is loved. This person will have a lot of support and opportunity to lead at the headwaters of design and product strategy.

The ideal person:

• Has at least 5 years of experience and is fluent in driving a design process forward from 0 to 1
• Has worked on consumer products -- consumer social, marketplace, workflow, or media products are a bonus
• Has product-orientation -- has executed in a startup environment and brings strong intuition on prioritization. There is an opportunity for this role to bridge both product and design if the person would like to.

They'll be joining a driven, experienced, and incredibly human team that is passionate about building a better future for talent and opportunity matchmaking.`,
  },
  {
    company: "Lora",
    title: "Founding Product Designer / Head of Design",
    location: "New York, NY",
    remote: false,
    experienceLevel: "Mid Career (3-8 years)",
    companyUrl: "https://www.getlora.com",
    jobUrl: "https://getastroai.notion.site/Founding-Designer-Head-of-Design-27027e2c5da680a9a841d8134b700138",
    description: `This role is based in NYC, with regular in-person work at our Flatiron office.

Lora is building a new kind of consumer app centered on identity. It helps people understand themselves and each other through patterns, not profiles. Astrology is where we are starting, but the goal is much bigger.

Today's social platforms are built on content and performance. They flatten people into posts and algorithm signal. Lora flips that. We're building a system that reflects your actual lived context and evolves with you over time.

The product sits at the intersection of self-discovery and social connection. With AI-driven personalization, it turns complex signals into insights and patterns that feel intuitive, specific, and actually useful.

Our mission is simple: help people see themselves more clearly, and create deeper, more meaningful connections because of it.

We've just raised our seed round backed by AlleyCorp and are assembling our founding team in New York.

We're looking for a Founding Product Designer to own our end-to-end product design and shape the visual and interaction DNA that will scale with millions of users.

The ideal candidate:

• Has 5-7+ years of design experience with at least 2 years designing consumer apps; true 0→1 experience in a start-up environment is a plus
• Owns exceptional product craft with deep attention to aesthetic, usability, flow, and the details that create delight
• Creates scalable design systems from the ground up that can evolve with the product
• Partners strategically with the founder/CEO and Head of Growth to shape the product vision and company direction
• Moves quickly with Figma and other tools to prototype, test, and iterate directly with users`,
  },
  {
    company: "Automat",
    title: "Founding Designer",
    location: "San Francisco, CA",
    remote: false,
    experienceLevel: "Mid Career (3-8 years)",
    companyUrl: "https://www.runautomat.com",
    jobUrl: "https://jobs.ashbyhq.com/automat/5c9a8eae-0705-48b6-9b7a-8d752146feb0",
    liftoffLogo: `${CF}64250a01_dfd4_4279_9dbc_bd59944d6a2b.jpg`,
    description: `This role is on-site in San Francisco.

Automat is building the simplest way for companies to create AI agents that automate repetitive tasks - from navigating complex interfaces to processing documents. Our mission is to make building automations as intuitive as showing a coworker what to do. We're founded by a diverse group of creative technologists from teams like Google Creative Lab and Google Robotics at X.

We're scaling quickly with enterprise customers who value our technology, and we're redefining the future of AI-powered automation.

We're seeking a Founding Designer to shape our platform's experience and establish our brand language across all touchpoints. You'll work directly with our CEO, Lucas, to create balanced, efficient, and thoughtfully designed products.

The ideal candidate:

• Has at least 5+ years of experience, with experience in a fast-moving, high-growth setting
• Has exceptional visual and typographic design taste, and meticulous attention to UX
• Can solve ambiguous problem spaces through making and iterating, from concept through production
• Is inspired by the new creative possibilities that AI interactions enable and is eager to invent
• Vibe-codes prototypes for their design ideas

This is a foundational role that will help define the future of enterprise automation through thoughtful, human-centered design.`,
  },
  {
    company: "Ladder",
    title: "Lead Product Designer",
    location: "Remote — US & Canada",
    remote: true,
    experienceLevel: "Late Career (9+ years)",
    companyUrl: "https://www.joinladder.com",
    jobUrl: "https://jobs.ashbyhq.com/ladder/6cbf504f-5987-4721-a487-7a82eaf5fcf9",
    liftoffLogo: `${CF}502518df_3c61_4570_bfe8_d44c294d7476.jpg`,
    description: `This role is 100% remote (as long as you're in US / Canada and can work PT - ET timezones).

We're hiring an experienced Product Design leader to help shape the future of strength training. As an app that the average user opens 3x a day and a finalist for Apple's App of the Year 2025, we feel deep responsibility to build intuitive, high-polish mobile experiences — not shiny UI for its own sake, but products people genuinely rely on to improve their real lives.

You'll own substantial parts of the product, partnering closely with engineering and product to elevate our design systems, research practice, and overall quality bar. We're looking for designers with deep mobile consumer experience, who are just as comfortable zooming out to help leadership solve big strategic questions ("How do we make the app feel better the more it's used?") as they are delivering features that exceed user expectations. We're a team of 30, so there's no red tape — brilliant ideas come from every seat in the house and bringing them to life for our users quickly is our biggest secret weapon.

We're a profitable company with tens of millions in the bank, founders who are obsessive about unit economics, and a product philosophy grounded in delivering real value — not enshittified engagement loops or constant upsells. We're iOS-only, English-only, and relentlessly focused on experiences that redefine people's expectations for what an app on their phone can do.

• 100% remote friendly workplace (US / Canada, PT - ET timezones)
• 5+ years of product design on consumer mobile products preferred
• Passion for health & fitness is, of course, a plus
• High agency / start-up mindset is a must`,
  },
];

// Sway's Liftoff listing now returns 404 — retire rather than enrich.
const DEACTIVATE = ["Sway"];

async function admin(method, body) {
  const res = await fetch(ADMIN, {
    method,
    headers: { "Content-Type": "application/json", "x-admin-secret": SECRET },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function uploadLogo(url, filename) {
  const res = await fetch("https://designbetter.careers/api/admin/upload-logo", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-secret": SECRET },
    body: JSON.stringify({ url, filename }),
  });
  const d = await res.json().catch(() => ({}));
  return d.blobUrl ?? null;
}

// Look up ids by company via the admin list endpoint.
const listRes = await fetch(ADMIN, { headers: { "x-admin-secret": SECRET } });
const all = await listRes.json();
const idFor = (company, title) => {
  const hit = all.find((j) => j.company === company);
  return hit?.id ?? null;
};

console.log(`\nEnriching ${UPDATES.length} roles${DRY ? " [dry run]" : ""}\n`);

for (const u of UPDATES) {
  const id = idFor(u.company);
  if (!id) { console.log(`  ✗ ${u.company}: not found on board`); continue; }
  const { liftoffLogo, company, ...fields } = u;

  if (DRY) {
    console.log(`  · ${company}: ${fields.description.length} chars desc, url=${fields.jobUrl.slice(0, 55)}, domain=${fields.companyUrl ?? "none"}`);
    continue;
  }

  const r = await admin("PATCH", { id, ...fields });
  if (r.data?.ok) {
    console.log(`  ✓ ${company}: ${fields.description.length} chars of description`);
  } else {
    console.log(`  ✗ ${company}: ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`);
  }
}

if (!DRY) {
  for (const company of DEACTIVATE) {
    const id = idFor(company);
    if (!id) { console.log(`  ✗ ${company}: not found`); continue; }
    const r = await admin("PATCH", { id, active: false });
    console.log(`  ${r.data?.ok ? "🗑" : "✗"} ${company}: deactivated (Liftoff listing 404s)`);
  }
}

console.log("");
