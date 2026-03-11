import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useSocial } from "@/hooks/useSocial";
import {
  useChallenges,
  GLOBAL_CHALLENGES,
  getChallengeColor,
} from "@/hooks/useChallenges";
import { useAuth } from "@/lib/auth-context";
import { searchUsers } from "@/lib/socialApi";
import * as haptics from "@/lib/haptics";
import { LeaderboardCard } from "@/components/social/LeaderboardCard";
import { ChallengeCard } from "@/components/social/ChallengeCard";
import {
  Users,
  Heart,
  Dumbbell,
  Route,
  UserPlus,
  UserCheck,
  Trophy,
  Target,
  Search,
  Zap,
} from "lucide-react-native";

type SocialTab = "feed" | "leaderboard" | "challenges" | "find";

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
  const { posts, following, loading, toggleLike, followUser, unfollowUser } =
    useSocial();
  const {
    myChallenges,
    availableChallenges,
    joinChallenge,
    isJoined,
    getProgress,
  } = useChallenges();
  const [activeTab, setActiveTab] = useState<SocialTab>("feed");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    const results = await searchUsers(searchQuery.trim());
    setSearchResults(results.filter((r: any) => r.uid !== user?.uid));
  }, [searchQuery, user]);

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

  const TABS: { key: SocialTab; label: string; icon: React.ReactElement }[] = [
    { key: "feed", label: "Feed", icon: <Users size={14} color="#6B7280" /> },
    { key: "leaderboard", label: "Board", icon: <Trophy size={14} color="#6B7280" /> },
    { key: "challenges", label: "Challenges", icon: <Target size={14} color="#6B7280" /> },
    { key: "find", label: "Find", icon: <Search size={14} color="#6B7280" /> },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pb-2 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Community</Text>
            <Text className="text-sm text-gray-400">
              {following.length} following
            </Text>
          </View>
          <Users size={22} color="#2dd4bf" />
        </View>

        {/* Tab Bar */}
        <View className="flex-row gap-2">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 flex-row items-center justify-center gap-1 rounded-xl py-2.5 ${
                activeTab === tab.key ? "bg-teal" : "bg-[#1A1A24]"
              }`}
              onPress={() => {
                haptics.selection();
                setActiveTab(tab.key);
              }}
            >
              {React.cloneElement(tab.icon as React.ReactElement<{ color: string }>, {
                color: activeTab === tab.key ? "#fff" : "#6B7280",
              })}
              <Text
                className={`text-xs font-semibold ${
                  activeTab === tab.key ? "text-white" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <>
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={<Users size={28} color="#2dd4bf" />}
                title="No Posts Yet"
                subtitle="Complete a workout or run to share!"
              />
            ) : (
              posts.map((post) => {
                const isLiked = user
                  ? post.likes.includes(user.uid)
                  : false;
                const isOwnPost = post.userId === user?.uid;
                return (
                  <Card key={post.id} className="mb-3">
                    <View className="flex-row items-start">
                      <View
                        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                          post.type === "workout"
                            ? "bg-brand/20"
                            : "bg-running/20"
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
                              onPress={() =>
                                handleFollowToggle(post.userId)
                              }
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
          </>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <View className="mt-2">
            <LeaderboardCard challenge="weekly_hybrid" />
          </View>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <>
            {myChallenges.filter((c) => !c.completed).length > 0 && (
              <>
                <Text className="mb-2 mt-2 text-sm font-semibold text-white">
                  Active Challenges
                </Text>
                {myChallenges
                  .filter((c) => !c.completed)
                  .map((uc) => {
                    const challenge = GLOBAL_CHALLENGES.find(
                      (c) => c.id === uc.challengeId,
                    );
                    if (!challenge) return null;
                    return (
                      <ChallengeCard
                        key={uc.challengeId}
                        challenge={challenge}
                        userChallenge={uc}
                        color={getChallengeColor(challenge.type)}
                      />
                    );
                  })}
              </>
            )}

            <Text className="mb-2 mt-2 text-sm font-semibold text-white">
              Available Challenges
            </Text>
            {availableChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                color={getChallengeColor(challenge.type)}
                onJoin={() => joinChallenge(challenge.id)}
              />
            ))}
          </>
        )}

        {/* Find Tab */}
        {activeTab === "find" && (
          <>
            <View className="mb-3 mt-2 flex-row gap-2">
              <TextInput
                className="flex-1 rounded-lg border border-[#2A2A3A] bg-[#1A1A24] px-3 py-2 text-sm text-white"
                placeholder="Search by name..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                className="rounded-lg bg-brand px-4 py-2"
                onPress={handleSearch}
              >
                <Text className="text-sm font-medium text-white">Search</Text>
              </TouchableOpacity>
            </View>
            {searchResults.map((u: any) => {
              const isUserFollowing = following.includes(u.uid);
              return (
                <Card key={u.uid} className="mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-teal/20">
                        <Text className="text-sm font-bold text-teal">
                          {(u.displayName || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                        {u.displayName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className={`rounded-xl px-3 py-2 ${isUserFollowing ? "bg-[#2A2A3A]" : "bg-teal"}`}
                      onPress={() => handleFollowToggle(u.uid)}
                    >
                      <Text
                        className={`text-xs font-semibold ${isUserFollowing ? "text-gray-400" : "text-white"}`}
                      >
                        {isUserFollowing ? "Following" : "Follow"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
            {searchResults.length === 0 && !searchQuery && (
              <EmptyState
                icon={<Search size={28} color="#2dd4bf" />}
                title="Find Athletes"
                subtitle="Search by name to find and follow other athletes"
              />
            )}
          </>
        )}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
