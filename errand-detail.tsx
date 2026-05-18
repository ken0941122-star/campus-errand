import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseBids } from "@/hooks/use-supabase-bids";
import { useColors } from "@/hooks/use-colors";

export default function ErrandDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { createBid, loading } = useSupabaseBids();

  const [bidAmount, setBidAmount] = useState("");

  // Mock errand data - 實際應該從路由參數或 Supabase 獲取
  const errand = {
    id: id as string,
    title: "幫我買咖啡",
    description: "需要從咖啡館買一杯拿鐵到圖書館",
    category: "餐飲",
    location: "圖書館一樓",
    reward: 50,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "open",
    user_id: "user-123",
  };

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      Alert.alert("錯誤", "請輸入報價");
      return;
    }

    try {
      await createBid({
        errand_id: errand.id,
        user_id: "",
        bid_amount: parseFloat(bidAmount),
        status: "pending",
      });

      Alert.alert("成功", "已提交報價");
      router.back();
    } catch (error) {
      Alert.alert("錯誤", "提交報價失敗");
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="gap-6">
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-base font-semibold">← 返回</Text>
          </TouchableOpacity>

          {/* Errand Card */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-4">
            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground">{errand.title}</Text>
              <View className="flex-row gap-2 items-center">
                <View className="bg-primary/20 rounded-full px-3 py-1">
                  <Text className="text-primary text-xs font-semibold">{errand.category}</Text>
                </View>
                <Text className="text-muted text-sm">{errand.location}</Text>
              </View>
            </View>

            <Text className="text-foreground">{errand.description}</Text>

            <View className="flex-row justify-between items-center pt-2 border-t border-border">
              <View>
                <Text className="text-muted text-sm">報酬</Text>
                <Text className="text-2xl font-bold text-primary">${errand.reward}</Text>
              </View>
              <View className="items-end">
                <Text className="text-muted text-sm">截止時間</Text>
                <Text className="text-foreground font-semibold">
                  {new Date(errand.deadline).toLocaleDateString("zh-TW")}
                </Text>
              </View>
            </View>
          </View>

          {/* Bid Section */}
          <View className="gap-4">
            <Text className="text-lg font-bold text-foreground">提交報價</Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">你的報價 (元)</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl text-primary">$</Text>
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground text-lg"
                  placeholder="50"
                  placeholderTextColor={colors.muted}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  editable={!loading}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary rounded-lg py-3 items-center"
              onPress={handlePlaceBid}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-semibold text-base">提交報價</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-primary/10 rounded-lg p-4">
            <Text className="text-sm text-foreground">
              提交報價後，發布者會收到通知。如果被接受，你需要完成任務並收取報酬。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}


