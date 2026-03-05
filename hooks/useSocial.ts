import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  where,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { SocialPost, Follow } from "@/lib/types";

const POSTS_COL = "socialPosts";
const FOLLOWS_COL = "follows";

export function useSocial(maxPosts = 30) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to all recent posts (from everyone — simple global feed)
  useEffect(() => {
    const q = query(
      collection(db, POSTS_COL),
      orderBy("createdAt", "desc"),
      limit(maxPosts),
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as SocialPost,
      );
      setPosts(items);
      setLoading(false);
    });

    return unsub;
  }, [maxPosts]);

  // Listen to who the current user follows
  useEffect(() => {
    if (!user) {
      setFollowing([]);
      return;
    }

    const q = query(
      collection(db, FOLLOWS_COL),
      where("followerId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      setFollowing(snap.docs.map((d) => d.data().followingId as string));
    });

    return unsub;
  }, [user]);

  // Listen to followers of the current user
  useEffect(() => {
    if (!user) {
      setFollowers([]);
      return;
    }

    const q = query(
      collection(db, FOLLOWS_COL),
      where("followingId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      setFollowers(snap.docs.map((d) => d.data().followerId as string));
    });

    return unsub;
  }, [user]);

  const publishPost = useCallback(
    async (
      type: "workout" | "run",
      detail: string,
      refId: string,
      displayName: string,
    ) => {
      if (!user) return;
      await addDoc(collection(db, POSTS_COL), {
        userId: user.uid,
        displayName,
        type,
        detail,
        refId,
        likes: [],
        createdAt: Timestamp.now(),
      });
    },
    [user],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) return;
      const ref = doc(db, POSTS_COL, postId);
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.likes.includes(user.uid)) {
        await updateDoc(ref, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(ref, { likes: arrayUnion(user.uid) });
      }
    },
    [user, posts],
  );

  const followUser = useCallback(
    async (targetUserId: string) => {
      if (!user || targetUserId === user.uid) return;
      await addDoc(collection(db, FOLLOWS_COL), {
        followerId: user.uid,
        followingId: targetUserId,
        createdAt: Timestamp.now(),
      });
    },
    [user],
  );

  const unfollowUser = useCallback(
    async (targetUserId: string) => {
      if (!user) return;
      const q = query(
        collection(db, FOLLOWS_COL),
        where("followerId", "==", user.uid),
        where("followingId", "==", targetUserId),
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, FOLLOWS_COL, d.id));
      }
    },
    [user],
  );

  return {
    posts,
    following,
    followers,
    loading,
    publishPost,
    toggleLike,
    followUser,
    unfollowUser,
  };
}
