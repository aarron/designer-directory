/**
 * Run with: npx ts-node --project tsconfig.json scripts/import-data.ts
 * Or: npx tsx scripts/import-data.ts
 *
 * Place the xlsx files in the project root before running.
 */

import { PrismaClient, WorkStatus } from "@prisma/client";
import * as fs from "fs";

const db = new PrismaClient();

function normalizeRoleType(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const lower = s.toLowerCase();
      if (lower === "full-time") return "Full-time";
      if (lower === "part-time") return "Part-time";
      if (lower === "contract") return "Contract";
      if (lower === "advising") return "Advising";
      if (lower === "internship") return "Internship";
      return s;
    })
    .filter(Boolean);
}

function normalizeWorkStatus(timing: string): WorkStatus {
  const t = (timing || "").toLowerCase();
  if (t.includes("right now")) return "OPEN";
  if (t.includes("3 months") || t.includes("3-6")) return "OPEN_SOON";
  if (t.includes("not looking")) return "NOT_LOOKING";
  return "OPEN";
}

async function importFromJson(jsonPath: string) {
  if (!fs.existsSync(jsonPath)) {
    console.log(`File not found: ${jsonPath}`);
    return;
  }

  const rows = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Importing ${rows.length} designers from ${jsonPath}...`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = row["Email Address"] || row.email;
    if (!email) { skipped++; continue; }

    const publicPerm = (row["Permission: Can we share your profile publicly in our talent directory? "] || "Yes")
      .toLowerCase() !== "no";

    if (!publicPerm) { skipped++; continue; }

    const existing = await db.designer.findUnique({ where: { email } });
    if (existing) { skipped++; continue; }

    const typeOfRoleRaw = row["Type of role"] || row.typeOfRole || "Full-time";

    try {
      await db.designer.create({
        data: {
          firstName: row["First Name"] || row.firstName || "",
          lastName: row["Last Name"] || row.lastName || "",
          email,
          bio: row["Short bio"] || row.bio || null,
          title: row["Current or most recent title"] || row.title || null,
          company: row["Company"] || row.company || null,
          linkedinUrl: row["LinkedIn URL"] || row.linkedinUrl || null,
          websiteUrl: row["Website/portfolio"] || row.websiteUrl || null,
          primaryRole: row["Primary role"] || row.primaryRole || "UX/UI Design",
          location: row["Location"] || row.location || "Remote",
          experienceLevel: row["Your experience level"] || row.experienceLevel || "Mid Career (3-8 years)",
          typeOfRole: normalizeRoleType(typeOfRoleRaw),
          companySize: row["Company size "] || row.companySize || null,
          compensation: row["What's your desired compensation? (USD)"] != null ? String(row["What's your desired compensation? (USD)"]) : null,
          requiresVisa: (row["Do you require a visa to work in the US?"] || "").toLowerCase() === "yes",
          openToWork: normalizeWorkStatus(row["Timing"] || row.timing || ""),
          publicProfile: true,
          shareConfidentially:
            (row["Permission: Can we confidentially share your info with interested companies?"] || "")
              .toLowerCase() !== "no",
        },
      });
      imported++;
    } catch (err) {
      console.error(`Failed to import ${email}:`, err);
      skipped++;
    }
  }

  console.log(`Done: ${imported} imported, ${skipped} skipped.`);
}

async function main() {
  await importFromJson("scripts/talent-data.json");
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
