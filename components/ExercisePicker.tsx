import { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Search, X } from "lucide-react-native";
import { EXERCISE_CATEGORIES, getExercisesByCategory } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";

interface Props {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ onSelect, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "90%"], []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(EXERCISE_CATEGORIES[0]);

  const filteredExercises = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return EXERCISE_CATEGORIES.flatMap((cat) =>
        getExercisesByCategory(cat).filter((e) =>
          e.name.toLowerCase().includes(q),
        ),
      );
    }
    return getExercisesByCategory(selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleChange}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#1A1A24" }}
      handleIndicatorStyle={{ backgroundColor: "#6B7280" }}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
          <Text className="text-base font-semibold text-white">
            Select Exercise
          </Text>
          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-lg"
            onPress={onClose}
          >
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="mx-4 mb-3">
          <View className="flex-row items-center rounded-lg bg-[#0F0F14] px-3">
            <Search size={14} color="#6B7280" />
            <TextInput
              className="ml-2 h-9 flex-1 text-sm text-white"
              placeholder="Search exercises..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category pills */}
        {!searchQuery && (
          <FlatList
            data={EXERCISE_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 6, marginBottom: 8 }}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                className={`rounded-lg px-3 py-1.5 ${
                  selectedCategory === cat ? "bg-brand" : "bg-[#0F0F14]"
                }`}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === cat ? "text-white" : "text-gray-400"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Exercise list */}
        {filteredExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            className="border-b border-[#2A2A3A] px-4 py-3"
            onPress={() => onSelect(exercise)}
          >
            <Text className="text-sm font-medium text-white">
              {exercise.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {exercise.muscleGroup} · {exercise.equipment}
            </Text>
          </TouchableOpacity>
        ))}

        {filteredExercises.length === 0 && (
          <Text className="px-4 py-6 text-center text-sm text-gray-500">
            No exercises found
          </Text>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
