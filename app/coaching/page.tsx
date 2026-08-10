import Image from "next/image";
import Link from "next/link";

/**
 * Coaching page for Hyrox Human.
 * Same visual system as the landing page: Carbon page, Carbon-2 cards, --line
 * borders, Steel for muted copy, Bone for primary text. Ignite is reserved for
 * the book-a-call buttons and a single headline word. Frost is numbers only.
 */

const BOOKING_URL = "https://calendar.app.google/Lp7pJNU8N9ZZtisYA";

const EYEBROW = "font-data text-[11px] uppercase tracking-[0.28em]";

const AUDIENCE = [
  {
    title: "Your first HYROX",
    body: "You signed up, now you need a map. We measure where you are and build the block that gets you to the line ready, not guessing.",
  },
  {
    title: "Runners crossing over",
    body: "Marathon and trail legs get you far. The stations are a different test. We build the strength and transitions your engine's missing.",
  },
  {
    title: "Chasing a PR",
    body: "You've raced before and want faster. We find the stations quietly costing you minutes and rebuild your training around them.",
  },
  {
    title: "Stuck self-coaching",
    body: "Training hard and plateaued. A coach reading your real splits sees the leak you can't, and fixes the week around it.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Book the call",
    body: "A free 15-minute Race Time Review. Bring your quiz projection or last result. We find your biggest time leak together.",
  },
  {
    n: "02",
    title: "Measure your baseline",
    body: "In one session we capture your real station times, so your plan starts from data, not a guess.",
  },
  {
    n: "03",
    title: "Train the gap",
    body: "A coach builds your week around your weakest stations, your race date, and running strong on tired legs, adjusting as you go.",
  },
];

const INCLUSIONS = [
  "A baseline session that measures your real station times",
  "A finish projection modeled against thousands of real races",
  "A training plan periodized to your race date",
  "Station work built around your biggest time leaks",
  "Compromised-run training so you hold pace on tired legs",
  "Roxzone and transition drills to stop bleeding time between stations",
  "A human coach who adjusts the plan as your numbers change",
];

const FAQS = [
  {
    q: "I've never done a HYROX. Too advanced for me?",
    a: "No. Most people I coach are training for their first. Measuring your baseline is how I meet you exactly where you are, then build from there.",
  },
  {
    q: "Do I need to know my station times first?",
    a: "Not at all. You'll know your run and your paces; the stations are new for most first-timers. We measure them together in the first session, and that's what the plan is built on.",
  },
  {
    q: "How is this different from a generic plan?",
    a: "A template gives everyone the same twelve weeks. Yours starts from your measured numbers and gets adjusted by a human as they change. If the row's your weak spot, your plan looks nothing like someone whose weak spot is the sled.",
  },
  {
    q: "What happens on the free call?",
    a: "Fifteen minutes to look at where your training stands and whether coaching makes sense. We talk through your biggest time leak and what's realistic for your next race. No pitch you sit through. If it's a fit, I'll walk you through the plan. If not, you'll leave with a clear next step.",
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
        {/* The 6:1 banner and the booking button can't both fit at 375px, so
            below md this header wears the square monogram instead. */}
        <Link href="/" aria-label="Hyrox Human — home" className="shrink-0">
          <Image
            src="/logos/svg/02-pulse-mark-ondark.svg"
            alt="Hyrox Human"
            width={101}
            height={105}
            className="h-9 w-auto md:hidden"
          />
          <Image
            src="/logo-banner.png"
            alt="Hyrox Human"
            width={3000}
            height={495}
            priority
            className="hidden h-11 w-auto md:block"
          />
        </Link>
        <BookButton className="shrink-0 px-3 py-2.5 text-[11px] whitespace-nowrap sm:px-4 sm:text-xs" />
      </nav>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
      <p className={`${EYEBROW} text-ignite`}>Coaching, not templates</p>
      <h1 className="mt-6 font-display text-[clamp(38px,8.5vw,86px)] leading-[0.88] font-black tracking-[-0.02em] uppercase text-bone">
        Trained to run
        <br />
        <span className="text-ignite">on wrecked legs.</span>
      </h1>
      <p className="mt-7 max-w-[54ch] text-base text-bone/80 sm:text-lg">
        Your quiz number told you where you stand. This is how we move it. We
        measure your real station times, model your finish against thousands of
        races, and a coach builds a week that saves seconds at every station and
        teaches your legs to keep running when they&apos;re cooked. First HYROX
        or your fifth, the plan starts from your numbers, not a template.
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
        <span>@hybridhercules</span>
      </div>
    </footer>
  );
}
