/**
 * Weather service for pre-run tips.
 * Uses Open-Meteo API (no key needed) with expo-location and AsyncStorage cache.
 */

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

const CACHE_KEY = "weather_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const WMO_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export async function getCurrentWeather(): Promise<WeatherData | null> {
  // Check cache
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
  } catch {}

  // Check location permission — only proceed if already granted
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return null;
  } catch {
    return null;
  }

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    const { latitude, longitude } = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;
    const res = await fetch(url);
    const json = await res.json();
    const c = json.current;
    const data: WeatherData = {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      weatherCode: c.weather_code,
      description: WMO_CODES[c.weather_code] || "Unknown",
    };
    // Update cache
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch {}
    return data;
  } catch {
    return null;
  }
}

export function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return "\u2600\uFE0F";
  if (code === 2) return "\u26C5";
  if (code === 3) return "\u2601\uFE0F";
  if (code >= 45 && code <= 48) return "\uD83C\uDF2B\uFE0F";
  if (code >= 51 && code <= 55) return "\uD83C\uDF26\uFE0F";
  if (code >= 61 && code <= 65) return "\uD83C\uDF27\uFE0F";
  if (code >= 71 && code <= 75) return "\uD83C\uDF28\uFE0F";
  if (code >= 80 && code <= 82) return "\uD83C\uDF27\uFE0F";
  if (code >= 95) return "\u26C8\uFE0F";
  return "\uD83C\uDF24\uFE0F";
}

export function getRunningTip(
  weather: WeatherData,
  activityType?: string,
): string {
  const { temperature, humidity, windSpeed, weatherCode } = weather;
  if (weatherCode >= 61 && weatherCode <= 65) {
    return activityType === "intervals"
      ? "Wet track \u2014 watch your footing on turns"
      : "Rainy \u2014 wear a light shell, avoid cotton";
  }
  if (weatherCode >= 71 && weatherCode <= 75)
    return "Snowy \u2014 trail shoes and shorter stride for grip";
  if (weatherCode >= 95)
    return "Thunderstorm \u2014 consider postponing or using a treadmill";
  if (temperature >= 30 && humidity >= 60) {
    return activityType === "long"
      ? "Hot & humid \u2014 carry water, add walk breaks every 3km"
      : "Very hot \u2014 hydrate well before, go easy on pace";
  }
  if (temperature >= 28)
    return "Warm \u2014 start slower than usual, stay hydrated";
  if (windSpeed >= 30)
    return "Very windy \u2014 start into the wind, finish with it behind you";
  if (windSpeed >= 20)
    return "Windy \u2014 expect slower pace, it\u2019s a strength workout!";
  if (temperature <= 0)
    return "Freezing \u2014 layer up, gloves are a must, warm up indoors";
  if (temperature <= 5)
    return "Cold \u2014 extra warm-up time, breathe through your nose";
  if (
    temperature >= 10 &&
    temperature <= 18 &&
    humidity < 70 &&
    windSpeed < 15
  )
    return "Great conditions \u2014 perfect running weather!";
  return `${temperature}\u00B0C, ${weather.description.toLowerCase()} \u2014 enjoy your run`;
}
