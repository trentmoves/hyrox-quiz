import Image from "next/image";
import Link from "next/link";

/**
 * Landing page for Hyrox Human.
 * Brand rules (see brand-system.html): Carbon page, Carbon-2 cards, --line
 * borders, Steel for muted copy, Bone for primary text. Ignite is the one loud
 * accent per screen (the hero CTA). Frost is reserved for numbers only, and
 * every number is set in Space Mono.
 */

const NAV_LINKS = [
  { label: "The Method", href: "#how-it-works" },
  { label: "Coaching", href: "/coaching" },
  { label: "The Quiz", href: "/quiz" },
];

const STEPS = [
  {
    n: "01",
    title: "Take the quiz",
    body: "Your background, your running pace, your race date. Two minutes, no signup. You don't need to know a single station time yet.",
  },
  {
    n: "02",
    title: "Get your number",
    body: "A projected finish modeled against thousands of real races, plus the stations most likely to cost you time.",
  },
  {
    n: "03",
    title: "Measure & train",
    body: "We measure your real station times in one session, then a coach builds a plan around your baseline and race date, training you to save seconds at each station and run strong on tired legs.",
  },
];

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Nav />
      <Hero />
      <ChipRow />
      <PulseDivider />
      <HowItWorks />
      <CoachingBand />
      <Footer />
    </main>
  );
}

/* ---------------- Nav ---------------- */

function Nav() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:gap-6 sm:py-6">
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
        {/* Nav labels drop off on narrow screens — the CTA carries the flow there. */}
        <ul className="hidden items-center gap-7 sm:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="font-data text-[11px] uppercase tracking-[0.2em] text-steel transition hover:text-bone"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-16 pb-12 sm:pt-24 sm:pb-16">
      <p className="font-data text-[11px] uppercase tracking-[0.28em] text-ignite">
        Faster on tired legs
      </p>
      <h1 className="mt-6 font-display text-[clamp(46px,11vw,112px)] leading-[0.86] font-black tracking-[-0.02em] uppercase text-bone">
        Human coaching,
        <br />
        <span className="text-ignite">engineered by data.</span>
      </h1>
      <p className="mt-7 max-w-[52ch] text-base text-bone/80 sm:text-lg">
        Whether it&apos;s your first HYROX or your next PR, the race is won on
        tired legs. We measure where you stand today, model your finish against
        thousands of real races, and build a plan around one thing a template
        can&apos;t: saving time at the stations so you can still run when your
        legs are shot.
      </p>
      <Link
        href="/quiz"
        className="mt-9 inline-flex items-center gap-2.5 rounded-lg bg-ignite px-6 py-4 font-display text-sm font-extrabold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
      >
        Predict my finish →
      </Link>
    </section>
  );
}

/* ---------------- Data chip teaser ---------------- */

function ChipRow() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-14">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Chip label="Projected" value="1:24:10" tone="frost" />
        <Chip label="Baseline" value="Measured in one session" tone="ignite" />
        <Chip label="Your week" value="5 focused hours" tone="frost" />
      </div>
    </section>
  );
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "frost" | "bone" | "ignite";
}) {
  const toneClass = {
    frost: "text-frost",
    bone: "text-bone",
    ignite: "text-ignite",
  }[tone];

  return (
    <div className="rounded-xl border border-line bg-carbon-2 px-5 py-4">
      <div className="font-data text-[10px] uppercase tracking-[0.2em] text-steel">
        {label}
      </div>
      <div className={`mt-1.5 font-data text-2xl font-bold ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

/* ---------------- Pulse divider ---------------- */

function PulseDivider() {
  return (
    <svg
      className="block h-8 w-full"
      viewBox="0 0 1000 34"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* The dim resting trace sits under the travelling sweep. */}
      <polyline
        points="0,17 380,17 410,17 430,4 455,30 478,9 500,17 620,17 640,17 660,24 680,17 1000,17"
        pathLength={100}
        fill="none"
        stroke="var(--ignite)"
        strokeOpacity="0.22"
        strokeWidth="2.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        className="pulse-sweep"
        points="0,17 380,17 410,17 430,4 455,30 478,9 500,17 620,17 640,17 660,24 680,17 1000,17"
        pathLength={100}
        fill="none"
        stroke="var(--ignite)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-5xl px-5 py-20 sm:py-24"
    >
      <p className="font-data text-[11px] uppercase tracking-[0.28em] text-ignite">
        How it works
      </p>
      <h2 className="mt-4 font-display text-[clamp(28px,4.4vw,46px)] leading-[0.98] font-black tracking-[-0.01em] uppercase text-bone">
        Three steps to an honest number
      </h2>

      <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-7">
        {STEPS.map((s) => (
          <li key={s.n} className="border-t border-line pt-6">
            <div className="font-data text-[11px] uppercase tracking-[0.28em] text-steel">
              {s.n}
            </div>
            <h3 className="mt-3 font-display text-lg font-extrabold uppercase tracking-[0.01em] text-bone">
              {s.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-steel">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Coaching band ---------------- */

function CoachingBand() {
  return (
    <section className="bg-bone text-carbon">
      <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:py-24">
        <h2 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.92] font-black tracking-[-0.01em] uppercase">
          Measured for you.
          <br />
          <span className="text-ignite">Coached by a human.</span>
        </h2>
        <p className="mt-6 max-w-[56ch] text-base text-carbon/70 sm:text-lg">
          HYROX isn&apos;t a run and it isn&apos;t a lift, it&apos;s running on
          legs the stations just wrecked. That&apos;s the skill most plans
          ignore. We measure where you are today, model it against thousands of
          finishes, and a real coach builds a week that trains you to move fast
          through the stations and hold your pace on compromised legs, so you
          arrive dialed in instead of hoping.
        </p>
        <Link
          href="/coaching"
          className="mt-9 inline-flex items-center gap-2.5 rounded-lg border-2 border-carbon px-6 py-4 font-display text-sm font-extrabold uppercase tracking-[0.04em] text-carbon transition hover:bg-carbon hover:text-bone"
        >
          See the plan
        </Link>
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
