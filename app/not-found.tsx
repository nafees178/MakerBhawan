import Link from "next/link";
import { NAV } from "@/lib/site";

/**
 * Lives at the app root, so it renders inside the root layout rather than the
 * contained one the inner pages share. It carries its own column.
 *
 * A 404 is most often a stale link or a typed URL, so the page spends its space
 * on where to go next rather than on apologising.
 */
export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="grid-bg absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div
        aria-hidden
        className="absolute -top-40 right-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgb(247_148_29/0.14),transparent_65%)]"
      />

      <div className="mx-auto grid min-h-[70svh] max-w-6xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-sm text-ember">404</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            This page is not
            <br />
            <span className="text-muted">on the shelf.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            The link may be old, or the page may have moved. Everything the site publishes is one
            hop away.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn">
              Back to the home page
            </Link>
            <Link href="/inventory" className="btn-ghost">
              Browse equipment
            </Link>
          </div>
        </div>

        <nav aria-label="Site sections" className="rounded-xl border border-line bg-panel/40 p-2">
          <ul className="divide-y divide-line">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="text-ember">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
