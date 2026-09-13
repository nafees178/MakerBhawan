/**
 * One place for the facts the whole site repeats: the canonical origin, the
 * name, the address, the contact route. Metadata, the sitemap, robots.txt, the
 * OpenGraph card, the footer and the structured data all read from here, so
 * moving to a custom domain is a one-line change rather than a hunt.
 */

/**
 * The canonical origin. Vercel sets NEXT_PUBLIC_SITE_URL once a custom domain
 * is attached; until then every absolute URL points at the vercel.app host,
 * which is where the site actually answers.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://makerbhawan-dev.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "Anand Rathi Tinkerers' Lab";
export const SITE_SHORT = "ARTL";
export const INSTITUTE = "IIT Jodhpur";

export const SITE_DESCRIPTION =
  "The maker space at IIT Jodhpur. Machines, equipment and the students who build with them.";

export const CONTACT_EMAIL = "gensecy_acac@iitj.ac.in";

/** The institute switchboard, published by IIT Jodhpur. Not a lab extension. */
export const INSTITUTE_PHONE = "+91 291 2801132";

/**
 * The postal address of the institute, which is the address the lab sits at.
 * `line` is what a visitor types into a map; `room` is where inside the campus
 * to go once they are through the gate.
 */
export const ADDRESS = {
  room: "Anand Rathi Tinkerers' Lab",
  institute: "Indian Institute of Technology Jodhpur",
  line: "NH 62, Nagaur Road, Karwar",
  city: "Jodhpur",
  postcode: "342030",
  region: "Rajasthan",
  country: "India",
} as const;

export const ADDRESS_LINES = [
  ADDRESS.room,
  ADDRESS.institute,
  `${ADDRESS.line}`,
  `${ADDRESS.city} ${ADDRESS.postcode}, ${ADDRESS.region}`,
  ADDRESS.country,
];

/** Where the sitemap and the header agree the public site lives. */
export const NAV = [
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/inventory", label: "Inventory" },
  { href: "/people", label: "People" },
] as const;

export const LEGAL_NAV = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

/** Absolute URL for a path, for canonicals, OpenGraph and the sitemap. */
export const absolute = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Page metadata in one call, so no route can ship without a title, a
 * description, a canonical and a share card.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const url = absolute(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE_SHORT}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website" as const,
      ...(image ? { images: [{ url: absolute(image) }] } : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} · ${SITE_SHORT}`,
      description,
    },
  };
}
