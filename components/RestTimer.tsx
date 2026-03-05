import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Timer, X, RotateCcw } from "lucide-react-native";
import * as haptics from "@/lib/haptics";

const PRESETS = [30, 60, 90, 120, 180];

interface RestTimerProps {
  visible: boolean;
  onClose: () => void;
}

export function RestTimer({ visible, onClose }: RestTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setRunning(false);
            haptics.success();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    if (totalSeconds > 0) {
      progress.value = withTiming(seconds / totalSeconds, { duration: 950 });
    }
  }, [seconds, totalSeconds]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const startTimer = useCallback((secs: number) => {
    haptics.selection();
    setSeconds(secs);
    setTotalSeconds(secs);
    setRunning(true);
    progress.value = 1;
  }, []);

  const resetTimer = useCallback(() => {
    haptics.lightTap();
    setSeconds(0);
    setTotalSeconds(0);
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="mb-4 rounded-2xl bg-[#1A1A24] p-4"
    >
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Timer size={16} color="#2dd4bf" />
          <Text className="ml-2 text-sm font-semibold text-white">
            Rest Timer
          </Text>
        </View>
        <View className="flex-row items-center">
          {running && (
            <TouchableOpacity onPress={resetTimer} className="mr-3">
              <RotateCcw size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose}>
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timer display */}
      {seconds > 0 || running ? (
        <View className="items-center">
          <Text
            className={`text-4xl font-bold ${
              seconds === 0 ? "text-success" : "text-white"
            }`}
          >
            {seconds === 0 ? "Done!" : formatTime(seconds)}
          </Text>
          {/* Progress bar */}
          <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#0F0F14]">
            <Animated.View
              style={progressStyle}
              className="h-full rounded-full bg-teal"
            />
          </View>
        </View>
      ) : (
        <>
          <Text className="mb-2 text-xs text-gray-400">Quick start</Text>
          <View className="flex-row justify-between">
            {PRESETS.map((secs) => (
              <TouchableOpacity
                key={secs}
                className="flex-1 mx-1 items-center rounded-xl bg-[#0F0F14] py-3"
                onPress={() => startTimer(secs)}
              >
                <Text className="text-sm font-semibold text-teal">
                  {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}
