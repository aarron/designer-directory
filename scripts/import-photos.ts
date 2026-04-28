/**
 * Run with:
 * npx tsx scripts/import-photos.ts
 *
 * Extracts photos from the zip, matches them to designer records by name,
 * uploads to Vercel Blob, and updates the designer's photoUrl.
 */

import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

const db = new PrismaClient();

const ZIP_PATH = path.join(
  os.homedir(),
  "Downloads",
  "Photo or avatar (File responses)-20260425T212623Z-3-001.zip"
);

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNameFromFilename(filename: string): string | null {
  const base = path.basename(filename, path.extname(filename));
  const dashIdx = base.lastIndexOf(" - ");
  if (dashIdx === -1) return null;
  return base.slice(dashIdx + 3).trim();
}

function nameSimilarity(a: string, b: string): number {
  const aNorm = normalize(a);
  const bNorm = normalize(b);
  if (aNorm === bNorm) return 1;

  const aWords = aNorm.split(" ");
  const bWords = bNorm.split(" ");

  // Count matching words
  const matches = aWords.filter((w) => bWords.includes(w) && w.length > 1).length;
  const total = Math.max(aWords.length, bWords.length);
  return matches / total;
}

async function main() {
  if (!fs.existsSync(ZIP_PATH)) {
    console.error("Zip file not found:", ZIP_PATH);
    process.exit(1);
  }

  // Extract zip to temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "designer-photos-"));
  console.log("Extracting zip to", tmpDir);
  try {
    execSync(`unzip -o "${ZIP_PATH}" -d "${tmpDir}" 2>&1 || true`, { stdio: "pipe" });
  } catch {
    // continue despite extraction warnings
  }
  // Also try ditto which handles macOS special chars better
  try {
    execSync(`ditto -x -k "${ZIP_PATH}" "${tmpDir}" 2>/dev/null || true`, { stdio: "pipe" });
  } catch {
    // ignore
  }

  // Find all image files
  const photoDir = path.join(tmpDir, "Photo or avatar (File responses)");
  const files = fs.readdirSync(photoDir).filter((f) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
  );
  console.log(`Found ${files.length} photos`);

  // Load all designers
  const designers = await db.designer.findMany({
    select: { id: true, firstName: true, lastName: true, photoUrl: true },
  });

  let uploaded = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const file of files) {
    const nameFromFile = extractNameFromFilename(file);
    if (!nameFromFile) {
      console.log(`  SKIP (no name): ${file}`);
      skipped++;
      continue;
    }

    // Find best matching designer
    let bestMatch = null;
    let bestScore = 0;

    for (const designer of designers) {
      const fullName = `${designer.firstName} ${designer.lastName}`;
      const score = nameSimilarity(nameFromFile, fullName);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = designer;
      }
    }

    if (!bestMatch || bestScore < 0.6) {
      console.log(`  NO MATCH (score ${bestScore.toFixed(2)}): "${nameFromFile}" — best: "${bestMatch ? bestMatch.firstName + " " + bestMatch.lastName : "none"}" (${bestScore.toFixed(2)})`);
      noMatch++;
      continue;
    }

    // Skip if already has a photo
    if (bestMatch.photoUrl) {
      skipped++;
      continue;
    }

    const filePath = path.join(photoDir, file);
    const ext = path.extname(file).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      "image/jpeg";

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const blobName = `designers/${bestMatch.id}${ext}`;

      const blob = await put(blobName, fileBuffer, {
        access: "public",
        contentType,
      });

      await db.designer.update({
        where: { id: bestMatch.id },
        data: { photoUrl: blob.url },
      });

      console.log(`  ✓ ${bestMatch.firstName} ${bestMatch.lastName} (score ${bestScore.toFixed(2)}): ${nameFromFile}`);
      uploaded++;
    } catch (err) {
      console.error(`  ERROR uploading ${file}:`, err);
      skipped++;
    }
  }

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true });

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped, ${noMatch} no match`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
