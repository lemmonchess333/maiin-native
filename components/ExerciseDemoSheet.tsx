import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Model from "react-body-highlighter";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import {
  getExerciseDemo,
  mapMuscles,
  needsPosterior,
  type ExerciseDemo,
} from "@/lib/exerciseDemo";

interface Props {
  exerciseName: string;
  onClose: () => void;
}

export const ExerciseDemoSheet = ({
  exerciseName,
  onClose,
}: Props) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [demo, setDemo] = useState<ExerciseDemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const snapPoints = useMemo(() => ["60%", "85%"], []);

  useEffect(() => {
    if (!exerciseName) return;
    setLoading(true);
    setShowInstructions(false);
    getExerciseDemo(exerciseName).then((d) => {
      setDemo(d);
      setLoading(false);
    });
  }, [exerciseName]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const primaryMapped = demo ? mapMuscles(demo.primaryMuscles) : [];
  const secondaryMapped = demo ? mapMuscles(demo.secondaryMuscles) : [];
  const showPosterior = needsPosterior([...primaryMapped, ...secondaryMapped]);

  const highlightData = [
    ...(primaryMapped.length > 0
      ? [{ name: "Primary", muscles: primaryMapped as any[] }]
      : []),
    ...(secondaryMapped.length > 0
      ? [{ name: "Secondary", muscles: secondaryMapped as any[] }]
      : []),
  ];

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
      <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color="#8b5cf6" />
          </View>
        ) : !demo ? (
          <View className="items-center py-8">
            <View className="flex-row justify-center gap-4 opacity-30">
              <Model
                data={[]}
                style={{ width: "120px", padding: "0" }}
                type="anterior"
              />
            </View>
            <Text className="mt-3 text-sm text-gray-400">
              No demo available for this exercise
            </Text>
            <Text className="mt-1 text-lg font-semibold text-white">
              {exerciseName}
            </Text>
          </View>
        ) : (
          <View>
            {/* Title & Category */}
            <Text className="text-lg font-bold text-white">{demo.name}</Text>
            <View className="mt-1.5 flex-row gap-2">
              {demo.category ? (
                <View className="rounded-full bg-brand/10 px-2 py-0.5">
                  <Text className="text-[10px] font-medium text-brand">
                    {demo.category}
                  </Text>
                </View>
              ) : null}
              {demo.equipment ? (
                <View className="rounded-full bg-[#2A2A3A] px-2 py-0.5">
                  <Text className="text-[10px] font-medium text-gray-400">
                    {demo.equipment}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Muscle Models */}
            <View className="mt-4 flex-row justify-center gap-2">
              <View className="items-center">
                <Model
                  data={highlightData}
                  style={{ width: "140px", padding: "0" }}
                  type="anterior"
                  highlightedColors={["#8b5cf6", "#c4b5fd"]}
                />
                <Text className="mt-1 text-[9px] text-gray-400">Front</Text>
              </View>
              {showPosterior && (
                <View className="items-center">
                  <Model
                    data={highlightData}
                    style={{ width: "140px", padding: "0" }}
                    type="posterior"
                    highlightedColors={["#8b5cf6", "#c4b5fd"]}
                  />
                  <Text className="mt-1 text-[9px] text-gray-400">Back</Text>
                </View>
              )}
            </View>

            {/* Muscle Labels */}
            <View className="mt-4 gap-1.5">
              {demo.primaryMuscles.length > 0 && (
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <Text className="mr-1 text-[10px] font-medium text-gray-400">
                    Primary:
                  </Text>
                  {demo.primaryMuscles.map((m) => (
                    <View
                      key={m}
                      className="rounded-full bg-brand/15 px-2 py-0.5"
                    >
                      <Text className="text-[10px] font-medium text-brand">
                        {m}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {demo.secondaryMuscles.length > 0 && (
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <Text className="mr-1 text-[10px] font-medium text-gray-400">
                    Secondary:
                  </Text>
                  {demo.secondaryMuscles.map((m) => (
                    <View
                      key={m}
                      className="rounded-full bg-[#2A2A3A] px-2 py-0.5"
                    >
                      <Text className="text-[10px] font-medium text-gray-400">
                        {m}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Collapsible Instructions */}
            {demo.instructions.length > 0 && (
              <View className="mt-4">
                <TouchableOpacity
                  className="flex-row items-center gap-1.5"
                  onPress={() => setShowInstructions(!showInstructions)}
                >
                  <Text className="text-sm font-medium text-white">
                    Instructions
                  </Text>
                  {showInstructions ? (
                    <ChevronUp size={16} color="#6B7280" />
                  ) : (
                    <ChevronDown size={16} color="#6B7280" />
                  )}
                </TouchableOpacity>
                {showInstructions && (
                  <View className="mt-2 gap-2">
                    {demo.instructions.map((step, i) => (
                      <View key={i} className="flex-row">
                        <Text className="mr-2 text-xs text-gray-500">
                          {i + 1}.
                        </Text>
                        <Text className="flex-1 text-xs leading-relaxed text-gray-400">
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
