import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { WorkoutTemplate } from "@/lib/types";

const COL = "workoutTemplates";

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COL),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WorkoutTemplate,
      );
      setTemplates(items);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const saveTemplate = useCallback(
    async (
      name: string,
      exercises: { name: string; defaultSets: number }[],
    ) => {
      if (!user) return;
      await addDoc(collection(db, COL), {
        userId: user.uid,
        name,
        exercises,
        createdAt: Timestamp.now(),
      });
    },
    [user],
  );

  const deleteTemplate = useCallback(async (templateId: string) => {
    await deleteDoc(doc(db, COL, templateId));
  }, []);

  return { templates, loading, saveTemplate, deleteTemplate };
}
