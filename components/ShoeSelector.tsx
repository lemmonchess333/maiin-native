import { View, Text, TouchableOpacity } from "react-native";
import { useShoes } from "@/hooks/useShoes";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import * as haptics from "@/lib/haptics";

interface Props {
  selectedShoeId: string | null;
  onSelect: (shoeId: string) => void;
}

export function ShoeSelector({ selectedShoeId, onSelect }: Props) {
  const { activeShoes, defaultShoe, loading } = useShoes();
  const [expanded, setExpanded] = useState(false);

  if (loading || activeShoes.length === 0) return null;

  const selected = selectedShoeId
    ? activeShoes.find((s) => s.id === selectedShoeId) ?? defaultShoe
    : defaultShoe;

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-xl border border-[#2A2A3A] bg-[#1A1A24] px-4 py-3"
        onPress={() => {
          haptics.selection();
          setExpanded(!expanded);
        }}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">👟</Text>
          <View>
            <Text className="text-sm font-medium text-white">
              {selected?.name ?? "Select shoe"}
            </Text>
            {selected && (
              <Text className="text-xs text-gray-400">
                {Math.round(selected.totalKm)} / {selected.maxKm} km
              </Text>
            )}
          </View>
        </View>
        <ChevronDown size={16} color="#6B7280" />
      </TouchableOpacity>

      {expanded && (
        <View className="mt-1 rounded-xl border border-[#2A2A3A] bg-[#1A1A24]">
          {activeShoes.map((shoe) => (
            <TouchableOpacity
              key={shoe.id}
              className={`flex-row items-center justify-between border-b border-[#2A2A3A] px-4 py-3 last:border-b-0 ${
                shoe.id === selected?.id ? "bg-brand/10" : ""
              }`}
              onPress={() => {
                haptics.selection();
                onSelect(shoe.id);
                setExpanded(false);
              }}
            >
              <View>
                <Text className="text-sm text-white">{shoe.name}</Text>
                <Text className="text-xs text-gray-400">
                  {shoe.brand} · {Math.round(shoe.totalKm)} km
                </Text>
              </View>
              {shoe.isDefault && (
                <View className="rounded-full bg-brand/15 px-2 py-0.5">
                  <Text className="text-[10px] text-brand">Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
