"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// A <details> disclosure: works without script, and this only closes it again
// after a client-side navigation, which would otherwise leave it open.
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="relative md:hidden">
      <summary className="flex min-h-[44px] list-none items-center rounded-md border border-line px-4 text-sm [&::-webkit-details-marker]:hidden">
        Menu
      </summary>
      <div className="absolute right-0 z-50 mt-2 flex w-56 flex-col rounded-md border border-line bg-panel p-2 text-sm shadow-2xl [&_a]:flex [&_a]:min-h-[44px] [&_a]:items-center [&_a]:rounded [&_a]:px-3 [&_button]:flex [&_button]:min-h-[44px] [&_button]:w-full [&_button]:items-center [&_button]:px-3">
        {children}
      </div>
    </details>
  );
}
