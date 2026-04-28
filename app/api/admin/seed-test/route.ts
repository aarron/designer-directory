import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const designer = await db.designer.create({
    data: {
      firstName: "Maya",
      lastName: "Okafor",
      email: "maya.okafor.test@designbetter.test",
      bio: "I'm a product design leader with 12 years of experience building design systems and shipping consumer products at scale. I've led design for teams of up to 18 people across fintech, health, and edtech. I care deeply about accessibility, craft, and creating environments where designers do their best work. Before design, I studied architecture — which still shapes how I think about structure, systems, and the relationship between form and function.",
      photoUrl: "https://i.pravatar.cc/400?img=47",
      title: "Head of Product Design",
      company: "Meridian Health",
      linkedinUrl: "https://linkedin.com/in/maya-okafor",
      websiteUrl: "https://mayaokafor.com",
      primaryRole: "Design Leadership",
      otherRoles: ["Product Design", "UX Design"],
      location: "New York / Remote",
      experienceLevel: "Late Career (9+ years)",
      typeOfRole: ["Full-time", "Advising"],
      companySize: ["Seed", "Early", "Mid"],
      skills: ["Design Systems", "User Research", "Prototyping", "Figma", "Accessibility", "Design Strategy"],
      industries: ["Health & Wellness", "Fintech", "EdTech"],
      startAvailability: "Immediately",
      remotePreference: "Remote only",
      compensation: "180000-220000",
      requiresVisa: false,
      openToWork: "OPEN",
      publicProfile: true,
      shareConfidentially: false,
      hidden: false,
      projects: [
        {
          url: "https://mayaokafor.com/meridian-design-system",
          description: "Built Meridian's end-to-end design system from scratch, reducing design-to-dev handoff time by 60% across 6 product teams.",
        },
        {
          url: "https://mayaokafor.com/onboarding-redesign",
          description: "Led a complete onboarding redesign for a telehealth platform, increasing 30-day retention from 41% to 67%.",
        },
        {
          url: "https://mayaokafor.com/accessibility-audit",
          description: "Directed a full WCAG 2.1 AA accessibility audit and remediation effort affecting 3 million users.",
        },
      ],
      funFacts: "I give a talk every year at a local design school about why every designer should study a physical craft. Mine is ceramics. I also once accidentally designed a billboard that ended up in a Drake music video.",
      mostProudOf: "Hiring and mentoring 11 designers who have all since gone on to senior and lead roles at companies like Stripe, Figma, and Airbnb.",
      pets: "One very opinionated tabby cat named Pantone.",
      recentlyRead: "The Design of Everyday Things (re-reading it for the fourth time — it keeps hitting differently), and Abolish Silicon Valley by Wendy Liu.",
      languagesSpoken: ["English", "French", "Yoruba"],
      instruments: "Classical piano — badly, but enthusiastically.",
      hobbies: "Ceramics, hiking, obsessively organizing my Figma component library on weekends.",
      lastConfirmedAt: new Date(),
    },
  });

  return NextResponse.json({ id: designer.id });
}
