"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readConsent, CONSENT_EVENT } from "@/components/site/consent";

/**
 * A phone-only action bar. It appears once the visitor has scrolled past the
 * first screen, because before that the hero's own buttons are still on screen
 * and a second copy of them is noise.
 *
 * It stays out of the way of the cookie banner by waiting for that question to
 * be answered: two bars stacked at the bottom of a phone is most of the
 * viewport.
 *
 * Hidden entirely for signed-in visitors and inside /admin, where "Sign up" is
 * the wrong thing to offer.
 */
export function StickyCta({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [past, setPast] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const sync = () => setAnswered(readConsent() !== null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (signedIn || pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;
  if (!past || !answered) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ground/95 px-5 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-sm leading-snug text-muted">
          IITJ email and a password.
        </p>
        <Link href="/signup" className="btn shrink-0 px-5">
          Sign up
        </Link>
      </div>
    </div>
  );
}
