import type { MetadataRoute } from "next";
import { getEvents, getProjects } from "@/lib/data";
import { absolute } from "@/lib/site";

/**
 * Public pages only. /admin, /login and /auth are either gated or worthless in
 * a search result, and listing them invites crawlers to hammer routes that do a
 * session lookup on every hit.
 *
 * Regenerated hourly so a newly published event or project appears without a
 * redeploy, which is the whole reason the content lives in the database.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absolute("/events"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absolute("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absolute("/inventory"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absolute("/people"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absolute("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absolute("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // A database that is briefly unreachable should cost the sitemap its dynamic
  // entries, not the whole file: an empty sitemap.xml is worse than a short one.
  const [events, projects] = await Promise.all([
    getEvents().catch(() => []),
    getProjects().catch(() => []),
  ]);

  return [
    ...staticRoutes,
    ...events
      .filter((e) => e.slug)
      .map((e) => ({
        url: absolute(`/events/${e.slug}`),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...projects.map((p) => ({
      url: absolute(`/projects/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
