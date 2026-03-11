import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SessionCard } from "./SessionCard";

interface TrainingSession {
  id: string;
  date: string;
  type: "run" | "lift";
  status: "scheduled" | "completed" | "skipped";
  runTemplateName?: string;
  liftProgramDay?: string;
}

interface Day {
  date: string;
  label: string;
  dayNum: number;
  isToday: boolean;
}

interface ScheduleDay {
  day: number;
  type: string;
}

interface WeekStripProps {
  weekDays: Day[];
  sessions: TrainingSession[];
  weekSchedule?: ScheduleDay[];
  onAdd: (date: string) => void;
  onStart: (session: TrainingSession) => void;
  onSkip: (sessionId: string) => void;
}

export function WeekStrip({
  weekDays,
  sessions,
  weekSchedule,
  onAdd,
  onStart,
  onSkip,
}: WeekStripProps) {
  const getSessionsForDate = (date: string) =>
    sessions.filter((s) => s.date === date);

  const getScheduledType = (date: string) => {
    if (!weekSchedule || weekSchedule.length === 0) return null;
    const dow = new Date(date + "T12:00:00").getDay();
    const entry = weekSchedule.find((s) => s.day === dow);
    return entry?.type || null;
  };

  return (
    <View>
      {weekDays.map((day) => {
        const daySessions = getSessionsForDate(day.date);
        const scheduledType = getScheduledType(day.date);
        const isLiftDay = scheduledType === "lift" || scheduledType === "both";
        const isRunDay = scheduledType === "run" || scheduledType === "both";

        return (
          <View
            key={day.date}
            className="mb-2 rounded-xl border p-3"
            style={{
              borderColor: day.isToday
                ? "rgba(139,92,246,0.5)"
                : "rgba(42,42,58,0.6)",
              backgroundColor: day.isToday
                ? "rgba(139,92,246,0.05)"
                : "#1A1A24",
            }}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: day.isToday ? "#8b5cf6" : "#6B7280",
                  }}
                >
                  {day.label}
                </Text>
                <Text className="text-xs text-gray-500">{day.dayNum}</Text>
                {daySessions.length === 0 && isLiftDay && (
                  <View className="h-2 w-2 rounded-full bg-blue-400" />
                )}
                {daySessions.length === 0 && isRunDay && (
                  <View className="h-2 w-2 rounded-full bg-red-400" />
                )}
              </View>
              <TouchableOpacity onPress={() => onAdd(day.date)}>
                <Text className="text-xs font-medium text-brand">+ Add</Text>
              </TouchableOpacity>
            </View>

            {daySessions.length === 0 && (
              <Text className="text-[10px] italic text-gray-500">
                {isLiftDay && isRunDay
                  ? "Lift + Run day"
                  : isLiftDay
                    ? "Lift day"
                    : isRunDay
                      ? "Run day"
                      : "Rest day"}
              </Text>
            )}

            {daySessions.map((session) => (
              <SessionCard
                key={session.id}
                type={session.type}
                title={
                  session.type === "run"
                    ? session.runTemplateName || "Run"
                    : session.liftProgramDay || "Workout"
                }
                status={session.status}
                onStart={() => onStart(session)}
                onSkip={() => onSkip(session.id)}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}
