import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: "lifting" | "running" | "hybrid" | "nutrition";
  target: { metric: string; value: number; unit: string };
  duration: "weekly" | "monthly" | "ongoing";
  participants: number;
}

export interface UserChallenge {
  challengeId: string;
  joinedAt: Date;
  progress: number;
  completed: boolean;
}

export const GLOBAL_CHALLENGES: Challenge[] = [
  {
    id: "iron-runner",
    name: "Iron Runner",
    description: "Complete 3 lifts + 3 runs this week",
    type: "hybrid",
    target: { metric: "sessions", value: 6, unit: "sessions" },
    duration: "weekly",
    participants: 0,
  },
  {
    id: "100k-month",
    name: "100K Month",
    description: "Run 100km in a calendar month",
    type: "running",
    target: { metric: "distance", value: 100, unit: "km" },
    duration: "monthly",
    participants: 0,
  },
  {
    id: "tonnage-titan",
    name: "Tonnage Titan",
    description: "Lift 50,000kg total in one week",
    type: "lifting",
    target: { metric: "volume", value: 50000, unit: "kg" },
    duration: "weekly",
    participants: 0,
  },
  {
    id: "macro-master",
    name: "Macro Master",
    description: "Hit macros within 5% for 5 consecutive days",
    type: "nutrition",
    target: { metric: "days", value: 5, unit: "days" },
    duration: "ongoing",
    participants: 0,
  },
  {
    id: "hybrid-30",
    name: "Hybrid 30",
    description: "Log both a lift and run for 30 days",
    type: "hybrid",
    target: { metric: "days", value: 30, unit: "days" },
    duration: "ongoing",
    participants: 0,
  },
];

const TYPE_COLORS: Record<string, string> = {
  lifting: "#8b5cf6",
  running: "#FF6B6B",
  hybrid: "#2dd4bf",
  nutrition: "#f59e0b",
};

export function getChallengeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#6B7280";
}

export function useChallenges() {
  const { user } = useAuth();
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMyChallenges([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, "users", user.uid, "challenges");
    const unsub = onSnapshot(ref, (snap) => {
      const list: UserChallenge[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          challengeId: d.id,
          joinedAt: data.joinedAt?.toDate?.() ?? new Date(),
          progress: data.progress ?? 0,
          completed: data.completed ?? false,
        };
      });
      setMyChallenges(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "challenges", challengeId), {
      joinedAt: Timestamp.now(),
      progress: 0,
      completed: false,
    });
  };

  const updateProgress = async (challengeId: string, progress: number) => {
    if (!user) return;
    const updates: Record<string, any> = { progress };
    const challenge = GLOBAL_CHALLENGES.find((c) => c.id === challengeId);
    if (challenge && progress >= challenge.target.value) {
      updates.completed = true;
    }
    await updateDoc(
      doc(db, "users", user.uid, "challenges", challengeId),
      updates,
    );
  };

  const isJoined = (challengeId: string) =>
    myChallenges.some((c) => c.challengeId === challengeId);

  const getProgress = (challengeId: string) =>
    myChallenges.find((c) => c.challengeId === challengeId)?.progress ?? 0;

  const availableChallenges = GLOBAL_CHALLENGES.filter(
    (c) => !isJoined(c.id),
  );

  return {
    challenges: GLOBAL_CHALLENGES,
    myChallenges,
    availableChallenges,
    loading,
    joinChallenge,
    updateProgress,
    isJoined,
    getProgress,
  };
}
