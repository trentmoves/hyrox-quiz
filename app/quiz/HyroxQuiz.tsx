"use client";

/**
 * HyroxQuiz.tsx
 * -------------
 * First-draft quiz UI for Hyrox Human, wired to the scoring engine.
 * Drop into your Next.js app (e.g. app/quiz/HyroxQuiz.tsx) and render it
 * from a page. Uses only Tailwind utility classes, no extra deps beyond
 * ./hyroxBenchmarks and ./scoring (adjust the import paths to your repo).
 *
 * Flow: profile -> run pace -> stations you know -> result + diagnosis + CTA.
 * Users skip stations they don't know; the engine estimates those and widens
 * the predicted range. The result leads with the biggest time leak, since
 * that's the part that sells the coaching plan.
 *
 * Styling follows the brand system in brand-system.html:
 * Ignite for buttons and selected states only, Frost + Space Mono for every
 * number, Carbon-2 cards on a Carbon page, Steel for muted labels, Bone for
 * primary text, Archivo 900 uppercase for headings and the wordmark.
 */

import { useState } from "react";
import {
  STATION_ORDER,
  STATION_LABELS,
  STATION_LOADS,
  type StationKey,
  type Division,
  type Gender,
  type AgeBracket,
} from "./hyroxBenchmarks";
import {
  predict,
  toClock,
  toSeconds,
  type AthleteProfile,
  type Prediction,
} from "./scoring";

const AGE_BRACKETS: AgeBracket[] = [
  "16-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60+",
];

type StationEntry = { known: boolean; value: string };

/** The engine works in per-km pace; US athletes think in per-mile. */
const PACE_UNITS = ["min/mi", "min/km"] as const;
type PaceUnit = (typeof PACE_UNITS)[number];

const KM_PER_MILE = 1.60934;

/** Space Mono, uppercase, wide tracking — the eyebrow/utility label treatment. */
const EYEBROW = "font-data text-[11px] uppercase tracking-[0.28em] text-steel";

/** Apps Script webhook that records the lead and sends the race-prep guide. */
const LEAD_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbz5HpFuA5YqR8yoPdLgDvZfVWYvxAFXsCUwAm8_KZVveNHfDhNBcO9vk4FPgi067AfQfA/exec";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shared input treatment — Carbon field, --line border, Frost mono value. */
const INPUT_CLASS =
  "w-full rounded-md border border-line bg-carbon px-3 py-3 font-data text-base text-frost outline-none transition placeholder:text-steel focus:border-ignite";

export default function HyroxQuiz() {
  const [step, setStep] = useState(0);
  const [division, setDivision] = useState<Division>("Open");
  const [gender, setGender] = useState<Gender>("Men");
  const [age, setAge] = useState<AgeBracket>("30-34");
  const [pace, setPace] = useState("");
  const [paceUnit, setPaceUnit] = useState<PaceUnit>("min/mi");
  const [stations, setStations] = useState<Record<StationKey, StationEntry>>(
    () =>
      STATION_ORDER.reduce((acc, k) => {
        acc[k] = { known: false, value: "" };
        return acc;
      }, {} as Record<StationKey, StationEntry>),
  );
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  function updateStation(key: StationKey, patch: Partial<StationEntry>) {
    setStations((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  }

  function run() {
    setError(null);
    try {
      const profile: AthleteProfile = { division, gender, age };
      const stationInput: Partial<Record<StationKey, string>> = {};
      for (const k of STATION_ORDER) {
        if (stations[k].known && stations[k].value.trim()) {
          stationInput[k] = stations[k].value.trim();
        }
      }
      // The engine only speaks per-km, so a per-mile entry converts first.
      const trimmedPace = pace.trim();
      let avgRunPacePerKm: string | undefined;
      if (trimmedPace) {
        avgRunPacePerKm =
          paceUnit === "min/mi"
            ? toClock(toSeconds(trimmedPace) / KM_PER_MILE)
            : trimmedPace;
      }

      const prediction = predict(profile, {
        avgRunPacePerKm,
        stations: stationInput,
      });
      setResult(prediction);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check your time formats (use M:SS, e.g. 4:20).");
    }
  }

  /**
   * Gate submit: validate, fire the lead POST, then show the result.
   * The request is deliberately not awaited — an opaque no-cors response tells
   * us nothing anyway, so making the athlete wait on it buys us nothing.
   */
  function submitLead() {
    if (!result) return;

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);

    const payload = {
      email: trimmedEmail,
      firstName: firstName.trim(),
      division,
      gender,
      age,
      predicted: result.predictedClock,
      range: result.predictedRangeClock.join("–"),
      percentile: String(result.percentile),
      level: result.level,
      weakest: result.weakestStations[0]?.label ?? "none",
      stations: result.stationDiagnostics
        .map((d) => `${STATION_LABELS[d.key]} ${toClock(d.splitSeconds)}`)
        .join(", "),
    };

    void fetch(LEAD_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Nothing useful to surface — the athlete still gets their result.
    });

    setStep(4);
  }

  function restart() {
    setResult(null);
    setEmailError(null);
    setStep(0);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-10 text-bone">
      <Header step={step} />

      {step === 0 && (
        <Card>
          <Legend n="01" title="Who's racing" />
          <Field label="Division">
            <Segmented
              options={["Open", "Pro"]}
              value={division}
              onChange={(v) => setDivision(v as Division)}
            />
          </Field>
          <Field label="Category">
            <Segmented
              options={["Men", "Women"]}
              value={gender}
              onChange={(v) => setGender(v as Gender)}
            />
          </Field>
          <Field label="Age group">
            <div className="grid grid-cols-3 gap-2">
              {AGE_BRACKETS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(a)}
                  className={`rounded-md border px-2 py-2 font-data text-sm transition ${
                    age === a
                      ? "border-transparent bg-ignite text-white"
                      : "border-line text-steel hover:border-bone/30 hover:text-bone"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Field>
          <Next onClick={() => setStep(1)} label="Next: your running" />
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Legend n="02" title="Run pace" />
          <p className="mb-4 text-sm text-steel">
            Your average pace across the 8 race runs, under fatigue — not a
            fresh 5K. Don&apos;t know it? Use your recent 5K pace plus 15–30
            seconds per mile.
          </p>
          <Field label="Units">
            <Segmented
              options={[...PACE_UNITS]}
              value={paceUnit}
              onChange={(v) => setPaceUnit(v as PaceUnit)}
            />
          </Field>
          <Field label={`Average run pace (${paceUnit})`}>
            <input
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              placeholder={paceUnit === "min/mi" ? "7:00" : "4:20"}
              inputMode="numeric"
              className="w-full rounded-md border border-line bg-carbon px-3 py-3 font-data text-lg text-frost outline-none transition placeholder:text-steel focus:border-ignite"
            />
          </Field>
          <div className="flex gap-3">
            <Back onClick={() => setStep(0)} />
            <Next onClick={() => setStep(2)} label="Next: your stations" />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Legend n="03" title="Station splits" />
          <p className="mb-4 text-sm text-steel">
            Know a split? Toggle it on and enter it. New to HYROX? Skip them all
            — we&apos;ll estimate from athletes at your level and your range
            widens to match.
          </p>
          <div className="space-y-2">
            {STATION_ORDER.map((k) => {
              const load = STATION_LOADS[division][gender][k];
              const s = stations[k];
              return (
                <div
                  key={k}
                  className="flex items-center gap-3 rounded-md border border-line px-3 py-2"
                >
                  <button
                    onClick={() => updateStation(k, { known: !s.known })}
                    aria-pressed={s.known}
                    className={`h-5 w-5 shrink-0 rounded border transition ${
                      s.known ? "border-transparent bg-ignite" : "border-steel"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-bone">
                      {STATION_LABELS[k]}
                    </div>
                    {load && (
                      <div className="font-data text-xs text-frost">{load} kg</div>
                    )}
                  </div>
                  <input
                    value={s.value}
                    onChange={(e) => updateStation(k, { value: e.target.value, known: true })}
                    placeholder="M:SS"
                    inputMode="numeric"
                    className="w-20 rounded border border-line bg-carbon px-2 py-1.5 text-center font-data text-sm text-frost outline-none transition placeholder:text-steel focus:border-ignite disabled:opacity-30"
                    disabled={!s.known}
                  />
                </div>
              );
            })}
          </div>
          {error && <p className="mt-3 text-sm text-ignite">{error}</p>}
          <div className="mt-5 flex gap-3">
            <Back onClick={() => setStep(1)} />
            <Next onClick={run} label="Predict my race time" />
          </div>
        </Card>
      )}

      {step === 3 && result && (
        <EmailGate
          email={email}
          firstName={firstName}
          error={emailError}
          onEmailChange={setEmail}
          onFirstNameChange={setFirstName}
          onSubmit={submitLead}
        />
      )}

      {step === 4 && result && (
        <Result result={result} onRestart={restart} />
      )}
    </div>
  );
}

/* ---------------- Email gate ---------------- */

function EmailGate({
  email,
  firstName,
  error,
  onEmailChange,
  onFirstNameChange,
  onSubmit,
}: {
  email: string;
  firstName: string;
  error: string | null;
  onEmailChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <h2 className="font-display text-xl font-black uppercase tracking-[-0.01em] text-bone">
        Your projection is ready
      </h2>
      <p className="mt-3 text-sm text-steel">
        Enter your email and I&apos;ll send it with your free race-prep guide.
      </p>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-5">
          <label htmlFor="lead-email" className={`${EYEBROW} mb-2 block`}>
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "lead-email-error" : undefined}
            className={INPUT_CLASS}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="lead-first-name" className={`${EYEBROW} mb-2 block`}>
            First name (optional)
          </label>
          <input
            id="lead-first-name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Trent"
            autoComplete="given-name"
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p id="lead-email-error" className="mb-4 text-sm text-ignite">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-ignite px-4 py-3.5 text-center font-display text-sm font-extrabold uppercase tracking-[0.04em] text-white"
        >
          Show my result →
        </button>
      </form>
    </Card>
  );
}

/* ---------------- Result screen ---------------- */

function Result({ result, onRestart }: { result: Prediction; onRestart: () => void }) {
  const [lo, hi] = result.predictedRangeClock;
  const leak = result.weakestStations[0];
  return (
    <Card>
      <Legend n="→" title="Your projected race" />

      <div className="mb-6">
        <div className={EYEBROW}>Predicted finish</div>
        <div className="mt-2 font-data text-4xl font-bold text-frost">
          {lo} – {hi}
        </div>
        <div className="mt-2 text-sm text-steel">
          Midpoint <span className="font-data text-frost">{result.predictedClock}</span> ·{" "}
          <span className="font-data text-frost">{result.percentile}th</span> percentile ·{" "}
          <span className="text-bone">{result.level}</span> in your division
          and age group
        </div>
      </div>

      {leak && (
        <div className="mb-6 rounded-md border border-line bg-carbon p-4">
          <div className={EYEBROW}>Biggest time leak</div>
          <div className="mt-2 text-lg text-bone">{leak.label}</div>
          <div className="font-data text-sm text-frost">
            +{Math.round(leak.deviationSeconds)}s slower than the Strong band
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className={`${EYEBROW} mb-2`}>Station read-out</div>
        <div className="space-y-1">
          {result.stationDiagnostics.map((d) => (
            <div key={d.key} className="flex items-center justify-between text-sm">
              <span className="text-bone">
                {STATION_LABELS[d.key]}
                {d.estimated && <span className="text-steel"> (est.)</span>}
              </span>
              <span className="font-data text-frost">
                {toClock(d.splitSeconds)}{" "}
                {d.atOrBetterThanStrong ? "✓" : `+${Math.round(d.deviationSeconds)}s`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="block w-full rounded-lg bg-ignite px-4 py-4 text-center font-display text-sm font-extrabold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
      >
        Start over
      </button>

      {result.notes.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs text-steel">
          {result.notes.map((n, i) => (
            <li key={i}>· {n}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ---------------- Small UI primitives ---------------- */

function Header({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <span className="font-display text-xl font-black uppercase tracking-[-0.01em] text-bone">
        Hyrox Human
      </span>
      <span className="font-data text-xs uppercase tracking-[0.28em] text-steel">
        {step < 3 ? `${step + 1} / 3` : step === 3 ? "almost there" : "result"}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-carbon-2 p-6">
      {children}
    </div>
  );
}

function Legend({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-data text-xs uppercase tracking-[0.28em] text-steel">{n}</span>
      <h2 className="font-display text-lg font-black uppercase tracking-[-0.01em] text-bone">
        {title}
      </h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className={`${EYEBROW} mb-2`}>{label}</div>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex-1 rounded-md border px-3 py-2 text-sm transition ${
            value === o
              ? "border-transparent bg-ignite font-semibold text-white"
              : "border-line text-steel hover:border-bone/30 hover:text-bone"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Next({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 flex-1 rounded-lg bg-ignite px-4 py-3.5 text-center font-display text-sm font-extrabold uppercase tracking-[0.04em] text-white"
    >
      {label}
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 rounded-lg border border-line px-4 py-3.5 font-display text-sm font-extrabold uppercase tracking-[0.04em] text-bone transition hover:border-bone/30"
    >
      Back
    </button>
  );
}
