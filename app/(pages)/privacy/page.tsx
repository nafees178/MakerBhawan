import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ADDRESS_LINES, CONTACT_EMAIL, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description:
    "What the Anand Rathi Tinkerers' Lab site collects, why it collects it, how long it is kept, and how to have it removed.",
  path: "/privacy",
});

/** Bumped by hand whenever the substance below changes, not on every deploy. */
const UPDATED = "13 September 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader label="Legal" title="Privacy policy">
        Written to describe what this site actually does, rather than to cover every thing a website
        could conceivably do. Last updated {UPDATED}.
      </PageHeader>

      <div className="max-w-[70ch] space-y-10">
        <Section id="who" title="Who runs this site">
          <p>
            This site is run by the Anand Rathi Tinkerers&apos; Lab, a student operated facility at
            the Indian Institute of Technology Jodhpur. Questions about anything on this page go to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section id="browsing" title="If you only look around">
          <p>
            You can read every public page without an account and without telling us who you are.
            Events, projects, equipment and the team listing are open.
          </p>
          <p>
            Our host, Vercel, records ordinary web server information for every request: the page
            asked for, the time, the browser and operating system reported by your device, a
            truncated network address and the referring page. This is how any web server works and
            is what makes it possible to notice that the site is down or under attack.
          </p>
        </Section>

        <Section id="accounts" title="If you sign in">
          <p>
            Signing in is for members of IIT Jodhpur. It uses your institute email address and a
            one-time code, and there is no password to store or lose.
          </p>
          <p>We keep, for as long as the account exists:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>your email address, which is also how the account is identified;</li>
            <li>your name, if you give one;</li>
            <li>your roll number, if you give one;</li>
            <li>
              your role on the site, which is set automatically from your email domain and can be
              changed afterwards only by a lab administrator;
            </li>
            <li>the date the account was created.</li>
          </ul>
          <p>
            Authentication is handled by Supabase, which stores the account record and the sign-in
            history on our behalf on servers in the Asia-Pacific region. A session cookie is set in
            your browser so that you stay signed in between pages. It is required for the site to
            work at all once you are signed in, so it is not something the cookie banner asks about.
          </p>
        </Section>

        <Section id="analytics" title="Measurement and cookies">
          <p>
            We use two things to understand which parts of the site get used, and they are treated
            differently because they behave differently.
          </p>
          <p>
            <strong className="font-medium text-ink">Vercel Analytics and Speed Insights</strong> run
            for everyone. They count page views and page loading speed. They set no cookies, store no
            identifier that follows you to other sites, and produce aggregate numbers rather than a
            record of any one visitor.
          </p>
          <p>
            <strong className="font-medium text-ink">Google Analytics</strong> does set cookies, so
            nothing of it loads until you press Accept on the cookie banner. If you press Decline, or
            close the banner without answering, the Google script is never added to the page and no
            request is made to Google at all. Your answer is stored in your own browser, not sent to
            us, and you can change it by clearing this site&apos;s data in your browser settings.
          </p>
        </Section>

        <Section id="uses" title="What we do with any of it">
          <p>
            We use it to run the site and the lab: to let you sign in, to let coordinators keep the
            equipment list accurate, and to see which pages are worth maintaining.
          </p>
          <p>
            We do not sell it, we do not trade it, and we do not use it to build advertising
            profiles. We share it only with the service providers named above, who process it on our
            instructions, and with the Institute where we are required to.
          </p>
        </Section>

        <Section id="retention" title="How long it is kept">
          <p>
            Account information is kept while the account exists. Server logs are kept for a short
            operational period by our host and then rotate out. Aggregate visit counts carry no
            personal information and are kept indefinitely.
          </p>
        </Section>

        <Section id="rights" title="Your choices">
          <p>
            Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink">
              {CONTACT_EMAIL}
            </a>{" "}
            from your institute address to ask what is held about you, to have it corrected, or to
            have your account and its record deleted. Deleting the account removes the profile row
            and the authentication record.
          </p>
          <p>
            Publicly listed team members appear on the People page by name, role and photograph. If
            you are listed and want to be removed, say so and it will be done.
          </p>
        </Section>

        <Section id="children" title="Changes to this page">
          <p>
            If what the site does changes, this page changes with it and the date at the top moves.
            Substantial changes will be announced on the site rather than made quietly.
          </p>
          <p>
            See also the{" "}
            <Link href="/terms" className="link text-ink">
              terms and conditions
            </Link>
            .
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <address className="not-italic leading-relaxed">
            <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink">
              {CONTACT_EMAIL}
            </a>
            <br />
            <br />
            {ADDRESS_LINES.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
        </Section>
      </div>
    </>
  );
}
