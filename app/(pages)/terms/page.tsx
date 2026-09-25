import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Terms and conditions",
  description:
    "The terms for using the Anand Rathi Tinkerers' Lab site at IIT Jodhpur: accounts, accuracy of listings, content, and conduct.",
  path: "/terms",
});

const UPDATED = "13 September 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <PageHeader label="Legal" title="Terms and conditions">
        The rules for using this site. They are short because the site is small. Last updated{" "}
        {UPDATED}.
      </PageHeader>

      <div className="max-w-[70ch] space-y-10">
        <Section id="agreement" title="Using this site">
          <p>
            This site is published by the Anand Rathi Tinkerers&apos; Lab at the Indian Institute of
            Technology Jodhpur. Using it means accepting what is on this page. If you do not accept
            it, do not use the site.
          </p>
        </Section>

        <Section id="accounts" title="Accounts">
          <p>
            Accounts are intended for members of IIT Jodhpur and are created with an institute email
            address and a password of your choosing.
          </p>
          <p>
            Your account is yours. Do not share access to it, do not sign in on behalf of someone
            else, and tell us if you think someone else has got into it. Your role on the site is set
            by a lab administrator and is not something you can change yourself.
          </p>
          <p>
            We may suspend or remove an account that is used to misrepresent the lab, to interfere
            with the site, or in breach of Institute policy.
          </p>
        </Section>

        <Section id="listings" title="Equipment listings">
          <p>
            The equipment pages show whether an item is on the shelf. That is drawn from the lab
            inventory and is kept current by coordinators, but it is a description of stock and not a
            reservation, a promise or an offer. An item shown as available may have been taken by
            someone standing in the lab a minute ago.
          </p>
          <p>
            Equipment is lent at the discretion of the coordinators, on the lab&apos;s own terms, and
            some items never leave the building. Nothing on this site creates an entitlement to
            borrow anything.
          </p>
        </Section>

        <Section id="events" title="Events and projects">
          <p>
            Event dates, formats and venues are listed as they are known and change. Where an event
            is run by another body, such as the School of Management and Entrepreneurship or a
            national organiser, that body sets its own rules and its own registration, and its
            announcements take precedence over anything written here.
          </p>
          <p>
            Project pages describe work by students of the Institute. They are written to explain
            the build, not to serve as instructions, and neither the lab nor the Institute warrants
            that following any of it will produce a working or safe result.
          </p>
        </Section>

        <Section id="content" title="Content and credit">
          <p>
            Text, photographs and design on this site belong to the Anand Rathi Tinkerers&apos; Lab
            and the people who made them, except where a third party is credited. Quote us, link to
            us and cite us freely. Republishing whole pages, or reusing the lab&apos;s name or marks
            in a way that implies endorsement, needs permission first.
          </p>
          <p>
            Project write-ups belong to the students who did the work. If something of yours is here
            and you want it changed or removed, write to us and it will be handled.
          </p>
        </Section>

        <Section id="conduct" title="What not to do">
          <p>
            Do not attempt to gain access to parts of the site that are not yours, to probe or
            overload it, to scrape it automatically at a rate that affects other people, or to use it
            to distribute anything unlawful.
          </p>
        </Section>

        <Section id="availability" title="Availability and accuracy">
          <p>
            The site is provided as it is. We aim to keep it accurate and online and cannot promise
            either. It may be unavailable for maintenance, and information on it may be out of date
            between the moment something changes in the lab and the moment a coordinator updates the
            record.
          </p>
          <p>
            To the extent the law allows, the lab and the Institute are not liable for loss arising
            from reliance on the site, from its unavailability, or from any third party site linked
            from it.
          </p>
        </Section>

        <Section id="law" title="Governing law">
          <p>
            These terms are governed by the laws of India, and the courts at Jodhpur, Rajasthan have
            jurisdiction. Institute policy applies alongside these terms for members of the
            Institute, and where the two differ, Institute policy governs.
          </p>
        </Section>

        <Section id="contact" title="Questions">
          <p>
            Write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink">
              {CONTACT_EMAIL}
            </a>
            . See also the{" "}
            <Link href="/privacy" className="link text-ink">
              privacy policy
            </Link>
            .
          </p>
        </Section>
      </div>
    </>
  );
}
