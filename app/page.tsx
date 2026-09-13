import Link from "next/link";
import { Chip, container, DeckPanel, DeviceMock, SectionHead } from "@/components/home/blocks";
import { Faq, type FaqGroup } from "@/components/home/Faq";
import { IntroText, Parallax } from "@/components/home/motion";
import { Stage, type Slide } from "@/components/home/Stage";
import { Reveal } from "@/components/Reveal";
import { getEvents, getInventory, getMembers, getProjects, splitEvents } from "@/lib/data";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "gensecy_acac@iitj.ac.in";

// Photographs from the lab itself. Captions describe only what is in frame.
const SLIDES: Slide[] = [
  { tab: "Laser cutting", src: "/images/lab/lab-01.webp", alt: "The laser cutter in the lab.", caption: "The laser cutter on the lab floor." },
  { tab: "Machining", src: "/images/lab/lab-04.webp", alt: "A Roland SRM-20 desktop milling machine.", caption: "A desktop CNC mill, the Roland SRM-20." },
  { tab: "Aircraft", src: "/images/lab/lab-06.webp", alt: "A radio-controlled warbird model on the lab floor.", caption: "An RC aircraft model in the lab." },
  { tab: "Drones", src: "/images/lab/lab-07.webp", alt: "Quadcopter frame, controller and parts laid out on a table.", caption: "Quadcopter parts laid out for a build." },
  { tab: "Sessions", src: "/images/lab/lab-10.webp", alt: "Students gathered around laptops during a session.", caption: "Students working through a session together." },
  { tab: "Demos", src: "/images/lab/lab-03.webp", alt: "Students watching a machine demonstration.", caption: "A machine demonstration for students." },
];

const FAQ: FaqGroup[] = [
  {
    id: "general",
    label: "General",
    items: [
      {
        q: "What is the Anand Rathi Tinkerers' Lab?",
        a: "The innovation hub and maker space at IIT Jodhpur, supported by the Maker Bhavan Foundation and Anand Rathi. It brings machines, equipment and students together in one place.",
      },
      { q: "Where is it?", a: "On the IIT Jodhpur campus: NH 65, Nagaur Road, Karwar, Jodhpur 342030, Rajasthan." },
      { q: "How do I get in touch?", a: `Email ${CONTACT_EMAIL}.` },
    ],
  },
  {
    id: "accounts",
    label: "Accounts",
    items: [
      {
        q: "Who can sign in?",
        a: "Anyone with an IIT Jodhpur email address (ending in @iitj.ac.in). There is no password: enter your email and use the one-time code we send.",
      },
      { q: "Do I need an account to look around?", a: "No. Events, projects, equipment and the team are all public." },
      {
        q: "Who manages the content?",
        a: "Lab coordinators. They keep events, projects, equipment and the team listing up to date.",
      },
    ],
  },
  {
    id: "equipment",
    label: "Equipment",
    items: [
      { q: "What does Available mean?", a: "At least one unit of that item is on the shelf right now." },
      { q: "What does Lab use only mean?", a: "The item stays in the lab and is not taken out." },
      { q: "Can I see exact quantities?", a: "No. Coordinators keep the counts; the public page shows availability only." },
    ],
  },
];

export default async function Home() {
  const [events, projects, items, members] = await Promise.all([
    getEvents(),
    getProjects(),
    getInventory(),
    getMembers(),
  ]);

  const available = items.filter((i) => i.available);
  const team = members.filter((m) => !m.is_alumni);
  const { upcoming, past } = splitEvents(events);
  const featuredEvents = (upcoming.length > 0 ? upcoming : past).slice(0, 3);
  const mockItems = [...available.slice(0, 5), ...items.filter((i) => !i.available).slice(0, 1)];
  const sparkCount = projects.filter((p) => p.programme === "spark-26").length;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden">
        <Parallax rate={0.22} className="absolute inset-0 -z-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lab/lab-11.webp"
            alt=""
            fetchPriority="high"
            className="h-[120%] w-full object-cover object-[center_26%] opacity-[0.62] sm:opacity-55 lg:opacity-45"
          />
        </Parallax>
        {/* See .hero-veil: horizontal on a wide screen, vertical on a narrow one. */}
        <div aria-hidden className="hero-veil absolute inset-0 -z-20" />
        <div aria-hidden className="grid-bg absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div
          aria-hidden
          className="absolute -top-40 right-0 -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgb(247_148_29/0.16),transparent_65%)]"
        />

        <div className={cn(container, "grid min-h-[88svh] items-center gap-14 py-20 lg:grid-cols-[1.1fr_1fr]")}>
          <div>
            <Reveal>
              <Chip>IIT Jodhpur</Chip>
            </Reveal>
            <Reveal delay={80}>
              {/*
                The headline says what the place is and who may use it. A maker
                space does not need a slogan: the specific claim, that the
                machines are here and that any student at this institute can
                come and use them, is the interesting part.
              */}
              <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.1rem]">
                The maker space
                <br />
                at IIT Jodhpur.
                <br />
                <span className="text-muted">Open to every student here.</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                A laser cutter, a desktop CNC mill, and {items.length} items of microcontrollers,
                sensors, motors, power and instruments on the shelves.{" "}
                <span className="text-ink">{available.length} of them are available right now.</span>{" "}
                Drone builds, aircraft builds and {projects.length} mentor-led projects run out of
                this room.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/login" className="btn">
                  Join with your IITJ email
                </Link>
                <Link href="/inventory" className="btn-ghost">
                  See what is on the shelves
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted">
                One code to your institute address. No password to remember.
              </p>
            </Reveal>
          </div>
          <Reveal delay={380}>
            <DeviceMock items={mockItems} available={available.length} total={items.length} />
          </Reveal>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className={cn(container, "py-24 sm:py-32")}>
        <div className="max-w-4xl">
          <Chip>About</Chip>
          <div className="mt-10">
            <IntroText
              paragraphs={[
                "The Anand Rathi Tinkerers' Lab is the innovation hub and maker space at IIT Jodhpur, supported by the Maker Bhavan Foundation and Anand Rathi.",
                "It exists to close the gap between what is taught and what gets built: facilities, mentorship and room to turn an idea into something that works.",
                "It opened in its new space on 15 October 2025. If you study at IIT Jodhpur, sign in with your institute email and see what is on the shelves.",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============ INSIDE ============ */}
      <section id="inside" className={cn(container, "scroll-mt-20 py-24")}>
        <Reveal>
          <SectionHead
            chip="Inside the lab"
            a="Machines, builds"
            b="and the people using them."
            aside="Laser cutting, CNC machining, aircraft and drone builds, and the sessions that bring students in. All photographed in the lab."
          />
        </Reveal>
        <Reveal>
          <Stage slides={SLIDES} />
        </Reveal>
      </section>

      {/* ============ WHAT YOU'LL FIND ============ */}
      <section className={cn(container, "py-24")}>
        <Reveal>
          <SectionHead
            chip="What you'll find"
            a="Start with a look."
            b="Stay to build."
            aside="Everything below is live: pulled from the same database the coordinators update."
          />
        </Reveal>
        <div className="space-y-6">
          <Reveal>
            <DeckPanel
              label="Equipment"
              title="Tools you can actually use."
              body="Microcontrollers, sensors, motors, power and instruments. The inventory shows what is on the shelf right now."
              foot={
                <Link href="/inventory" className="link">
                  {available.length} of {items.length} items available today
                </Link>
              }
              image="/images/lab/lab-02.webp"
              alt="Inside the laser cutter, with a student pointing at the laser tube."
            />
          </Reveal>
          <Reveal>
            <DeckPanel
              flip
              label="Events"
              title="Two on campus, one worth travelling for."
              body={
                featuredEvents.length
                  ? `${featuredEvents.map((e) => e.title).join(", ")}. Each has a page with the detail on what it is and how to take part.`
                  : "Events appear here as they are published."
              }
              foot={
                <Link href="/events" className="link">
                  Read about all {events.length} of them
                </Link>
              }
              image="/images/lab/lab-14.webp"
              alt="The title slide of the Prometeo '26 introductory session."
            />
          </Reveal>
          <Reveal>
            <DeckPanel
              label="Projects"
              title="Built here, start to finish."
              body={
                sparkCount
                  ? `SPARK 26, the Robotics Society's summer programme, released ${sparkCount} briefs. Each one is written by a student mentor and built here across a full term.`
                  : "Projects from lab members appear here as they are published."
              }
              foot={
                <Link href="/projects" className="link">
                  {projects.length} projects published
                </Link>
              }
              image="/images/lab/lab-05.webp"
              alt="A foam-board aircraft being assembled on the floor."
            />
          </Reveal>
          <Reveal>
            <DeckPanel
              flip
              label="People"
              title="Run by students."
              body="A student team coordinates the lab, its equipment and its events."
              foot={
                <Link href="/people" className="flex items-center gap-3">
                  <span className="flex -space-x-2" aria-hidden>
                    {team
                      .filter((m) => m.photo_url)
                      .slice(0, 4)
                      .map((m) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={m.id}
                          src={m.photo_url!}
                          alt=""
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover ring-2 ring-panel"
                        />
                      ))}
                  </span>
                  <span className="link">{team.length} people on the team</span>
                </Link>
              }
              image="/images/lab/lab-09.webp"
              imagePosition="object-bottom"
              alt="Students seated with laptops during a session in the lab."
            />
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className={cn(container, "py-24")}>
        <Reveal>
          <SectionHead
            chip="FAQ"
            a="Answers to the questions"
            b="that come up most."
            aside="Who the lab is for, how accounts work, and what the equipment page tells you."
          />
        </Reveal>
        <Reveal>
          <Faq groups={FAQ} contactEmail={CONTACT_EMAIL} />
        </Reveal>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative isolate mt-12 overflow-hidden border-t border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lab/lab-08.webp"
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.55] lg:opacity-40"
        />
        <div aria-hidden className="cta-veil absolute inset-0 -z-10" />
        <div className={cn(container, "py-28 sm:py-36")}>
          <Reveal>
            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Build something
              <br />
              <span className="text-muted">at ARTL.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Sign in with your IIT Jodhpur email to get started. It takes a one-time code, nothing else.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="btn">
                Join with your IITJ email
              </Link>
              <Link href="/events" className="btn-ghost">
                What&apos;s on
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
