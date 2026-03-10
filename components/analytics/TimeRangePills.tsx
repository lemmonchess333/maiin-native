import { View, Text, TouchableOpacity } from "react-native";
import * as haptics from "@/lib/haptics";

interface TimeRangePillsProps {
  options?: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function TimeRangePills({
  options = ["1W", "1M", "3M", "6M", "1Y"],
  selected,
  onChange,
}: TimeRangePillsProps) {
  return (
    <View className="flex-row gap-1 rounded-xl bg-[#0F0F14] p-1">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          className={`flex-1 items-center rounded-lg py-1.5 ${
            selected === opt ? "bg-[#1A1A24]" : ""
          }`}
          onPress={() => {
            haptics.selection();
            onChange(opt);
          }}
        >
          <Text
            className={`text-xs font-medium ${
              selected === opt ? "text-white" : "text-gray-500"
            }`}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
