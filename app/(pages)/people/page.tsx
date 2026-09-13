import type { Metadata } from "next";
import { Empty, PageHeader, SectionTitle } from "@/components/PageHeader";
import { pageMeta } from "@/lib/site";
import { getMembers } from "@/lib/data";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "People",
  description:
    "The faculty advisors, managers and coordinators who run the Anand Rathi Tinkerers' Lab at IIT Jodhpur.",
  path: "/people",
});

// Seniority reads through size: faculty advisors largest, managers a step down,
// everyone else at the base size. Keyed on the section name set in the admin.
const TIERS = {
  lg: {
    grid: "gap-x-10 gap-y-10 sm:grid-cols-2",
    photo: "h-28 w-28",
    px: 112,
    initials: "text-xl",
    name: "text-xl",
    role: "text-base",
    links: "text-sm",
  },
  md: {
    grid: "gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3",
    photo: "h-20 w-20",
    px: 80,
    initials: "text-base",
    name: "text-lg",
    role: "text-sm",
    links: "text-xs",
  },
  sm: {
    grid: "gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3",
    photo: "h-16 w-16",
    px: 64,
    initials: "text-sm",
    name: "text-base",
    role: "text-sm",
    links: "text-xs",
  },
} as const;

function tierFor(section: string) {
  if (/faculty/i.test(section)) return TIERS.lg;
  if (/manager/i.test(section)) return TIERS.md;
  return TIERS.sm;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(dr|prof)\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// A link when there is a URL; a dimmed slot when the member's details are still
// to come; nothing at all when the link simply does not apply (faculty GitHub).
function LinkSlot({ href, label, pending }: { href: string | null; label: string; pending: boolean }) {
  if (href) {
    const external = !href.startsWith("mailto:");
    return (
      <a className="link" href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label}
      </a>
    );
  }
  if (!pending) return null;
  return (
    <span className="cursor-default text-muted/40" title="To be added">
      {label}
    </span>
  );
}

export default async function PeoplePage() {
  const members = await getMembers();

  // Sections in the order their first member appears, so sort_order in the
  // admin controls section order as well as order within a section.
  const groups = new Map<string, Member[]>();
  for (const m of members.filter((m) => !m.is_alumni)) {
    const key = m.department ?? "Team";
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }

  return (
    <>
      <PageHeader label="People" title="The team">
        The faculty and students who run the lab.
      </PageHeader>

      {groups.size === 0 && <Empty>No team members listed yet.</Empty>}

      <div className="space-y-14">
        {[...groups].map(([section, people]) => {
          const tier = tierFor(section);
          return (
            <section key={section}>
              <SectionTitle count={people.length}>{section}</SectionTitle>
              <ul className={cn("grid", tier.grid)}>
                {people.map((m) => (
                  <li key={m.id} className="group flex items-center gap-5">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_url}
                        alt={`${m.full_name}, ${m.role_label}.`}
                        width={tier.px}
                        height={tier.px}
                        className={cn(
                          "shrink-0 rounded-full object-cover ring-1 ring-line grayscale transition duration-300 group-hover:grayscale-0 group-hover:ring-ember",
                          tier.photo,
                        )}
                        loading="lazy"
                      />
                    ) : (
                      <span
                        aria-hidden
                        title={m.is_placeholder ? "Photo to be added" : undefined}
                        className={cn(
                          "grid shrink-0 place-items-center rounded-full border border-dashed border-line font-mono text-muted",
                          tier.photo,
                          tier.initials,
                        )}
                      >
                        {initials(m.full_name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className={cn("font-medium", tier.name)}>{m.full_name}</p>
                      <p className={cn("text-muted", tier.role)}>{m.role_label}</p>
                      <p className={cn("mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-muted", tier.links)}>
                        <LinkSlot href={m.profile_url} label="Profile" pending={false} />
                        <LinkSlot href={m.linkedin_url} label="LinkedIn" pending={m.is_placeholder} />
                        <LinkSlot href={m.github_url} label="GitHub" pending={m.is_placeholder} />
                        <LinkSlot href={m.email ? `mailto:${m.email}` : null} label="Email" pending={false} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
