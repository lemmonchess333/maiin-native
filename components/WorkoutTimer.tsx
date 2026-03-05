import { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Clock } from "lucide-react-native";

interface WorkoutTimerProps {
  active: boolean;
}

export function WorkoutTimer({ active }: WorkoutTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (active) {
      startRef.current = Date.now();
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  if (!active) return null;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const display = hrs > 0
    ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <View className="flex-row items-center rounded-lg bg-brand/15 px-3 py-1.5">
      <Clock size={12} color="#8b5cf6" />
      <Text className="ml-1.5 text-sm font-mono font-semibold text-brand">
        {display}
      </Text>
    </View>
  );
}
