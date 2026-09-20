import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { ScrollProgress } from "@/components/home/motion";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLink } from "@/components/NavLink";
import { Analytics } from "@/components/site/Analytics";
import { CookieBanner } from "@/components/site/CookieBanner";
import { StickyCta } from "@/components/site/StickyCta";
import { getViewer, isCoordinator } from "@/lib/auth";
import {
  ADDRESS,
  CONTACT_EMAIL,
  INSTITUTE_PHONE,
  LEGAL_NAV,
  NAV,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const sans = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  // Every relative URL in a page's metadata resolves against this, so canonical
  // tags and share cards keep working when the domain changes.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}, IIT Jodhpur`,
    template: "%s · ARTL",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Anand Rathi Tinkerers' Lab",
    "IIT Jodhpur",
    "maker space",
    "Robotics Society",
    "SPARK",
    "Robocon",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME}, IIT Jodhpur`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}, IIT Jodhpur`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

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
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ground/70 backdrop-blur-xl">
          <ScrollProgress />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
            <Link href="/" className="flex items-center gap-3" aria-label={`${SITE_NAME}, home`}>
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
                    <Link
                      href="/admin"
                      className="rounded-md border border-line px-4 py-2 transition-colors hover:border-ink"
                    >
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
                    href="/signup"
                    className="rounded-md bg-ink px-4 py-2 font-medium text-ground transition-colors hover:bg-white"
                  >
                    Sign up
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
                <>
                  <NavLink href="/login">Log in</NavLink>
                  <NavLink href="/signup">Sign up</NavLink>
                </>
              )}
            </MobileMenu>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/artl-icon.svg"
                  alt="The Anand Rathi Tinkerers&apos; Lab monogram."
                  width={52}
                  height={60}
                  className="h-14 w-auto"
                />
                <p className="text-lg font-semibold leading-tight tracking-tight">
                  Anand Rathi
                  <br />
                  <span className="text-muted">Tinkerers&apos; Lab</span>
                </p>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
                The innovation hub and maker space at IIT Jodhpur, supported by the Maker Bhavan
                Foundation and Anand Rathi.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <p className="label mb-1">Explore</p>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ))}
              {LEGAL_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="text-sm">
              <p className="label mb-4">Visit</p>
              <address className="not-italic leading-relaxed text-muted">
                {ADDRESS.room}
                <br />
                {ADDRESS.institute}
                <br />
                {ADDRESS.line}
                <br />
                {ADDRESS.city} {ADDRESS.postcode}
                <br />
                {ADDRESS.region}, {ADDRESS.country}
              </address>
            </div>

            <div className="text-sm">
              <p className="label mb-4">Contact</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="link break-all">
                {CONTACT_EMAIL}
              </a>
              <p className="mt-3 leading-relaxed text-muted">
                Institute switchboard
                <br />
                <a href={`tel:${INSTITUTE_PHONE.replace(/\s/g, "")}`} className="link">
                  {INSTITUTE_PHONE}
                </a>
              </p>
            </div>
          </div>

          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-line px-5 py-6 text-xs text-muted sm:px-8">
            <span>
              © {new Date().getFullYear()} {SITE_NAME}, IIT Jodhpur
            </span>
            <span>Indian Institute of Technology Jodhpur</span>
          </div>

          {/* Clearance for the phone action bar, which floats over the page. */}
          <div aria-hidden className="h-20 md:hidden" />
        </footer>

        <StickyCta signedIn={Boolean(viewer)} />
        <CookieBanner />
        <Analytics />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollegeOrUniversity",
              name: SITE_NAME,
              alternateName: "ARTL",
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              parentOrganization: { "@type": "CollegeOrUniversity", name: ADDRESS.institute },
              email: CONTACT_EMAIL,
              telephone: INSTITUTE_PHONE,
              address: {
                "@type": "PostalAddress",
                streetAddress: ADDRESS.line,
                addressLocality: ADDRESS.city,
                postalCode: ADDRESS.postcode,
                addressRegion: ADDRESS.region,
                addressCountry: "IN",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
