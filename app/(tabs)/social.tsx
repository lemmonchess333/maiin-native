import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useSocial } from "@/hooks/useSocial";
import { useAuth } from "@/lib/auth-context";
import * as haptics from "@/lib/haptics";
import {
  Users,
  Heart,
  MessageCircle,
  Dumbbell,
  Route,
  UserPlus,
  UserCheck,
} from "lucide-react-native";

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SocialScreen() {
  const { user } = useAuth();
  const {
    posts,
    following,
    loading,
    toggleLike,
    followUser,
    unfollowUser,
  } = useSocial();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleLike = useCallback(
    (postId: string) => {
      haptics.lightTap();
      toggleLike(postId);
    },
    [toggleLike],
  );

  const handleFollowToggle = useCallback(
    (targetUserId: string) => {
      haptics.selection();
      if (following.includes(targetUserId)) {
        unfollowUser(targetUserId);
      } else {
        followUser(targetUserId);
      }
    },
    [following, followUser, unfollowUser],
  );

  // Unique users from posts (excluding current user) for "People" section
  const uniqueUsers = posts.reduce<
    { userId: string; displayName: string }[]
  >((acc, post) => {
    if (
      post.userId !== user?.uid &&
      !acc.some((u) => u.userId === post.userId)
    ) {
      acc.push({ userId: post.userId, displayName: post.displayName });
    }
    return acc;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2dd4bf"
            colors={["#2dd4bf"]}
          />
        }
      >
        {/* Header */}
        <View className="mb-4 mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Community</Text>
            <Text className="text-sm text-gray-400">
              {following.length} following
            </Text>
          </View>
          <Users size={22} color="#2dd4bf" />
        </View>

        {/* People Row */}
        {uniqueUsers.length > 0 && (
          <>
            <SectionHeader title="People" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
            >
              {uniqueUsers.map((person) => {
                const isFollowing = following.includes(person.userId);
                return (
                  <TouchableOpacity
                    key={person.userId}
                    className="mr-3 items-center rounded-2xl bg-[#1A1A24] px-4 py-3"
                    style={{ width: 110 }}
                    onPress={() => handleFollowToggle(person.userId)}
                    activeOpacity={0.7}
                  >
                    <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-teal/20">
                      {isFollowing ? (
                        <UserCheck size={18} color="#2dd4bf" />
                      ) : (
                        <UserPlus size={18} color="#6B7280" />
                      )}
                    </View>
                    <Text
                      className="text-xs font-semibold text-white"
                      numberOfLines={1}
                    >
                      {person.displayName}
                    </Text>
                    <Text
                      className={`text-[10px] ${isFollowing ? "text-teal" : "text-gray-500"}`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Activity Feed */}
        <SectionHeader title="Feed" />

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color="#2dd4bf" />}
            title="No Posts Yet"
            subtitle="Complete a workout or run to share it with the community!"
          />
        ) : (
          posts.map((post) => {
            const isLiked = user ? post.likes.includes(user.uid) : false;
            const isOwnPost = post.userId === user?.uid;

            return (
              <Card key={post.id} className="mb-3">
                <View className="flex-row items-start">
                  <View
                    className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                      post.type === "workout" ? "bg-brand/20" : "bg-running/20"
                    }`}
                  >
                    {post.type === "workout" ? (
                      <Dumbbell size={18} color="#8b5cf6" />
                    ) : (
                      <Route size={18} color="#FF6B6B" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-sm font-bold text-white">
                          {post.displayName}
                        </Text>
                        {isOwnPost && (
                          <Text className="ml-2 text-[10px] text-gray-500">
                            You
                          </Text>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        {timeAgo(post.createdAt.toDate())}
                      </Text>
                    </View>
                    <Text className="mt-1 text-sm text-gray-300">
                      {post.detail}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-4">
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => handleLike(post.id)}
                      >
                        <Heart
                          size={14}
                          color={isLiked ? "#FF6B6B" : "#6B7280"}
                          fill={isLiked ? "#FF6B6B" : "none"}
                        />
                        <Text
                          className={`ml-1 text-xs ${isLiked ? "text-running" : "text-gray-500"}`}
                        >
                          {post.likes.length}
                        </Text>
                      </TouchableOpacity>
                      {!isOwnPost && (
                        <TouchableOpacity
                          className="flex-row items-center"
                          onPress={() => handleFollowToggle(post.userId)}
                        >
                          {following.includes(post.userId) ? (
                            <UserCheck size={14} color="#2dd4bf" />
                          ) : (
                            <UserPlus size={14} color="#6B7280" />
                          )}
                          <Text
                            className={`ml-1 text-xs ${
                              following.includes(post.userId)
                                ? "text-teal"
                                : "text-gray-500"
                            }`}
                          >
                            {following.includes(post.userId)
                              ? "Following"
                              : "Follow"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
