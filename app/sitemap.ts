import { MetadataRoute } from "next";
import { ROLE_SEO, SEO_LOCATIONS } from "@/lib/seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${APP_URL}/talent`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/post-a-job`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // /hire/[role] pages
  const hireRolePages: MetadataRoute.Sitemap = Object.values(ROLE_SEO).map(({ slug }) => ({
    url: `${APP_URL}/hire/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // /hire/[role]/[location] pages
  const hireLocationPages: MetadataRoute.Sitemap = Object.values(ROLE_SEO).flatMap(({ slug: roleSlug }) =>
    Object.values(SEO_LOCATIONS).map(({ slug: locationSlug }) => ({
      url: `${APP_URL}/hire/${roleSlug}/${locationSlug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    }))
  );

  // /design-jobs/[role] pages
  const jobsRolePages: MetadataRoute.Sitemap = Object.values(ROLE_SEO).map(({ slug }) => ({
    url: `${APP_URL}/design-jobs/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...hireRolePages,
    ...hireLocationPages,
    ...jobsRolePages,
  ];
}
