import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/profile/edit",
          "/hidden/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
