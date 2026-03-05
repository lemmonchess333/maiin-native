import { useEffect, useRef } from "react";
import * as Speech from "expo-speech";

interface AudioCueOptions {
  /** Whether the run is currently active */
  active: boolean;
  /** Current distance in miles */
  distanceMiles: number;
  /** Current elapsed seconds */
  elapsedSeconds: number;
  /** Whether audio cues are enabled */
  enabled: boolean;
}

/**
 * Announces mile markers and periodic time updates during a run.
 * - Announces every whole mile completed
 * - Announces every 5 minutes of elapsed time
 */
export function useRunAudioCues({
  active,
  distanceMiles,
  elapsedSeconds,
  enabled,
}: AudioCueOptions) {
  const lastAnnouncedMile = useRef(0);
  const lastAnnouncedMinute = useRef(0);

  // Reset when run starts
  useEffect(() => {
    if (!active) {
      lastAnnouncedMile.current = 0;
      lastAnnouncedMinute.current = 0;
    }
  }, [active]);

  // Mile marker announcements
  useEffect(() => {
    if (!active || !enabled) return;

    const wholeMiles = Math.floor(distanceMiles);
    if (wholeMiles > lastAnnouncedMile.current && wholeMiles > 0) {
      lastAnnouncedMile.current = wholeMiles;

      const paceSeconds = elapsedSeconds / distanceMiles;
      const paceMin = Math.floor(paceSeconds / 60);
      const paceSec = Math.floor(paceSeconds % 60);

      const message = `Mile ${wholeMiles} complete. Pace: ${paceMin} minutes ${paceSec} seconds per mile.`;
      Speech.speak(message, { rate: 1.0, pitch: 1.0 });
    }
  }, [active, enabled, distanceMiles, elapsedSeconds]);

  // Time-based announcements (every 5 minutes)
  useEffect(() => {
    if (!active || !enabled) return;

    const currentMinute = Math.floor(elapsedSeconds / 60);
    const fiveMinBlock = Math.floor(currentMinute / 5);

    if (fiveMinBlock > lastAnnouncedMinute.current && currentMinute > 0) {
      lastAnnouncedMinute.current = fiveMinBlock;

      const mins = currentMinute;
      const dist = distanceMiles.toFixed(2);

      const message = `${mins} minutes elapsed. Distance: ${dist} miles.`;
      Speech.speak(message, { rate: 1.0, pitch: 1.0 });
    }
  }, [active, enabled, elapsedSeconds, distanceMiles]);
}
