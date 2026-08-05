import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const result = await db.job.updateMany({
  where: {
    posterEmail: "aarronwalter@gmail.com",
    matchFrequency: "once",
    lastMatchSentAt: null,
  },
  data: { matchFrequency: null },
});

console.log(`Updated ${result.count} jobs — matchFrequency set to null`);
await db.$disconnect();
