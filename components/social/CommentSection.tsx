import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { getComments, addComment } from "@/lib/socialApi";

export function CommentSection({ activityId }: { activityId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getComments(activityId).then(setComments);
  }, [activityId]);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    setSending(true);
    await addComment(activityId, user.uid, user.displayName || "User", text.trim());
    setText("");
    const updated = await getComments(activityId);
    setComments(updated);
    setSending(false);
  };

  return (
    <View className="mt-3 border-t border-[#2A2A3A]/50 pt-3">
      {comments.map((c: any) => (
        <View key={c.id} className="mb-2 flex-row gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#2A2A3A]">
            <Text className="text-[10px] font-bold text-white">
              {(c.authorName || "?").charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-white">
              <Text className="font-semibold">{c.authorName}</Text>{" "}
              <Text className="text-gray-400">{c.text}</Text>
            </Text>
          </View>
        </View>
      ))}

      <View className="mt-1 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-lg border border-[#2A2A3A] bg-[#0F0F14] px-3 py-2 text-xs text-white"
          placeholder="Add a comment..."
          placeholderTextColor="#6B7280"
          value={text}
          onChangeText={setText}
          editable={!sending}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          className="rounded-lg bg-brand px-3 py-2"
          onPress={handleSend}
          disabled={sending || !text.trim()}
          style={{ opacity: sending || !text.trim() ? 0.4 : 1 }}
        >
          <Text className="text-xs font-medium text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
