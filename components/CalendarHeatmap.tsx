import { useMemo } from "react";
import { View, Text } from "react-native";
import type { Workout, Run } from "@/lib/types";

interface CalendarHeatmapProps {
  workouts: Workout[];
  runs: Run[];
  weeks?: number;
}

export function CalendarHeatmap({
  workouts,
  runs,
  weeks = 12,
}: CalendarHeatmapProps) {
  const { grid, months } = useMemo(() => {
    // Build a map of date string -> activity count
    const countMap = new Map<string, number>();

    for (const w of workouts) {
      const key = w.createdAt.toDate().toISOString().split("T")[0];
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }
    for (const r of runs) {
      const key = r.createdAt.toDate().toISOString().split("T")[0];
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }

    // Build grid: weeks x 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);
    // Align to start of week (Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const cols: { date: string; count: number }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const d = new Date(startDate);
    let col = 0;
    while (d <= today || cols.length < weeks) {
      const week: { date: string; count: number }[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const key = d.toISOString().split("T")[0];
        const isFuture = d > today;
        week.push({
          date: key,
          count: isFuture ? -1 : (countMap.get(key) ?? 0),
        });

        if (dow === 0 && d.getMonth() !== lastMonth && !isFuture) {
          lastMonth = d.getMonth();
          monthLabels.push({
            label: d.toLocaleDateString("en-US", { month: "short" }),
            col,
          });
        }

        d.setDate(d.getDate() + 1);
      }
      cols.push(week);
      col++;
      if (cols.length >= weeks + 2) break;
    }

    return { grid: cols, months: monthLabels };
  }, [workouts, runs, weeks]);

  return (
    <View>
      {/* Month labels */}
      <View className="mb-1 flex-row" style={{ paddingLeft: 18 }}>
        {months.map((m, i) => (
          <Text
            key={i}
            className="text-[9px] text-gray-500"
            style={{
              position: "absolute",
              left: 18 + m.col * 14,
            }}
          >
            {m.label}
          </Text>
        ))}
      </View>

      <View className="mt-3 flex-row">
        {/* Day labels */}
        <View className="mr-1 justify-between" style={{ height: 7 * 14 - 2 }}>
          {["", "M", "", "W", "", "F", ""].map((label, i) => (
            <Text key={i} className="text-[8px] text-gray-600" style={{ height: 12, lineHeight: 12 }}>
              {label}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View className="flex-row">
          {grid.map((week, wi) => (
            <View key={wi} className="mr-0.5">
              {week.map((day, di) => (
                <View
                  key={di}
                  className="mb-0.5 rounded-sm"
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor:
                      day.count < 0
                        ? "transparent"
                        : day.count === 0
                          ? "#1A1A24"
                          : day.count === 1
                            ? "#8b5cf640"
                            : day.count === 2
                              ? "#8b5cf680"
                              : "#8b5cf6",
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View className="mt-2 flex-row items-center justify-end">
        <Text className="mr-1 text-[9px] text-gray-600">Less</Text>
        {["#1A1A24", "#8b5cf640", "#8b5cf680", "#8b5cf6"].map((color) => (
          <View
            key={color}
            className="mx-0.5 rounded-sm"
            style={{ width: 10, height: 10, backgroundColor: color }}
          />
        ))}
        <Text className="ml-1 text-[9px] text-gray-600">More</Text>
      </View>
    </View>
  );
}
