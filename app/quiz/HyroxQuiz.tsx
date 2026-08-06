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
import { predict, toClock, type AthleteProfile, type Prediction } from "./scoring";

const AGE_BRACKETS: AgeBracket[] = [
  "16-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60+",
];

type StationEntry = { known: boolean; value: string };

const YELLOW = "#D7F205"; // signal-lime accent; swap for your @hyroxhuman brand color

export default function HyroxQuiz() {
  const [step, setStep] = useState(0);
  const [division, setDivision] = useState<Division>("Open");
  const [gender, setGender] = useState<Gender>("Men");
  const [age, setAge] = useState<AgeBracket>("30-34");
  const [pace, setPace] = useState("");
  const [stations, setStations] = useState<Record<StationKey, StationEntry>>(
    () =>
      STATION_ORDER.reduce((acc, k) => {
        acc[k] = { known: false, value: "" };
        return acc;
      }, {} as Record<StationKey, StationEntry>),
  );
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const prediction = predict(profile, {
        avgRunPacePerKm: pace.trim() || undefined,
        stations: stationInput,
      });
      setResult(prediction);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check your time formats (use M:SS, e.g. 4:20).");
    }
  }

  function restart() {
    setResult(null);
    setStep(0);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-10 text-neutral-100">
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
                  className={`rounded-md border px-2 py-2 font-mono text-sm transition ${
                    age === a
                      ? "border-transparent bg-[var(--acc)] text-black"
                      : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  }`}
                  style={{ ["--acc" as string]: YELLOW }}
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
          <p className="mb-4 text-sm text-neutral-400">
            Your average per-kilometre pace across the 8 race runs, under fatigue,
            not a fresh 5K. Format M:SS.
          </p>
          <Field label="Average run pace (per km)">
            <input
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              placeholder="4:20"
              inputMode="numeric"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-3 font-mono text-lg text-neutral-100 outline-none focus:border-[var(--acc)]"
              style={{ ["--acc" as string]: YELLOW }}
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
          <p className="mb-4 text-sm text-neutral-400">
            Toggle on the stations you know and enter your split. Skip the rest,
            we estimate those and widen your range.
          </p>
          <div className="space-y-2">
            {STATION_ORDER.map((k) => {
              const load = STATION_LOADS[division][gender][k];
              const s = stations[k];
              return (
                <div
                  key={k}
                  className="flex items-center gap-3 rounded-md border border-neutral-800 px-3 py-2"
                >
                  <button
                    onClick={() => updateStation(k, { known: !s.known })}
                    aria-pressed={s.known}
                    className={`h-5 w-5 shrink-0 rounded border transition ${
                      s.known
                        ? "border-transparent bg-[var(--acc)]"
                        : "border-neutral-600"
                    }`}
                    style={{ ["--acc" as string]: YELLOW }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-neutral-200">
                      {STATION_LABELS[k]}
                    </div>
                    {load && (
                      <div className="font-mono text-xs text-neutral-500">{load} kg</div>
                    )}
                  </div>
                  <input
                    value={s.value}
                    onChange={(e) => updateStation(k, { value: e.target.value, known: true })}
                    placeholder="M:SS"
                    inputMode="numeric"
                    className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-center font-mono text-sm text-neutral-100 outline-none focus:border-[var(--acc)] disabled:opacity-30"
                    style={{ ["--acc" as string]: YELLOW }}
                    disabled={!s.known}
                  />
                </div>
              );
            })}
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-5 flex gap-3">
            <Back onClick={() => setStep(1)} />
            <Next onClick={run} label="Predict my race time" />
          </div>
        </Card>
      )}

      {step === 3 && result && (
        <Result result={result} onRestart={restart} />
      )}
    </div>
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
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Predicted finish
        </div>
        <div
          className="font-mono text-4xl font-bold"
          style={{ color: YELLOW }}
        >
          {lo} – {hi}
        </div>
        <div className="mt-1 text-sm text-neutral-400">
          Midpoint {result.predictedClock} · {result.percentile}th percentile ·{" "}
          <span className="text-neutral-200">{result.level}</span> in your division
          and age group
        </div>
      </div>

      {leak && (
        <div className="mb-6 rounded-md border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            Biggest time leak
          </div>
          <div className="mt-1 text-lg text-neutral-100">{leak.label}</div>
          <div className="font-mono text-sm text-neutral-400">
            +{Math.round(leak.deviationSeconds)}s slower than the Strong band
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          Station read-out
        </div>
        <div className="space-y-1">
          {result.stationDiagnostics.map((d) => (
            <div key={d.key} className="flex items-center justify-between font-mono text-sm">
              <span className="text-neutral-300">
                {STATION_LABELS[d.key]}
                {d.estimated && <span className="text-neutral-600"> (est.)</span>}
              </span>
              <span className={d.atOrBetterThanStrong ? "text-[color:var(--good)]" : "text-neutral-400"} style={{ ["--good" as string]: YELLOW }}>
                {toClock(d.splitSeconds)}{" "}
                {d.atOrBetterThanStrong ? "✓" : `+${Math.round(d.deviationSeconds)}s`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* $250 coaching upsell */}
      <a
        href="#coaching"
        className="block rounded-md px-4 py-3 text-center font-semibold text-black"
        style={{ backgroundColor: YELLOW }}
      >
        Fix {leak ? leak.label.split(" (")[0] : "your weak link"} → get my plan
      </a>
      <button
        onClick={onRestart}
        className="mt-3 w-full text-center text-sm text-neutral-500 hover:text-neutral-300"
      >
        Start over
      </button>

      {result.notes.length > 0 && (
        <ul className="mt-4 space-y-1 text-xs text-neutral-600">
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
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-500">
        Hyrox Human
      </span>
      <span className="font-mono text-xs text-neutral-600">
        {step < 3 ? `${step + 1} / 3` : "result"}
      </span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      {children}
    </div>
  );
}

function Legend({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-mono text-sm text-neutral-600">{n}</span>
      <h2 className="text-lg font-semibold tracking-tight text-neutral-100">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">{label}</div>
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
              ? "border-transparent bg-[var(--acc)] text-black"
              : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
          }`}
          style={{ ["--acc" as string]: YELLOW }}
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
      className="mt-2 flex-1 rounded-md px-4 py-3 text-center font-semibold text-black"
      style={{ backgroundColor: YELLOW }}
    >
      {label}
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 rounded-md border border-neutral-700 px-4 py-3 text-sm text-neutral-300 hover:border-neutral-500"
    >
      Back
    </button>
  );
}
