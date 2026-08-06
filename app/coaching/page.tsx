import Image from "next/image";
import Link from "next/link";

/**
 * Coaching page for Hyrox Human.
 * Same visual system as the landing page: Carbon page, Carbon-2 cards, --line
 * borders, Steel for muted copy, Bone for primary text. Ignite is reserved for
 * the book-a-call buttons and a single headline word. Frost is numbers only.
 *
 * NOTE: hero subhead, card copy and FAQ text below are placeholders standing in
 * for the real copy — matched to meaning, not final wording.
 */

const BOOKING_URL = "https://calendar.app.google/Lp7pJNU8N9ZZtisYA";

const EYEBROW = "font-data text-[11px] uppercase tracking-[0.28em]";

const AUDIENCE = [
  {
    title: "Your first race",
    body: "You've signed up, the date is real, and you'd rather not find out on the floor that you can't hold the sled. We build the base and rehearse the stations.",
  },
  {
    title: "Chasing a time",
    body: "You've finished one and the number stuck with you. We work backwards from the target split by split and find where the minutes actually live.",
  },
  {
    title: "Training hard, stuck",
    body: "The volume is there and the finish time isn't moving. Usually that's one station quietly taxing everything after it — we find it and fix it.",
  },
  {
    title: "Back for a PB",
    body: "You know the format and your own patterns. We sharpen the compromised running and the transitions, which is where experienced athletes leak most.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Take the quiz",
    body: (
      <>
        Two minutes of honest inputs gives us a predicted finish range and a
        read-out on all eight stations. Start with the{" "}
        <Link
          href="/quiz"
          className="text-bone underline decoration-line underline-offset-4 transition hover:decoration-bone"
        >
          quiz
        </Link>
        .
      </>
    ),
  },
  {
    n: "02",
    title: "Book a call",
    body: "Fifteen minutes, no pitch deck. We walk through your splits, what you're training now, and whether coaching is even the right call for you.",
  },
  {
    n: "03",
    title: "Get your plan",
    body: "A block built off your own race data — the sessions, the loads, and the specific station we're targeting first, with the reasoning written out.",
  },
  {
    n: "04",
    title: "Execute",
    body: "You train, we adjust. Check-ins on the sessions that matter, recalibration when the numbers move, and a race-week plan that isn't guesswork.",
  },
];

const INCLUSIONS = [
  "A predicted finish range and percentile against your division and age group",
  "Station-by-station diagnosis, ranked by how much time each one is costing",
  "A weekly training block with sessions, loads and target splits",
  "Compromised-running work — the runs that actually decide your race",
  "Transition and station technique notes for your weakest three",
  "Recalibration as your numbers move, not a fixed twelve-week PDF",
  "Race-week taper, fuelling and pacing plan",
];

const FAQS = [
  {
    q: "Do I need a race booked?",
    a: "No. A date sharpens the plan and gives us something to work backwards from, but plenty of athletes start building before they commit to one.",
  },
  {
    q: "What if I don't know my station splits?",
    a: "That's normal and it's fine. The quiz estimates the ones you skip and widens your predicted range accordingly — we tighten it as real numbers come in.",
  },
  {
    q: "Do I need a gym with HYROX equipment?",
    a: "It helps, but it isn't required. We substitute where we have to and make sure the stations you can't rehearse get covered another way.",
  },
  {
    q: "How is this different from a template?",
    a: "A template doesn't know which station is bleeding your minutes. Everything here starts from your own splits, and the plan changes when they do.",
  },
];

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Nav />
      <Hero />
      <Audience />
      <HowItWorks />
      <PlanPanel />
      <Faq />
      <FinalBand />
      <Footer />
    </main>
  );
}

/* ---------------- Shared ---------------- */

/** External booking link — opens in a new tab. */
function BookButton({
  className = "",
  label = "Book a call →",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-lg bg-ignite font-display font-extrabold uppercase tracking-[0.04em] text-white transition hover:opacity-90 ${className}`}
    >
      {label}
    </a>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className={`${EYEBROW} text-ignite`}>{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 font-display text-[clamp(28px,4.4vw,46px)] leading-[0.98] font-black tracking-[-0.01em] uppercase text-bone">
      {children}
    </h2>
  );
}

/* ---------------- Nav ---------------- */

function Nav() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:gap-6 sm:py-6">
        <Link href="/" aria-label="Hyrox Human — home" className="shrink-0">
          <Image
            src="/logos/svg/03-lockup-ondark.svg"
            alt="Hyrox Human"
            width={117}
            height={44}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>
        {/* Tighter padding on mobile so the larger logo and the button never
            collide at 375px — the logo keeps its size, the button gives. */}
        <BookButton className="shrink-0 px-3 py-2.5 text-[11px] whitespace-nowrap sm:px-4 sm:text-xs" />
      </nav>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
      <p className={`${EYEBROW} text-ignite`}>HYROX Coaching</p>
      <h1 className="mt-6 font-display text-[clamp(38px,8.5vw,86px)] leading-[0.88] font-black tracking-[-0.02em] uppercase text-bone">
        Coaching built off{" "}
        <span className="text-ignite">your splits.</span>
      </h1>
      <p className="mt-7 max-w-[54ch] text-base text-bone/80 sm:text-lg">
        We start from your real race data, not a generic template. The plan
        targets the station bleeding your minutes first, because that's where
        the finish time actually moves.
      </p>
      <BookButton className="mt-9 px-6 py-4 text-sm" />
    </section>
  );
}

/* ---------------- Who this is for ---------------- */

function Audience() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:pb-24">
      <SectionKicker>Who this is for</SectionKicker>
      <SectionTitle>Four athletes, one problem</SectionTitle>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCE.map((a) => (
          <div
            key={a.title}
            className="rounded-xl border border-line bg-carbon-2 p-6"
          >
            <h3 className="font-display text-base font-extrabold uppercase tracking-[0.01em] text-bone">
              {a.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:pb-24">
      <SectionKicker>How it works</SectionKicker>
      <SectionTitle>From a number to a plan</SectionTitle>

      <ol className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4">
        {STEPS.map((s) => (
          <li key={s.n} className="border-t border-line pt-6">
            <div className={`${EYEBROW} text-steel`}>{s.n}</div>
            <h3 className="mt-3 font-display text-base font-extrabold uppercase tracking-[0.01em] text-bone">
              {s.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-steel">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- What's in the plan ---------------- */

function PlanPanel() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:pb-24">
      <SectionKicker>What&apos;s in the plan</SectionKicker>
      <SectionTitle>Everything you get</SectionTitle>

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-[1.6fr_1fr]">
        <div className="bg-carbon-2 p-7 sm:p-9">
          <ul className="space-y-4">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex gap-3.5 text-sm text-bone/85">
                <span aria-hidden="true" className="mt-px text-steel">
                  ·
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center bg-carbon-2 p-7 sm:p-9">
          <div className={`${EYEBROW} text-steel`}>Start here</div>
          <div className="mt-3 font-display text-2xl leading-tight font-black uppercase text-bone">
            Free <span className="font-data text-frost">15</span>-min call
          </div>
          <p className="mt-3 text-sm leading-relaxed text-steel">
            No pitch, no commitment. We look at your splits together and tell
            you straight whether coaching is worth it for you.
          </p>
          <BookButton className="mt-7 justify-center px-5 py-3.5 text-sm" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function Faq() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:pb-24">
      <SectionKicker>FAQ</SectionKicker>
      <SectionTitle>The usual questions</SectionTitle>

      <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
        {FAQS.map((f) => (
          <div key={f.q} className="border-t border-line pt-6">
            <dt className="font-display text-base font-extrabold uppercase tracking-[0.01em] text-bone">
              {f.q}
            </dt>
            <dd className="mt-2.5 text-sm leading-relaxed text-steel">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------------- Final band ---------------- */

function FinalBand() {
  return (
    <section className="bg-bone text-carbon">
      <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:py-24">
        <h2 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.92] font-black tracking-[-0.01em] uppercase">
          Real athletes.
          <br />
          <span className="text-ignite">Real splits.</span>
        </h2>
        <p className="mt-6 max-w-[56ch] text-base text-carbon/70 sm:text-lg">
          Fifteen minutes on a call is enough to know whether this is the right
          move for your race. Bring your splits and we&apos;ll be honest with
          you.
        </p>
        <BookButton className="mt-9 px-6 py-4 text-sm" />
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="border-t border-line bg-carbon-2">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-10 font-data text-[11px] uppercase tracking-[0.16em] text-steel sm:flex-row sm:items-center sm:justify-between">
        <span>Hyrox Human</span>
        <span>@hyroxhuman</span>
      </div>
    </footer>
  );
}
