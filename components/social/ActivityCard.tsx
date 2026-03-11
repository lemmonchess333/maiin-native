import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import {
  Heart,
  MessageCircle,
  Dumbbell,
  Route,
  Trophy,
  TrendingUp,
  Mountain,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { toggleKudos } from "@/lib/socialApi";
import * as haptics from "@/lib/haptics";
import { CommentSection } from "./CommentSection";
import type { FeedItem } from "@/hooks/useSocialFeed";

function getTimeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function MiniRoute({
  preview,
}: {
  preview: { lat: number; lon: number }[];
}) {
  if (preview.length < 2) return null;
  const lats = preview.map((p) => p.lat);
  const lons = preview.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const rLat = maxLat - minLat || 0.001;
  const rLon = maxLon - minLon || 0.001;
  const pts = preview
    .map(
      (p) =>
        `${((p.lon - minLon) / rLon) * 188 + 6},${(1 - (p.lat - minLat) / rLat) * 68 + 6}`,
    )
    .join(" ");

  return (
    <Svg viewBox="0 0 200 80" width="100%" height="100%">
      <Polyline
        fill="none"
        stroke="#FF6B6B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </Svg>
  );
}

const RUN_CHIPS = ["Nice run! 🏃", "Great pace! ⚡", "Keep it up! 💪"];
const LIFT_CHIPS = ["Great lift! 🏋️", "Beast mode! 💪", "Strong work! 🔥"];

export function ActivityCard({ feedItem }: { feedItem: FeedItem }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(feedItem.liked ?? false);
  const [kudosCount, setKudosCount] = useState(feedItem.kudosCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const activity = feedItem.activity;

  const handleKudos = async () => {
    if (!user) return;
    haptics.lightTap();
    const nowLiked = await toggleKudos(feedItem.activityId, user.uid);
    setLiked(nowLiked);
    setKudosCount((c) => (nowLiked ? c + 1 : c - 1));
  };

  const isRun = feedItem.type === "run";
  const timeAgo = feedItem.createdAt?.toDate
    ? getTimeAgo(feedItem.createdAt.toDate())
    : "";
  const avatarBg = isRun ? "rgba(255,107,107,0.12)" : "rgba(108,124,255,0.12)";
  const avatarColor = isRun ? "#FF6B6B" : "#6C7CFF";
  const chips = isRun ? RUN_CHIPS : LIFT_CHIPS;

  return (
    <View className="overflow-hidden rounded-2xl border border-[#2A2A3A] bg-[#1A1A24]">
      {/* Route thumbnail for runs */}
      {isRun && activity?.routePreview?.length > 1 && (
        <View
          className="h-28 border-b border-[#2A2A3A]"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <MiniRoute preview={activity.routePreview} />
        </View>
      )}

      <View className="p-4">
        {/* Author row */}
        <View className="mb-3 flex-row items-center gap-3">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarBg }}
          >
            <Text className="text-sm font-bold" style={{ color: avatarColor }}>
              {feedItem.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white" numberOfLines={1}>
              {feedItem.authorName}
            </Text>
            <View className="flex-row items-center gap-1">
              {isRun ? (
                <Route size={12} color="#FF6B6B" />
              ) : (
                <Dumbbell size={12} color="#6C7CFF" />
              )}
              <Text className="text-[10px] text-gray-500">
                {timeAgo} · {isRun ? "Run" : "Workout"}
              </Text>
            </View>
          </View>
        </View>

        {/* Run stats */}
        {isRun && activity && (
          <View className="mb-3 flex-row gap-5">
            <View>
              <Text
                className="text-xl font-bold"
                style={{ color: "#FF6B6B" }}
              >
                {((activity.distance || 0) / 1000).toFixed(2)}
              </Text>
              <Text className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-500">
                km
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-white">
                {activity.avgPace || "--:--"}
              </Text>
              <Text className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-500">
                /km
              </Text>
            </View>
            {(activity.elevationGain || 0) > 0 && (
              <View className="flex-row items-start gap-1">
                <Mountain size={14} color="#6B7280" style={{ marginTop: 4 }} />
                <View>
                  <Text className="text-xl font-bold text-white">
                    {activity.elevationGain}m
                  </Text>
                  <Text className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-500">
                    elev
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Workout muscle groups + PRs */}
        {!isRun && activity?.muscleGroups && (
          <View className="mb-3 flex-row flex-wrap gap-1.5">
            {activity.muscleGroups.map((mg: string) => (
              <View
                key={mg}
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: "rgba(108,124,255,0.08)" }}
              >
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: "#6C7CFF" }}
                >
                  {mg}
                </Text>
              </View>
            ))}
            {(activity.prsHit || 0) > 0 && (
              <View
                className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: "rgba(245,158,11,0.1)" }}
              >
                <Trophy size={12} color="#f59e0b" />
                <Text className="text-[10px] font-medium text-yellow-500">
                  {activity.prsHit} PR{activity.prsHit > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        )}

        {!activity && (
          <Text className="mb-3 text-sm text-gray-400">
            {feedItem.summary}
          </Text>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-5 border-t border-[#2A2A3A]/40 pt-2.5">
          <TouchableOpacity
            className="flex-row items-center gap-1.5"
            onPress={handleKudos}
          >
            <Heart
              size={20}
              color={liked ? "#EF4444" : "#6B7280"}
              fill={liked ? "#EF4444" : "none"}
            />
            {kudosCount > 0 && (
              <Text className="text-xs font-medium text-gray-500">
                {kudosCount}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center gap-1.5"
            onPress={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} color="#6B7280" />
            {(activity?.commentCount || 0) > 0 && (
              <Text className="text-xs font-medium text-gray-500">
                {activity.commentCount}
              </Text>
            )}
          </TouchableOpacity>
          {isRun && activity && (
            <View className="ml-auto flex-row items-center gap-1">
              <TrendingUp size={14} color="#6B7280" />
              <Text className="text-[10px] text-gray-500">
                {activity.splits?.length ?? 0} splits
              </Text>
            </View>
          )}
        </View>

        {/* Quick reply chips */}
        {showComments && (
          <View className="mt-3 flex-row gap-1.5">
            {chips.map((chip) => (
              <TouchableOpacity
                key={chip}
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: "rgba(139,92,246,0.08)" }}
              >
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: "#8b5cf6" }}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showComments && (
          <CommentSection activityId={feedItem.activityId} />
        )}
      </View>
    </View>
  );
}
