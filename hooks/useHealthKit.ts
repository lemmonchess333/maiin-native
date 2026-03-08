/**
 * HealthKit / Health Connect integration.
 * Syncs completed workouts and runs to Apple Health (iOS) or Health Connect (Android).
 * Uses react-native-health for iOS HealthKit.
 */

import { useCallback, useRef } from "react";
import { Platform } from "react-native";

let AppleHealthKit: any = null;
try {
  AppleHealthKit = require("react-native-health").default;
} catch {
  // react-native-health not linked — gracefully degrade
}

const PERMISSIONS = {
  permissions: {
    read: [] as string[],
    write: [
      "Workout",
      "ActiveEnergyBurned",
      "DistanceWalkingRunning",
    ],
  },
};

export function useHealthKit() {
  const authorized = useRef(false);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!AppleHealthKit || Platform.OS !== "ios") return false;

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (err: any) => {
        if (err) {
          console.warn("HealthKit init error:", err);
          resolve(false);
          return;
        }
        authorized.current = true;
        resolve(true);
      });
    });
  }, []);

  const saveWorkout = useCallback(
    async (opts: {
      type: "lifting" | "running";
      startDate: Date;
      endDate: Date;
      calories?: number;
      distanceMeters?: number;
    }) => {
      if (!AppleHealthKit || !authorized.current) return;

      const workoutType =
        opts.type === "running"
          ? "Running"
          : "TraditionalStrengthTraining";

      const sample = {
        type: workoutType,
        startDate: opts.startDate.toISOString(),
        endDate: opts.endDate.toISOString(),
        energyBurned: opts.calories ?? 0,
        ...(opts.distanceMeters
          ? { distance: opts.distanceMeters / 1000 }
          : {}),
      };

      return new Promise<void>((resolve, reject) => {
        AppleHealthKit.saveWorkout(sample, (err: any) => {
          if (err) {
            console.warn("HealthKit save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    [],
  );

  const saveRun = useCallback(
    async (opts: {
      startDate: Date;
      endDate: Date;
      distanceMeters: number;
      calories: number;
    }) => {
      return saveWorkout({
        type: "running",
        startDate: opts.startDate,
        endDate: opts.endDate,
        calories: opts.calories,
        distanceMeters: opts.distanceMeters,
      });
    },
    [saveWorkout],
  );

  const saveLift = useCallback(
    async (opts: {
      startDate: Date;
      endDate: Date;
      calories?: number;
    }) => {
      return saveWorkout({
        type: "lifting",
        startDate: opts.startDate,
        endDate: opts.endDate,
        calories: opts.calories,
      });
    },
    [saveWorkout],
  );

  return {
    available: !!AppleHealthKit && Platform.OS === "ios",
    requestPermissions,
    saveWorkout,
    saveRun,
    saveLift,
  };
}
