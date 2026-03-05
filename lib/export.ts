import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { Workout, Run } from "./types";

export async function exportWorkoutsCSV(workouts: Workout[]) {
  const header = "Date,Name,Exercises,Sets,Duration (min),Volume (lbs),Notes\n";
  const rows = workouts
    .map((w) => {
      const date = w.createdAt.toDate().toISOString().split("T")[0];
      const totalSets = w.exercises.reduce((s, ex) => s + ex.sets.length, 0);
      const volume = w.exercises.reduce(
        (s, ex) =>
          s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
        0,
      );
      const name = csvEscape(w.name);
      const notes = csvEscape(w.notes ?? "");
      return `${date},${name},${w.exercises.length},${totalSets},${w.durationMinutes},${volume},${notes}`;
    })
    .join("\n");

  const csv = header + rows;
  const path = `${FileSystem.cacheDirectory}maiin_workouts.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path, {
    mimeType: "text/csv",
    dialogTitle: "Export Workouts",
  });
}

export async function exportRunsCSV(runs: Run[]) {
  const header = "Date,Distance (mi),Duration,Pace (/mi),Calories,GPS Points\n";
  const rows = runs
    .map((r) => {
      const date = r.createdAt.toDate().toISOString().split("T")[0];
      const minutes = Math.floor(r.durationSeconds / 60);
      const secs = r.durationSeconds % 60;
      const duration = `${minutes}:${String(secs).padStart(2, "0")}`;
      return `${date},${r.distanceMiles.toFixed(2)},${duration},${r.pacePerMile},${r.calories},${r.route.length}`;
    })
    .join("\n");

  const csv = header + rows;
  const path = `${FileSystem.cacheDirectory}maiin_runs.csv`;
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path, {
    mimeType: "text/csv",
    dialogTitle: "Export Runs",
  });
}

function csvEscape(str: string): string {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
