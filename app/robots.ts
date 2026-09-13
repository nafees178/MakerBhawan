import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/**
 * Disallowing /admin here is signposting, not security: a robots file is a
 * request to well-behaved crawlers and is itself public. The actual gate on
 * those routes is RLS in Postgres plus the role check in lib/auth.
 *
 * /auth carries one-time codes in the query string, so keeping it out of an
 * index is worth doing even though the codes expire.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/login", "/thank-you"] }],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
