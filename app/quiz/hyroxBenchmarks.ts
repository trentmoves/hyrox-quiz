/**
 * hyroxBenchmarks.ts
 * ------------------
 * Hard-coded HYROX benchmark bands for the Hyrox Human quiz v1.
 *
 * These are AGGREGATE published benchmarks (percentile bands and Strong-band
 * targets), not individual athlete records. Sourced from public analysis pages
 * that summarise ~700K+ results. Transcribing summary statistics carries none
 * of the ToS exposure of scraping results.hyrox.com directly.
 *
 * Sources (verify / refresh periodically):
 *  - Finish-time percentile bands by division/gender/age:
 *      https://prommer.net/en/training/hyrox/times-by-age/   (last updated Apr 2026)
 *  - Station Strong-band splits, run-pace bands, RoxZone bands:
 *      https://hyroxy.com/hyrox-station-split-benchmarks/     (updated May 2026)
 *
 * Time formats in this file:
 *  - Finish times:            "H:MM:SS"  (e.g. "1:10:00" = 70 min)
 *  - Station / pace / roxzone: "M:SS"    (e.g. "4:20"    = 4 min 20 s)
 *  toSeconds() in scoring.ts parses both (3 parts = h:m:s, 2 parts = m:s).
 *
 * KNOWN GAPS (safe for v1, flagged so you can tighten later):
 *  - Station splits and RoxZone are published per division only down to
 *    Men Open / Women Open / Pro(blended). No per-age station splits, and
 *    Women Pro reuses the Pro-blended numbers. Finish-time bands ARE per age.
 *  - Station bands give the "Strong" (~top 25%) anchor only, not the full
 *    distribution. v1 diagnoses weakness as deviation from Strong, which is
 *    exactly the method hyroxy.com documents. Swap in full per-station
 *    percentiles from pyrox-client / a paid API when you do the real pull.
 */

export type Division = "Open" | "Pro";
export type Gender = "Men" | "Women";

export type AgeBracket =
  | "16-24" | "25-29" | "30-34" | "35-39" | "40-44"
  | "45-49" | "50-54" | "55-59" | "60+";

export type StationKey =
  | "skiErg" | "sledPush" | "sledPull" | "burpeeBroadJump"
  | "row" | "farmersCarry" | "sandbagLunges" | "wallBalls";

export const STATION_ORDER: StationKey[] = [
  "skiErg", "sledPush", "sledPull", "burpeeBroadJump",
  "row", "farmersCarry", "sandbagLunges", "wallBalls",
];

export const STATION_LABELS: Record<StationKey, string> = {
  skiErg: "SkiErg (1000m)",
  sledPush: "Sled Push (50m)",
  sledPull: "Sled Pull (50m)",
  burpeeBroadJump: "Burpee Broad Jumps (80m)",
  row: "Row (1000m)",
  farmersCarry: "Farmers Carry (200m)",
  sandbagLunges: "Sandbag Lunges (100m)",
  wallBalls: "Wall Balls (100 reps)",
};

/**
 * Finish-time cut points, in "H:MM:SS", fastest-first.
 * Each bracket lists the four boundaries between the five performance bands:
 *   p90 = Elite threshold   (faster than this  => Elite,        top 10%)
 *   p75 = Advanced threshold (faster than this => Advanced,      75-90th)
 *   p50 = Intermediate thr.  (faster than this => Intermediate,  50-75th)
 *   p25 = Novice threshold   (faster than this => Novice,        25-50th;
 *                             slower            => Beginner,      bottom 25%)
 * Percentiles are interpolated between these anchors in scoring.ts.
 */
export interface FinishCutPoints {
  age: AgeBracket;
  p90: string; // Elite / Advanced boundary
  p75: string; // Advanced / Intermediate boundary
  p50: string; // Intermediate / Novice boundary
  p25: string; // Novice / Beginner boundary
}

type FinishTable = Record<Division, Record<Gender, FinishCutPoints[]>>;

export const FINISH_BANDS: FinishTable = {
  Open: {
    Men: [
      { age: "16-24", p90: "1:12:00", p75: "1:23:00", p50: "1:35:00", p25: "1:47:00" },
      { age: "25-29", p90: "1:10:00", p75: "1:21:00", p50: "1:34:00", p25: "1:45:00" },
      { age: "30-34", p90: "1:12:00", p75: "1:23:00", p50: "1:35:00", p25: "1:48:00" },
      { age: "35-39", p90: "1:14:00", p75: "1:25:00", p50: "1:38:00", p25: "1:50:00" },
      { age: "40-44", p90: "1:18:00", p75: "1:30:00", p50: "1:42:00", p25: "1:55:00" },
      { age: "45-49", p90: "1:20:00", p75: "1:32:00", p50: "1:44:00", p25: "1:58:00" },
      { age: "50-54", p90: "1:23:00", p75: "1:35:00", p50: "1:48:00", p25: "2:02:00" },
      { age: "55-59", p90: "1:26:00", p75: "1:38:00", p50: "1:52:00", p25: "2:10:00" },
      { age: "60+",   p90: "1:32:00", p75: "1:45:00", p50: "2:00:00", p25: "2:20:00" },
    ],
    Women: [
      { age: "16-24", p90: "1:25:00", p75: "1:38:00", p50: "1:50:00", p25: "2:05:00" },
      { age: "25-29", p90: "1:22:00", p75: "1:36:00", p50: "1:52:00", p25: "2:06:00" },
      { age: "30-34", p90: "1:24:00", p75: "1:37:00", p50: "1:52:00", p25: "2:08:00" },
      { age: "35-39", p90: "1:28:00", p75: "1:40:00", p50: "1:55:00", p25: "2:12:00" },
      { age: "40-44", p90: "1:30:00", p75: "1:42:00", p50: "1:58:00", p25: "2:15:00" },
      { age: "45-49", p90: "1:32:00", p75: "1:46:00", p50: "2:02:00", p25: "2:20:00" },
      { age: "50-54", p90: "1:36:00", p75: "1:50:00", p50: "2:08:00", p25: "2:28:00" },
      { age: "55-59", p90: "1:40:00", p75: "1:55:00", p50: "2:15:00", p25: "2:35:00" },
      { age: "60+",   p90: "1:45:00", p75: "2:00:00", p50: "2:20:00", p25: "2:45:00" },
    ],
  },
  Pro: {
    // Pro age groups stop at 55-59; 60+ athletes race Open.
    Men: [
      { age: "16-24", p90: "0:56:00", p75: "1:02:00", p50: "1:10:00", p25: "1:20:00" },
      { age: "25-29", p90: "0:54:00", p75: "1:00:00", p50: "1:08:00", p25: "1:18:00" },
      { age: "30-34", p90: "0:56:00", p75: "1:02:00", p50: "1:10:00", p25: "1:20:00" },
      { age: "35-39", p90: "0:58:00", p75: "1:04:00", p50: "1:12:00", p25: "1:23:00" },
      { age: "40-44", p90: "1:00:00", p75: "1:07:00", p50: "1:15:00", p25: "1:26:00" },
      { age: "45-49", p90: "1:03:00", p75: "1:10:00", p50: "1:18:00", p25: "1:30:00" },
      { age: "50-54", p90: "1:06:00", p75: "1:14:00", p50: "1:22:00", p25: "1:35:00" },
      { age: "55-59", p90: "1:10:00", p75: "1:18:00", p50: "1:28:00", p25: "1:40:00" },
    ],
    Women: [
      { age: "16-24", p90: "1:05:00", p75: "1:12:00", p50: "1:20:00", p25: "1:30:00" },
      { age: "25-29", p90: "1:03:00", p75: "1:10:00", p50: "1:18:00", p25: "1:28:00" },
      { age: "30-34", p90: "1:05:00", p75: "1:12:00", p50: "1:20:00", p25: "1:30:00" },
      { age: "35-39", p90: "1:07:00", p75: "1:14:00", p50: "1:22:00", p25: "1:33:00" },
      { age: "40-44", p90: "1:10:00", p75: "1:17:00", p50: "1:25:00", p25: "1:36:00" },
      { age: "45-49", p90: "1:13:00", p75: "1:20:00", p50: "1:28:00", p25: "1:40:00" },
      { age: "50-54", p90: "1:16:00", p75: "1:24:00", p50: "1:33:00", p25: "1:45:00" },
      { age: "55-59", p90: "1:20:00", p75: "1:28:00", p50: "1:38:00", p25: "1:50:00" },
    ],
  },
};

/**
 * Per-km run-pace bands ("M:SS"). Faster-first: [Elite, Advanced, Strong,
 * Average, Developing]. Each entry is the FASTER edge of that band; the last
 * (Developing) has no ceiling. Women Pro reuses Pro-blended (flagged gap).
 */
export interface PaceBand {
  band: "Elite" | "Advanced" | "Strong" | "Average" | "Developing";
  from: string; // faster edge, inclusive
  to: string | null; // slower edge; null = open-ended (Developing)
}

export const RUN_PACE_BANDS: Record<Division, Record<Gender, PaceBand[]>> = {
  Open: {
    Men: [
      { band: "Elite", from: "3:35", to: "3:50" },
      { band: "Advanced", from: "3:50", to: "4:05" },
      { band: "Strong", from: "4:05", to: "4:25" },
      { band: "Average", from: "4:25", to: "4:55" },
      { band: "Developing", from: "4:55", to: null },
    ],
    Women: [
      { band: "Elite", from: "3:55", to: "4:10" },
      { band: "Advanced", from: "4:10", to: "4:30" },
      { band: "Strong", from: "4:30", to: "4:55" },
      { band: "Average", from: "4:55", to: "5:30" },
      { band: "Developing", from: "5:30", to: null },
    ],
  },
  Pro: {
    Men: [
      { band: "Elite", from: "3:20", to: "3:40" },
      { band: "Advanced", from: "3:40", to: "3:55" },
      { band: "Strong", from: "3:55", to: "4:10" },
      { band: "Average", from: "4:10", to: "4:30" },
      { band: "Developing", from: "4:30", to: null },
    ],
    // GAP: no separate Women Pro pace published; reusing Pro-blended.
    Women: [
      { band: "Elite", from: "3:20", to: "3:40" },
      { band: "Advanced", from: "3:40", to: "3:55" },
      { band: "Strong", from: "3:55", to: "4:10" },
      { band: "Average", from: "4:10", to: "4:30" },
      { band: "Developing", from: "4:30", to: null },
    ],
  },
};

/** Total RoxZone time across the race ("M:SS"). Only MO / WO published. */
export const ROXZONE_BANDS: Record<Gender, { elite: [string, string]; strong: [string, string]; developing: string }> = {
  Men: { elite: ["4:30", "5:30"], strong: ["6:30", "7:30"], developing: "9:00" },
  Women: { elite: ["4:45", "5:45"], strong: ["6:45", "7:45"], developing: "9:15" },
};

/**
 * Station "Strong" band ranges ("M:SS"), [faster, slower].
 * Pro column is blended across Pro men/women (only Pro-Strong was published).
 * v1 uses the band midpoint as the Strong anchor for deviation scoring.
 */
type StationStrong = Record<StationKey, [string, string]>;

export const STATION_STRONG: Record<Division, Record<Gender, StationStrong>> = {
  Open: {
    Men: {
      skiErg: ["4:00", "4:20"],
      sledPush: ["2:40", "3:00"],
      sledPull: ["4:30", "5:05"],
      burpeeBroadJump: ["5:05", "5:45"],
      row: ["4:20", "4:55"],
      farmersCarry: ["2:00", "2:20"],
      sandbagLunges: ["5:00", "5:30"],
      wallBalls: ["6:00", "7:00"],
    },
    Women: {
      skiErg: ["4:25", "4:50"],
      sledPush: ["2:45", "3:10"],
      sledPull: ["5:40", "6:10"],
      burpeeBroadJump: ["6:40", "7:20"],
      row: ["5:10", "5:45"],
      farmersCarry: ["2:10", "2:35"],
      sandbagLunges: ["4:55", "5:25"],
      wallBalls: ["6:15", "7:30"],
    },
  },
  Pro: {
    // GAP: Pro splits are blended; same table used for Men Pro and Women Pro.
    Men: {
      skiErg: ["3:45", "4:00"],
      sledPush: ["3:35", "4:05"],
      sledPull: ["5:15", "5:50"],
      burpeeBroadJump: ["4:05", "4:45"],
      row: ["4:05", "4:35"],
      farmersCarry: ["1:50", "2:10"],
      sandbagLunges: ["4:35", "5:10"],
      wallBalls: ["5:30", "6:15"],
    },
    Women: {
      skiErg: ["3:45", "4:00"],
      sledPush: ["3:35", "4:05"],
      sledPull: ["5:15", "5:50"],
      burpeeBroadJump: ["4:05", "4:45"],
      row: ["4:05", "4:35"],
      farmersCarry: ["1:50", "2:10"],
      sandbagLunges: ["4:35", "5:10"],
      wallBalls: ["5:30", "6:15"],
    },
  },
};

/** Station weights (kg) for display / user context. */
export const STATION_LOADS: Record<Division, Record<Gender, Partial<Record<StationKey, string>>>> = {
  Open: {
    Men: { sledPush: "152", sledPull: "103", farmersCarry: "2x24", sandbagLunges: "20", wallBalls: "6" },
    Women: { sledPush: "102", sledPull: "78", farmersCarry: "2x16", sandbagLunges: "10", wallBalls: "4" },
  },
  Pro: {
    Men: { sledPush: "202", sledPull: "153", farmersCarry: "2x32", sandbagLunges: "30", wallBalls: "9" },
    Women: { sledPush: "152", sledPull: "103", farmersCarry: "2x24", sandbagLunges: "20", wallBalls: "6" },
  },
};

/** Percentile -> level label mapping used across the app. */
export function levelFromPercentile(p: number): string {
  if (p >= 90) return "Elite";
  if (p >= 75) return "Advanced";
  if (p >= 50) return "Intermediate";
  if (p >= 25) return "Novice";
  return "Beginner";
}
