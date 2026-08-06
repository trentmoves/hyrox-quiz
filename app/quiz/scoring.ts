/**
 * scoring.ts
 * ----------
 * Pure functions for the Hyrox Human quiz v1. No I/O, no framework deps.
 * The engine never knows where the benchmark numbers came from, so when you
 * later swap hyroxBenchmarks.ts for real per-station distributions, nothing
 * here changes.
 *
 * The predictor is BOTTOM-UP: it sums the athlete's run + station + RoxZone
 * splits into a finish time, then places that finish against the published
 * percentile bands for their division/gender/age. It also computes each
 * station's deviation from the Strong band to surface the biggest time leak
 * (the method hyroxy.com documents for "find your weakest station").
 *
 * Output is a RANGE, not a point estimate. Coarse published bands can't
 * justify single-second precision, and a range reads as more credible while
 * quietly protecting you when someone races and comes in a few minutes off.
 */

import {
  Division, Gender, AgeBracket, StationKey,
  FINISH_BANDS, RUN_PACE_BANDS, ROXZONE_BANDS, STATION_STRONG,
  STATION_ORDER, STATION_LABELS, levelFromPercentile,
} from "./hyroxBenchmarks";

type StationStrongLike = Record<StationKey, [string, string]>;

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

/** Parse "H:MM:SS" or "M:SS" -> seconds. Whitespace tolerant. */
export function toSeconds(str: string): number {
  const parts = str.trim().split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) {
    throw new Error(`Bad time string: "${str}"`);
  }
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  throw new Error(`Bad time string: "${str}"`);
}

/** Format seconds -> "H:MM:SS" (>=1h) or "M:SS". */
export function toClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

function finishCutPoints(division: Division, gender: Gender, age: AgeBracket) {
  const table = FINISH_BANDS[division][gender];
  const row = table.find((r) => r.age === age) ?? table[table.length - 1];
  return {
    p90: toSeconds(row.p90),
    p75: toSeconds(row.p75),
    p50: toSeconds(row.p50),
    p25: toSeconds(row.p25),
  };
}

function midOfBand([a, b]: [string, string]): number {
  return (toSeconds(a) + toSeconds(b)) / 2;
}

/* ------------------------------------------------------------------ */
/* Percentile from a finish time                                       */
/* ------------------------------------------------------------------ */

/**
 * Linearly interpolate a percentile (0-99) from a finish time, using the four
 * published band boundaries as anchors. Faster time => higher percentile.
 * Anchors: p90->90th, p75->75th, p50->50th, p25->25th (in seconds).
 */
export function percentileFromFinish(
  finishSeconds: number,
  cuts: { p90: number; p75: number; p50: number; p25: number },
): number {
  const { p90, p75, p50, p25 } = cuts;
  // segments defined fastest -> slowest
  const seg = (
    x: number, xFast: number, xSlow: number, pFast: number, pSlow: number,
  ) => pFast + ((x - xFast) / (xSlow - xFast)) * (pSlow - pFast);

  let p: number;
  if (finishSeconds <= p90) {
    // faster than elite threshold: extrapolate up toward 99, cap there
    const slope = (90 - 75) / (p75 - p90); // pct per second (negative dir handled)
    p = 90 + slope * (p90 - finishSeconds);
  } else if (finishSeconds <= p75) {
    p = seg(finishSeconds, p90, p75, 90, 75);
  } else if (finishSeconds <= p50) {
    p = seg(finishSeconds, p75, p50, 75, 50);
  } else if (finishSeconds <= p25) {
    p = seg(finishSeconds, p50, p25, 50, 25);
  } else {
    // slower than novice threshold: extrapolate down toward 1
    const slope = (50 - 25) / (p25 - p50);
    p = 25 - slope * (finishSeconds - p25);
  }
  return Math.max(1, Math.min(99, Math.round(p)));
}

/* ------------------------------------------------------------------ */
/* Run-pace band lookup                                                */
/* ------------------------------------------------------------------ */

export function runPaceBand(division: Division, gender: Gender, paceSecPerKm: number): string {
  const bands = RUN_PACE_BANDS[division][gender];
  for (const b of bands) {
    const from = toSeconds(b.from);
    const to = b.to ? toSeconds(b.to) : Infinity;
    if (paceSecPerKm >= from && paceSecPerKm < to) return b.band;
  }
  // faster than the Elite floor
  return "Elite";
}

/* ------------------------------------------------------------------ */
/* Main predictor                                                      */
/* ------------------------------------------------------------------ */

export interface AthleteProfile {
  division: Division;
  gender: Gender;
  age: AgeBracket;
}

export interface RaceInput {
  /** Average per-km run pace, "M:SS". Used for all 8 laps unless runLaps given. */
  avgRunPacePerKm?: string;
  /** Optional explicit 8 run laps, "M:SS" each (overrides avgRunPacePerKm). */
  runLaps?: string[];
  /** Per-station splits, "M:SS". Any omitted station is estimated (flagged). */
  stations: Partial<Record<StationKey, string>>;
  /** Total RoxZone across the race, "M:SS". Estimated from band if omitted. */
  roxzone?: string;
}

export interface StationDiagnostic {
  key: StationKey;
  label: string;
  splitSeconds: number;
  strongSeconds: number;
  deviationSeconds: number; // + = slower than Strong band midpoint
  estimated: boolean;
  atOrBetterThanStrong: boolean;
}

export interface Prediction {
  predictedSeconds: number;
  predictedRange: [number, number];
  predictedClock: string;
  predictedRangeClock: [string, string];
  percentile: number;
  level: string;
  runPaceBand: string | null;
  components: {
    runsSeconds: number;
    stationsSeconds: number;
    roxzoneSeconds: number;
  };
  stationDiagnostics: StationDiagnostic[]; // sorted worst-first
  weakestStations: StationDiagnostic[]; // top leaks above Strong
  estimatedStationCount: number;
  notes: string[];
}

/**
 * Predict a finish time and diagnose weaknesses from an athlete's inputs.
 * @param marginPct base +/- confidence margin on the range (default 4%).
 *   Widened automatically when stations are estimated rather than entered.
 */
export function predict(
  profile: AthleteProfile,
  input: RaceInput,
  marginPct = 0.04,
): Prediction {
  const { division, gender, age } = profile;
  const strongTable = STATION_STRONG[division][gender] as StationStrongLike;
  const notes: string[] = [];

  // --- Runs ---
  let runsSeconds: number;
  if (input.runLaps && input.runLaps.length === 8) {
    runsSeconds = input.runLaps.reduce((sum, lap) => sum + toSeconds(lap), 0);
  } else if (input.avgRunPacePerKm) {
    runsSeconds = toSeconds(input.avgRunPacePerKm) * 8;
  } else {
    // fall back to the middle of the division's Average band
    const avgBand = RUN_PACE_BANDS[division][gender].find((b) => b.band === "Average")!;
    const mid = (toSeconds(avgBand.from) + toSeconds(avgBand.to ?? avgBand.from)) / 2;
    runsSeconds = mid * 8;
    notes.push("No run pace provided; used mid-field Average pace for the 8 runs.");
  }
  const avgPaceSec = runsSeconds / 8;
  const paceBand = runPaceBand(division, gender, avgPaceSec);

  // --- Stations ---
  const diagnostics: StationDiagnostic[] = [];
  let stationsSeconds = 0;
  let estimatedStationCount = 0;

  for (const key of STATION_ORDER) {
    const strongMid = midOfBand(strongTable[key]);
    const provided = input.stations[key];
    let splitSeconds: number;
    let estimated = false;
    if (provided) {
      splitSeconds = toSeconds(provided);
    } else {
      // Estimate missing station at the slower edge of Strong (mildly
      // conservative) and flag it so the range widens.
      splitSeconds = toSeconds(strongTable[key][1]);
      estimated = true;
      estimatedStationCount += 1;
    }
    stationsSeconds += splitSeconds;
    diagnostics.push({
      key,
      label: STATION_LABELS[key],
      splitSeconds,
      strongSeconds: strongMid,
      deviationSeconds: splitSeconds - strongMid,
      estimated,
      atOrBetterThanStrong: splitSeconds <= strongMid,
    });
  }
  if (estimatedStationCount > 0) {
    notes.push(
      `${estimatedStationCount} station(s) estimated, not entered. Range widened; treat the diagnosis for those as provisional.`,
    );
  }

  // --- RoxZone ---
  let roxzoneSeconds: number;
  if (input.roxzone) {
    roxzoneSeconds = toSeconds(input.roxzone);
  } else {
    const rz = ROXZONE_BANDS[gender];
    roxzoneSeconds = (toSeconds(rz.strong[0]) + toSeconds(rz.strong[1])) / 2;
    notes.push("No RoxZone entered; used Strong-band midpoint (~7 min total).");
  }

  // --- Finish + percentile ---
  const predictedSeconds = runsSeconds + stationsSeconds + roxzoneSeconds;
  const cuts = finishCutPoints(division, gender, age);
  const percentile = percentileFromFinish(predictedSeconds, cuts);
  const level = levelFromPercentile(percentile);

  // widen range by 1.5% per estimated station on top of base margin
  const margin = marginPct + estimatedStationCount * 0.015;
  const lo = predictedSeconds * (1 - margin);
  const hi = predictedSeconds * (1 + margin);

  // --- Rank weak links ---
  const sorted = [...diagnostics].sort((a, b) => b.deviationSeconds - a.deviationSeconds);
  const weakest = sorted.filter((d) => d.deviationSeconds > 0).slice(0, 3);

  if (division === "Pro") {
    notes.push("Pro station splits are blended (men/women combined) in v1; treat station diagnosis as approximate.");
  }

  return {
    predictedSeconds,
    predictedRange: [lo, hi],
    predictedClock: toClock(predictedSeconds),
    predictedRangeClock: [toClock(lo), toClock(hi)],
    percentile,
    level,
    runPaceBand: paceBand,
    components: { runsSeconds, stationsSeconds, roxzoneSeconds },
    stationDiagnostics: sorted,
    weakestStations: weakest,
    estimatedStationCount,
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* Calibration example (run: npx tsx scoring.ts)                       */
/* Approx Trent-style Open profile with a weak row, strong sled push.  */
/* ------------------------------------------------------------------ */

export function example(): Prediction {
  const profile: AthleteProfile = { division: "Open", gender: "Men", age: "30-34" };
  const input: RaceInput = {
    avgRunPacePerKm: "4:20",
    stations: {
      skiErg: "4:15",
      sledPush: "2:35",   // strong
      sledPull: "4:55",
      burpeeBroadJump: "5:30",
      row: "5:20",        // known weak spot
      farmersCarry: "2:05",
      sandbagLunges: "5:20",
      wallBalls: "6:45",
    },
    roxzone: "7:00",
  };
  return predict(profile, input);
}
