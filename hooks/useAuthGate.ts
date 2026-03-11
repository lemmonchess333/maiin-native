import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export function useAuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "sign-in";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inAuthScreen) {
      router.replace("/sign-in");
      return;
    }

    if (user && inAuthScreen) {
      // Check onboarding status before redirecting to home
      checkOnboarding(user.uid);
      return;
    }

    if (user && !inAuthScreen && !inOnboarding && !checked) {
      checkOnboarding(user.uid);
    }
  }, [user, loading, segments]);

  async function checkOnboarding(uid: string) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.data();
      if (!data?.onboardingComplete) {
        router.replace("/onboarding");
      } else {
        if (segments[0] === "sign-in" || segments[0] === "onboarding") {
          router.replace("/");
        }
      }
      setChecked(true);
    } catch {
      // If we can't check, let user through
      setChecked(true);
    }
  }
}
