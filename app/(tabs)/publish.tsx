import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { TaskCategory, TASK_CATEGORIES } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc'

export default function PublishScreen() {
  const colors = useColors();
  const { publishTask } = useApp();
  const createTaskMutation = (trpc as any).tasks.create.useMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [reward, setReward] = useState('');
  const [deadlineHours, setDeadlineHours] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('請填寫任務標題'); return; }
    if (!pickupLocation.trim()) { Alert.alert('請填寫取件地點'); return; }
    if (!deliveryLocation.trim()) { Alert.alert('請填寫送達地點'); return; }
    const rewardNum = parseFloat(reward);
    if (isNaN(rewardNum) || rewardNum < 0) { Alert.alert('請填寫有效的報酬金額'); return; }
    const hoursNum = parseFloat(deadlineHours);
    if (isNaN(hoursNum) || hoursNum <= 0) { Alert.alert('請填寫有效的截止時間'); return; }

    setSubmitting(true);
    try {
      const deadline = new Date(Date.now() + hoursNum * 60 * 60 * 1000).toISOString();
      // 先發布到本地
      await publishTask({ title: title.trim(), description: description.trim(), category, pickupLocation: pickupLocation.trim(), deliveryLocation: deliveryLocation.trim(), reward: rewardNum, deadline });
      // 再發布到雲端
      await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        reward: rewardNum.toString(),
        deadline: new Date(deadline),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('發布成功', '你的任務已成功發布！', [{ text: '確定', onPress: () => { setTitle(''); setDescription(''); setPickupLocation(''); setDeliveryLocation(''); setReward(''); setDeadlineHours('2'); router.push('/(tabs)'); } }]);
    } catch (error) {
      Alert.alert('發布失敗', error instanceof Error ? error.message : '請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const s = styles(colors);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <Text style={s.headerTitle}>發布任務</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 任務類別 */}
          <Text style={s.sectionLabel}>任務類別</Text>
          <View style={s.categoryRow}>
            {TASK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[s.categoryChip, category === cat.key && s.categoryChipActive]}
                onPress={() => { setCategory(cat.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.7}
              >
                <Text style={s.categoryEmoji}>{cat.icon}</Text>
                <Text style={[s.categoryLabel, category === cat.key && s.categoryLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 任務標題 */}
          <Text style={s.sectionLabel}>任務標題 <Text style={s.required}>*</Text></Text>
          <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="例：幫我去7-11買飲料" placeholderTextColor={colors.muted} maxLength={40} returnKeyType="next" />

          {/* 任務描述 */}
          <Text style={s.sectionLabel}>詳細說明</Text>
          <TextInput style={[s.input, s.textArea]} value={description} onChangeText={setDescription} placeholder="請描述任務細節、特殊要求等..." placeholderTextColor={colors.muted} multiline numberOfLines={3} maxLength={200} textAlignVertical="top" />

          {/* 取件地點 */}
          <Text style={s.sectionLabel}>取件地點 <Text style={s.required}>*</Text></Text>
          <View style={s.inputWithIcon}>
            <IconSymbol name="mappin" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <TextInput style={s.inputFlex} value={pickupLocation} onChangeText={setPickupLocation} placeholder="例：學生餐廳一樓" placeholderTextColor={colors.muted} returnKeyType="next" />
          </View>

          {/* 送達地點 */}
          <Text style={s.sectionLabel}>送達地點 <Text style={s.required}>*</Text></Text>
          <View style={s.inputWithIcon}>
            <IconSymbol name="mappin.and.ellipse" size={18} color={colors.error} style={{ marginRight: 8 }} />
            <TextInput style={s.inputFlex} value={deliveryLocation} onChangeText={setDeliveryLocation} placeholder="例：宿舍 A 棟 302" placeholderTextColor={colors.muted} returnKeyType="next" />
          </View>

          {/* 報酬與截止時間 */}
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.sectionLabel}>報酬（元）<Text style={s.required}>*</Text></Text>
              <View style={s.inputWithIcon}>
                <Text style={[s.currencySymbol, { color: colors.primary }]}>$</Text>
                <TextInput style={s.inputFlex} value={reward} onChangeText={setReward} placeholder="30" placeholderTextColor={colors.muted} keyboardType="numeric" returnKeyType="done" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionLabel}>截止時間（小時）</Text>
              <View style={s.inputWithIcon}>
                <IconSymbol name="clock.fill" size={18} color={colors.muted} style={{ marginRight: 8 }} />
                <TextInput style={s.inputFlex} value={deadlineHours} onChangeText={setDeadlineHours} placeholder="2" placeholderTextColor={colors.muted} keyboardType="numeric" returnKeyType="done" />
              </View>
            </View>
          </View>

          {/* 提交按鈕 */}
          <TouchableOpacity
            style={[s.submitBtn, submitting && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || createTaskMutation.isPending}
            activeOpacity={0.85}
          >
            <Text style={s.submitBtnText}>{submitting ? '發布中...' : '立即發布任務'}</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  content: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8, marginTop: 16 },
  required: { color: colors.error },
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  categoryChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  categoryEmoji: { fontSize: 20, marginBottom: 4 },
  categoryLabel: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  categoryLabelActive: { color: colors.primary },
  input: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.foreground, borderWidth: 1, borderColor: colors.border },
  textArea: { height: 80, paddingTop: 12 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  inputFlex: { flex: 1, fontSize: 15, color: colors.foreground },
  currencySymbol: { fontSize: 16, fontWeight: '700', marginRight: 6 },
  row: { flexDirection: 'row' },
  submitBtn: { marginTop: 28, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
