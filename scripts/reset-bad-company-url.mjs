/**
 * Clears companyUrl/companyLogoUrl for companies passed on the command line, so
 * the resolver can derive them again from scratch. Use after fixing a
 * domain-inference bug that stored the wrong site for a company.
 *
 *   node scripts/reset-bad-company-url.mjs "Lemon.io"
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const names = process.argv.slice(2);
if (!names.length) {
  console.error("Pass one or more company names.");
  process.exit(1);
}

const r = await db.job.updateMany({
  where: { company: { in: names } },
  data: { companyUrl: null, companyLogoUrl: null },
});
console.log(`Reset ${r.count} job(s) for: ${names.join(", ")}`);
await db.$disconnect();
