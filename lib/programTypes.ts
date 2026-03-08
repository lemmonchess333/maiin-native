export type MovementCategory =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "knee_dominant"
  | "hip_dominant"
  | "arms_biceps"
  | "arms_triceps"
  | "core";

export type SplitType =
  | "full_body"
  | "upper_lower"
  | "ppl"
  | "ppl_ul"
  | "ppl_x2"
  | "ppl_x2_fb";
export type Goal = "cut" | "lean bulk" | "recomp";
export type ProgressionType = "double" | "linear";

export interface PerformanceRecord {
  date: string;
  weight: number;
  repsCompleted: number;
  repsTarget: number;
}

export interface ProgramExercise {
  name: string;
  exerciseId: string;
  movementCategory: MovementCategory;
  sets: number;
  reps: number;
  weight: number;
  progressionType: ProgressionType;
  lastSuccessfulWeight: number;
  lastAttemptedWeight: number;
  consecutiveFailures: number;
  plateauCount: number;
  performanceHistory: PerformanceRecord[];
  lastPerformance: {
    sets: number;
    reps: number;
    weight: number;
    completed: boolean;
  } | null;
}

export interface WorkoutDay {
  dayName: string;
  dayType: string;
  exercises: ProgramExercise[];
  completed: boolean;
  isCustom?: boolean;
}

export function normalizeExercise(
  ex: Partial<ProgramExercise> & { name: string; exerciseId: string },
): ProgramExercise {
  return {
    name: ex.name,
    exerciseId: ex.exerciseId,
    movementCategory: ex.movementCategory ?? "horizontal_push",
    sets: ex.sets ?? 3,
    reps: ex.reps ?? 8,
    weight: ex.weight ?? 0,
    progressionType: ex.progressionType ?? "linear",
    lastSuccessfulWeight: ex.lastSuccessfulWeight ?? ex.weight ?? 0,
    lastAttemptedWeight: ex.lastAttemptedWeight ?? ex.weight ?? 0,
    consecutiveFailures: ex.consecutiveFailures ?? 0,
    plateauCount: ex.plateauCount ?? 0,
    performanceHistory: ex.performanceHistory ?? [],
    lastPerformance: ex.lastPerformance ?? null,
  };
}
