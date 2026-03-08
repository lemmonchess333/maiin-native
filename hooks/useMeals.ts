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

export interface MealItem {
  name: string;
  portionSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Meal {
  id: string;
  date: string;
  foodName: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  totalSodium?: number;
  confidence: string;
  createdAt: any;
}

export function useMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, "users", user.uid, "meals");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Meal[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Meal[];
      setMeals(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addMeal = useCallback(
    async (
      date: string,
      foodName: string,
      items: MealItem[],
      confidence: string = "high",
    ) => {
      if (!user) return;
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      await addDoc(collection(db, "users", user.uid, "meals"), {
        date,
        foodName,
        items,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        confidence,
        createdAt: Timestamp.now(),
      });
    },
    [user],
  );

  const deleteMeal = useCallback(
    async (mealId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "meals", mealId));
    },
    [user],
  );

  const getMealsForDate = useCallback(
    (date: string) => meals.filter((m) => m.date === date),
    [meals],
  );

  const getDailyTotals = useCallback(
    (date: string) => {
      const dayMeals = getMealsForDate(date);
      return dayMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.totalCalories,
          protein: acc.protein + m.totalProtein,
          carbs: acc.carbs + m.totalCarbs,
          fat: acc.fat + m.totalFat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
    },
    [getMealsForDate],
  );

  return { meals, loading, addMeal, deleteMeal, getMealsForDate, getDailyTotals };
}
