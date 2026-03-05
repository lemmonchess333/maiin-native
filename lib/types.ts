import { Timestamp } from "firebase/firestore";

// ── Workout (lifting) ──────────────────────────────────────

export interface WorkoutSet {
  weight: number;
  reps: number;
  done: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  createdAt: Timestamp;
}

// ── Run ────────────────────────────────────────────────────

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Run {
  id: string;
  userId: string;
  distanceMiles: number;
  durationSeconds: number;
  pacePerMile: string;
  calories: number;
  route: GpsPoint[];
  createdAt: Timestamp;
}

// ── User Profile ───────────────────────────────────────────

export interface UserProfile {
  userId: string;
  displayName: string;
  totalWorkouts: number;
  totalRuns: number;
  totalMiles: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Timestamp;
}

// ── Workout Template ──────────────────────────────────────

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  exercises: { name: string; defaultSets: number }[];
  createdAt: Timestamp;
}

// ── Activity (union for feed) ──────────────────────────────

export type Activity =
  | { type: "workout"; data: Workout }
  | { type: "run"; data: Run };
