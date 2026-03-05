import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const POSTS_COL = "socialPosts";

/**
 * Publish a social post when a workout or run is completed.
 * Called automatically from save flows.
 */
export async function publishSocialPost(
  userId: string,
  displayName: string,
  type: "workout" | "run",
  detail: string,
  refId: string,
) {
  await addDoc(collection(db, POSTS_COL), {
    userId,
    displayName,
    type,
    detail,
    refId,
    likes: [],
    createdAt: Timestamp.now(),
  });
}
