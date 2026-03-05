import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import {
  Users,
  Heart,
  MessageCircle,
  Dumbbell,
  Route,
  UserPlus,
} from "lucide-react-native";

interface FeedItem {
  id: string;
  name: string;
  type: "lift" | "run";
  detail: string;
  time: string;
  likes: number;
}

const FEED: FeedItem[] = [
  {
    id: "1",
    name: "Alex M.",
    type: "lift",
    detail: "Hit a 315 lb squat PR!",
    time: "2h ago",
    likes: 12,
  },
  {
    id: "2",
    name: "Sarah K.",
    type: "run",
    detail: "Morning 5K — 23:45",
    time: "4h ago",
    likes: 8,
  },
  {
    id: "3",
    name: "Jordan P.",
    type: "lift",
    detail: "Push day — bench, OHP, dips",
    time: "6h ago",
    likes: 5,
  },
  {
    id: "4",
    name: "Taylor R.",
    type: "run",
    detail: "Long run 10 mi — 1:28:30",
    time: "1d ago",
    likes: 18,
  },
];

const FRIENDS = [
  { name: "Alex M.", status: "Active now" },
  { name: "Sarah K.", status: "Ran 2h ago" },
  { name: "Jordan P.", status: "Lifted today" },
  { name: "Taylor R.", status: "Rest day" },
];

export default function SocialScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Community</Text>
            <Text className="text-sm text-gray-400">Friends & feed</Text>
          </View>
          <TouchableOpacity>
            <UserPlus size={22} color="#2dd4bf" />
          </TouchableOpacity>
        </View>

        {/* Friends Row */}
        <SectionHeader title="Friends" action="See All" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
        >
          {FRIENDS.map((friend, i) => (
            <View
              key={i}
              className="mr-3 items-center rounded-2xl bg-[#1A1A24] px-4 py-3"
              style={{ width: 100 }}
            >
              <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-teal/20">
                <Users size={18} color="#2dd4bf" />
              </View>
              <Text
                className="text-xs font-semibold text-white"
                numberOfLines={1}
              >
                {friend.name}
              </Text>
              <Text className="text-[10px] text-gray-500" numberOfLines={1}>
                {friend.status}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Activity Feed */}
        <SectionHeader title="Feed" />
        {FEED.map((item) => (
          <Card key={item.id} className="mb-3">
            <View className="flex-row items-start">
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                  item.type === "lift" ? "bg-brand/20" : "bg-running/20"
                }`}
              >
                {item.type === "lift" ? (
                  <Dumbbell size={18} color="#8b5cf6" />
                ) : (
                  <Route size={18} color="#FF6B6B" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-white">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.time}</Text>
                </View>
                <Text className="mt-1 text-sm text-gray-300">
                  {item.detail}
                </Text>
                <View className="mt-2 flex-row items-center gap-4">
                  <TouchableOpacity className="flex-row items-center">
                    <Heart size={14} color="#6B7280" />
                    <Text className="ml-1 text-xs text-gray-500">
                      {item.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <MessageCircle size={14} color="#6B7280" />
                    <Text className="ml-1 text-xs text-gray-500">Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        ))}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
