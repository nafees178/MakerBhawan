import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Roboto_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { ScrollProgress } from "@/components/home/motion";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLink } from "@/components/NavLink";
import { getViewer, isCoordinator } from "@/lib/auth";

const sans = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Anand Rathi Tinkerers' Lab — IIT Jodhpur",
    template: "%s — ARTL",
  },
  description: "The innovation hub and maker space at IIT Jodhpur.",
};

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/inventory", label: "Inventory" },
  { href: "/people", label: "People" },
];

const CONTACT_EMAIL = "gensecy_acac@iitj.ac.in";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const coordinator = viewer && isCoordinator(viewer.role);

  return (
    // suppressHydrationWarning: the inline script adds `js` before React
    // hydrates, so server and client class lists differ by design.
    // data-scroll-behavior: lets Next.js turn smooth scrolling off during route
    // changes, so a click lands at the top of the new page instead of gliding.
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* beforeInteractive: runs ahead of hydration, so reveal styles never
            hide content from a visitor whose scripts are blocked. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.classList.add('js')"}
        </Script>
      </head>
      <body>
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ground/70 backdrop-blur-xl">
          <ScrollProgress />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
            <Link href="/" className="flex items-center gap-3" aria-label="Anand Rathi Tinkerers' Lab, home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/artl-icon.svg" alt="" width={30} height={34} className="h-8 w-auto" />
              <span className="text-sm font-semibold tracking-tight">
                Anand Rathi <span className="hidden sm:inline">Tinkerers&apos; Lab</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Main">
              {NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 text-sm md:flex">
              {viewer ? (
                <>
                  {coordinator && (
                    <Link href="/admin" className="rounded-full border border-line px-4 py-2 transition-colors hover:border-ink">
                      Admin
                    </Link>
                  )}
                  <form action="/auth/signout" method="post">
                    <button className="px-2 py-2 text-muted transition-colors hover:text-ink">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-2 py-2 text-muted transition-colors hover:text-ink">
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full bg-ink px-4 py-2 font-medium text-ground transition-colors hover:bg-white"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>

            <MobileMenu>
              {NAV.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
              <span aria-hidden className="my-1 h-px bg-line" />
              {viewer ? (
                <>
                  {coordinator && <NavLink href="/admin">Admin</NavLink>}
                  <form action="/auth/signout" method="post">
                    <button className="text-muted">Sign out</button>
                  </form>
                </>
              ) : (
                <NavLink href="/login">Log in or join</NavLink>
              )}
            </MobileMenu>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="flex items-center gap-4">
                <img src="/images/artl-icon.svg" alt="ARTL" width={52} height={60} className="h-14 w-auto" />
                <p className="text-lg font-semibold leading-tight tracking-tight">
                  Anand Rathi
                  <br />
                  <span className="text-muted">Tinkerers&apos; Lab</span>
                </p>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
                The innovation hub and maker space at IIT Jodhpur, supported by the Maker Bhavan Foundation and Anand
                Rathi.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <p className="label mb-1">Explore</p>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="text-sm">
              <p className="label mb-4">Visit</p>
              <address className="not-italic leading-relaxed text-muted">
                IIT Jodhpur
                <br />
                NH 65, Nagaur Road
                <br />
                Karwar, Jodhpur 342030
                <br />
                Rajasthan, India
              </address>
            </div>
            <div className="text-sm">
              <p className="label mb-4">Contact</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="link break-all">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-line px-5 py-6 text-xs text-muted sm:px-8">
            <span>© {new Date().getFullYear()} Anand Rathi Tinkerers&apos; Lab, IIT Jodhpur</span>
            <span>Indian Institute of Technology Jodhpur</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
