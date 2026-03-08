import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  getCurrentWeather,
  getWeatherIcon,
  getRunningTip,
} from "@/lib/weather";

export function WeatherTip() {
  const [tip, setTip] = useState<string | null>(null);
  const [icon, setIcon] = useState<string>("");

  useEffect(() => {
    getCurrentWeather().then((weather) => {
      if (!weather) return;
      setIcon(getWeatherIcon(weather.weatherCode));
      setTip(getRunningTip(weather));
    });
  }, []);

  if (!tip) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="mb-4 flex-row items-center rounded-xl bg-[#1A1A24] px-4 py-3"
    >
      <Text className="mr-2 text-base">{icon}</Text>
      <Text className="flex-1 text-xs text-gray-300">{tip}</Text>
    </Animated.View>
  );
}
