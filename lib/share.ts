import { Share } from "react-native";
import type { Workout, Run } from "./types";

export function shareWorkout(workout: Workout) {
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const totalVolume = workout.exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  const exerciseLines = workout.exercises
    .map(
      (ex) =>
        `  ${ex.name}: ${ex.sets.length} sets, best ${Math.max(...ex.sets.map((s) => s.weight))} lbs`,
    )
    .join("\n");

  const message = [
    `💪 ${workout.name}`,
    `${workout.exercises.length} exercises · ${totalSets} sets · ${workout.durationMinutes} min`,
    `Total volume: ${totalVolume.toLocaleString()} lbs`,
    "",
    exerciseLines,
    "",
    "Logged with Maiin",
  ].join("\n");

  Share.share({ message });
}

export function shareRun(run: Run) {
  const minutes = Math.floor(run.durationSeconds / 60);
  const secs = run.durationSeconds % 60;
  const duration = `${minutes}:${String(secs).padStart(2, "0")}`;

  const message = [
    `🏃 Run Complete!`,
    `${run.distanceMiles.toFixed(2)} mi in ${duration}`,
    `Pace: ${run.pacePerMile}/mi · ${run.calories} cal`,
    "",
    "Logged with Maiin",
  ].join("\n");

  Share.share({ message });
}

export function shareActivity(type: "workout" | "run", data: Workout | Run) {
  if (type === "workout") {
    shareWorkout(data as Workout);
  } else {
    shareRun(data as Run);
  }
}
