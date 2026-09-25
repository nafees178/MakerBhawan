import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getViewer } from "@/lib/auth";
import { CONTACT_EMAIL, pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: "You are in",
    description: "Your Anand Rathi Tinkerers' Lab account is active.",
    path: "/thank-you",
  }),
  // A confirmation page has nothing to offer a search result, and indexing it
  // only produces a dead end for whoever lands there without an account.
  robots: { index: false, follow: false },
};

/**
 * Where the sign-in flow ends when the visitor had no particular destination.
 * It confirms the thing that just happened and then points at the three things
 * an account is actually for, because "thanks" on its own is a dead end.
 */
export default async function ThankYouPage() {
  const viewer = await getViewer();

  // Reached without signing in, which means a stale bookmark or a shared link.
  if (!viewer) redirect("/login");

  const first = viewer.fullName?.split(" ")[0];

  return (
    <div className="max-w-3xl">
      <PageHeader label="Account" title={first ? `You are in, ${first}` : "You are in"}>
        Your account is active and signed in on this browser. It stays signed in, so you will not
        need to log in again on this device.
      </PageHeader>

      <ul className="divide-y divide-line border-y border-line">
        {[
          {
            href: "/inventory",
            title: "See what is on the shelves",
            body: "The full equipment list, with what is available right now.",
          },
          {
            href: "/events",
            title: "Check the calendar",
            body: "National Science Day, the Sandstone Summit and Robocon, with the detail on each.",
          },
          {
            href: "/projects",
            title: "Read the SPARK briefs",
            body: "The summer projects released by the Robotics Society, and what each one is building.",
          },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group grid gap-1 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
            >
              <div>
                <p className="text-lg font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </div>
              <span aria-hidden className="text-ember transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm leading-relaxed text-muted">
        Borrowing equipment is arranged with a coordinator in the lab rather than through the site.
        Anything else, write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
