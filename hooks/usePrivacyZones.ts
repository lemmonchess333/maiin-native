import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import * as Location from "expo-location";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { PrivacyZone } from "@/lib/privacyZones";

export function usePrivacyZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState<PrivacyZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setZones([]);
      setLoading(false);
      return;
    }
    const ref = collection(db, "users", user.uid, "privacyZones");
    const unsub = onSnapshot(ref, (snap) => {
      const list: PrivacyZone[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? "Zone",
          lat: data.lat ?? 0,
          lon: data.lon ?? 0,
          radiusMeters: data.radiusMeters ?? 200,
        };
      });
      setZones(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addZone = async (name: string, radiusMeters: number = 200) => {
    if (!user) return;
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await addDoc(collection(db, "users", user.uid, "privacyZones"), {
        name,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        radiusMeters,
        createdAt: Timestamp.now(),
      });
    } catch {}
  };

  const removeZone = async (zoneId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "privacyZones", zoneId));
  };

  return { zones, loading, addZone, removeZone };
}
