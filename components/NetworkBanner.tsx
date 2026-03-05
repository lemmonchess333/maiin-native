import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsub();
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="mx-5 mb-3 flex-row items-center rounded-xl bg-[#1A1A24] px-4 py-3"
    >
      <WifiOff size={14} color="#6B7280" />
      <Text className="ml-2 text-xs text-gray-400">
        You're offline — changes will sync when reconnected
      </Text>
    </Animated.View>
  );
}
