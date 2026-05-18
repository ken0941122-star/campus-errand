import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseErrands } from "@/hooks/use-supabase-errands";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useColors } from "@/hooks/use-colors";

const CATEGORIES = ["餐飲", "文件", "購物", "其他"];

export default function CreateErrandScreen() {
  const router = useRouter();
  const colors = useColors();
  const { createErrand, loading } = useSupabaseErrands();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("其他");
  const [location, setLocation] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleCreateErrand = async () => {
    if (!title || !location || !reward) {
      Alert.alert("錯誤", "請填寫所有必填欄位");
      return;
    }

    try {
      const deadlineDate = deadline ? new Date(deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await createErrand({
        title,
        description,
        category,
        location,
        reward: parseFloat(reward),
        deadline: deadlineDate.toISOString(),
        user_id: "",
        status: "open",
      });

      Alert.alert("成功", "任務已發布");
      router.back();
    } catch (error) {
      Alert.alert("錯誤", "發布任務失敗");
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">發布新任務</Text>
            <Text className="text-sm text-muted">填寫任務詳情</Text>
          </View>

          {/* Title */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">任務標題 *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="例：幫我買咖啡"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          {/* Description */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">詳細說明</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="描述任務詳情..."
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              editable={!loading}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">分類</Text>
            <View className="flex-row gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`px-4 py-2 rounded-full ${
                    category === cat
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                  onPress={() => setCategory(cat)}
                  disabled={loading}
                >
                  <Text
                    className={
                      category === cat
                        ? "text-background font-semibold"
                        : "text-foreground"
                    }
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">位置 *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="例：圖書館一樓"
              placeholderTextColor={colors.muted}
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
          </View>

          {/* Reward */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">報酬 (元) *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="50"
              placeholderTextColor={colors.muted}
              value={reward}
              onChangeText={setReward}
              editable={!loading}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Deadline */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">截止時間</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="YYYY-MM-DD HH:mm"
              placeholderTextColor={colors.muted}
              value={deadline}
              onChangeText={setDeadline}
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-3 items-center mt-4"
            onPress={handleCreateErrand}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-semibold text-base">發布任務</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            className="border border-border rounded-lg py-3 items-center"
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text className="text-foreground font-semibold">取消</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
