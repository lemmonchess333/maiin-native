/**
 * Exercise demo data — fetches from free-exercise-db and maps to react-body-highlighter muscle IDs.
 * Native version: uses AsyncStorage for caching instead of module-level variable.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ExerciseDemo {
  name: string;
  category: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

// Mapping from free-exercise-db muscle names → react-body-highlighter IDs
const MUSCLE_MAP: Record<string, string> = {
  // Upper
  chest: "chest",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearm",
  shoulders: "front-deltoids",
  "middle back": "upper-back",
  "lower back": "lower-back",
  lats: "upper-back",
  traps: "trapezius",
  neck: "neck",
  abdominals: "abs",
  obliques: "obliques",
  // Lower
  quadriceps: "quadriceps",
  hamstrings: "hamstrings",
  glutes: "gluteal",
  calves: "calves",
  adductors: "adpictor",
  abductors: "abpictor",
};

export function mapMuscles(names: string[]): string[] {
  return names
    .map((n) => MUSCLE_MAP[n.toLowerCase()] ?? null)
    .filter((m): m is string => m !== null);
}

export function needsPosterior(muscles: string[]): boolean {
  const posterior = new Set([
    "upper-back",
    "lower-back",
    "trapezius",
    "hamstrings",
    "gluteal",
    "calves",
  ]);
  return muscles.some((m) => posterior.has(m));
}

const CACHE_KEY = "exercise_demo_cache";
const DEMO_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// In-memory cache for current session
let memoryCache: Map<string, ExerciseDemo> | null = null;
let fetchPromise: Promise<void> | null = null;

async function loadDemos(): Promise<Map<string, ExerciseDemo>> {
  if (memoryCache) return memoryCache;

  // Try AsyncStorage first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const entries: [string, ExerciseDemo][] = JSON.parse(cached);
      memoryCache = new Map(entries);
      return memoryCache;
    }
  } catch {}

  if (fetchPromise) {
    await fetchPromise;
    return memoryCache!;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch(DEMO_URL);
      const data: any[] = await res.json();
      const map = new Map<string, ExerciseDemo>();
      for (const ex of data) {
        map.set(normaliseKey(ex.name), {
          name: ex.name,
          category: ex.category ?? "",
          equipment: ex.equipment ?? "",
          primaryMuscles: ex.primaryMuscles ?? [],
          secondaryMuscles: ex.secondaryMuscles ?? [],
          instructions: ex.instructions ?? [],
          images: ex.images ?? [],
        });
      }
      memoryCache = map;
      // Persist to AsyncStorage
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify(Array.from(map.entries())),
        );
      } catch {}
    } catch {
      memoryCache = new Map();
    }
  })();

  await fetchPromise;
  return memoryCache!;
}

function normaliseKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Fuzzy match: try exact, then stripped, then partial
export async function getExerciseDemo(
  name: string,
): Promise<ExerciseDemo | null> {
  const demos = await loadDemos();
  const key = normaliseKey(name);

  // Exact
  if (demos.has(key)) return demos.get(key)!;

  // Partial match
  for (const [k, v] of demos) {
    if (k.includes(key) || key.includes(k)) return v;
  }

  // Word overlap
  const words = key.match(/.{3,}/g) ?? [];
  let bestMatch: ExerciseDemo | null = null;
  let bestScore = 0;
  for (const [k, v] of demos) {
    const score = words.filter((w) => k.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = v;
    }
  }
  return bestScore >= 2 ? bestMatch : null;
}
