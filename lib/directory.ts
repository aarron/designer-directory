import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * The directory a visitor can actually browse: public, not hidden, and not
 * marked "not looking". Every designer count shown on the site comes from
 * here so the home page, /talent and the profile pages agree.
 *
 * Hidden profiles (paused after a missed check-in) are real designers but
 * aren't listed, so counting them — as the home page once did — advertised
 * 300+ against a directory that showed 99.
 */
export const DIRECTORY_VISIBLE_WHERE: Prisma.DesignerWhereInput = {
  publicProfile: true,
  hidden: false,
  NOT: { openToWork: "NOT_LOOKING" },
};

export function getDirectoryCount(): Promise<number> {
  return db.designer.count({ where: DIRECTORY_VISIBLE_WHERE });
}
