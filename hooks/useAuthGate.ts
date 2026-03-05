import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/lib/auth-context";

export function useAuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "sign-in";

    if (!user && !inAuthScreen) {
      router.replace("/sign-in");
    } else if (user && inAuthScreen) {
      router.replace("/");
    }
  }, [user, loading, segments]);
}
