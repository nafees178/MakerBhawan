"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readConsent, writeConsent } from "@/components/site/consent";

/**
 * The banner only exists to ask one question, so it asks it plainly and gets
 * out of the way. It renders nothing until the browser has been checked, which
 * keeps it from flashing on for people who answered months ago, and it is a
 * bar at the foot of the page rather than a modal over it: declining should not
 * require dismissing anything to read the site.
 *
 * Accept and Decline carry equal weight. A decline button styled as an
 * afterthought is the pattern regulators keep objecting to, and it is also just
 * a worse experience.
 */
export function CookieBanner() {
  const [asking, setAsking] = useState(false);

  useEffect(() => setAsking(readConsent() === null), []);

  if (!asking) return null;

  const answer = (value: "granted" | "denied") => {
    writeConsent(value);
    setAsking(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ground/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="text-sm leading-relaxed text-muted">
          We measure page views to see which parts of the site get used. The basic count sets no
          cookies and runs either way. Analytics cookies only load if you say yes.{" "}
          <Link href="/privacy" className="link text-ink">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => answer("denied")} className="btn-ghost flex-1 px-4 md:flex-none">
            Decline
          </button>
          <button type="button" onClick={() => answer("granted")} className="btn flex-1 px-4 md:flex-none">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
