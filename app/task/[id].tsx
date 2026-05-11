import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { TASK_CATEGORIES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/lib/types';
import { formatDeadline, isTaskExpired } from '@/lib/storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function TaskDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, acceptTask, deleteTask } = useApp();

  const task = useMemo(() => state.tasks.find((t) => t.id === id), [state.tasks, id]);

  if (!task) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>找不到此任務</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 15 }}>返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const catInfo = TASK_CATEGORIES.find((c) => c.key === task.category);
  const isOwner = task.publisherId === 'local_user';
  const canAccept = task.status === 'open' && !isOwner;

  const handleAccept = () => {
    Alert.alert(
      '確認接單',
      `確定要接受「${task.title}」這個任務嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認接單',
          onPress: async () => {
            await acceptTask(task.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('接單成功！', '任務已加入你的訂單列表，請盡快完成任務。', [
              { text: '查看訂單', onPress: () => { router.back(); router.push('/(tabs)/orders' as any); } },
              { text: '繼續瀏覽', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      '確認刪除',
      '確定要刪除這個任務嗎？刪除後無法復原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('已刪除', '任務已刪除', [
              { text: '返回', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const s = styles(colors);

  return (
    <ScreenContainer>
      {/* Back Button */}
      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          <Text style={s.backText}>返回</Text>
        </TouchableOpacity>
        <View style={[s.statusBadge, { backgroundColor: TASK_STATUS_COLORS[task.status] + '20' }]}>
          <Text style={[s.statusText, { color: TASK_STATUS_COLORS[task.status] }]}>{TASK_STATUS_LABELS[task.status]}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Category & Title */}
        <View style={s.categoryBadge}>
          <Text style={s.categoryBadgeText}>{catInfo?.icon} {catInfo?.label}</Text>
        </View>
        <Text style={s.title}>{task.title}</Text>
        {task.description ? <Text style={s.description}>{task.description}</Text> : null}

        {/* Reward */}
        <View style={s.rewardCard}>
          <Text style={s.rewardLabel}>任務報酬</Text>
          <Text style={s.rewardAmount}>${task.reward}</Text>
          <Text style={s.rewardNote}>付款方式由雙方自行協商</Text>
        </View>

        {/* Info Cards */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={[s.infoIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol name="mappin" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>取件地點</Text>
              <Text style={s.infoValue}>{task.pickupLocation}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <View style={[s.infoIcon, { backgroundColor: colors.error + '20' }]}>
              <IconSymbol name="mappin.and.ellipse" size={18} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>送達地點</Text>
              <Text style={s.infoValue}>{task.deliveryLocation}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <View style={[s.infoIcon, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol name="clock.fill" size={18} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>截止時間</Text>
              <Text style={s.infoValue}>{formatDeadline(task.deadline)}</Text>
            </View>
          </View>
        </View>

        {/* Publisher */}
        <View style={s.publisherCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{task.publisherName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.publisherName}>{task.publisherName}</Text>
            <View style={s.ratingRow}>
              {[1,2,3,4,5].map((i) => (
                <IconSymbol key={i} name={i <= Math.round(task.publisherRating) ? 'star.fill' : 'star'} size={14} color="#F59E0B" />
              ))}
              <Text style={s.ratingText}>{task.publisherRating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={s.publisherLabel}>發單人</Text>
        </View>

        {isOwner && (
          <View style={s.ownerNote}>
            <IconSymbol name="info.circle" size={16} color={colors.primary} />
            <Text style={s.ownerNoteText}>這是你發布的任務</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Accept Button */}
      {canAccept && (
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
            <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
            <Text style={s.acceptBtnText}>接受任務</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Button */}
      {isOwner && (
        <View style={s.bottomBar}>
          <TouchableOpacity style={[s.acceptBtn, { backgroundColor: colors.error }]} onPress={handleDelete} activeOpacity={0.85}>
            <IconSymbol name="trash" size={20} color="#FFFFFF" />
            <Text style={s.acceptBtnText}>刪除任務</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 16, color: colors.foreground },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  content: { padding: 20 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  categoryBadgeText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground, marginBottom: 8, lineHeight: 30 },
  description: { fontSize: 15, color: colors.muted, lineHeight: 22, marginBottom: 16 },
  rewardCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  rewardLabel: { fontSize: 13, color: '#FFFFFF', opacity: 0.85, marginBottom: 4 },
  rewardAmount: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  rewardNote: { fontSize: 12, color: '#FFFFFF', opacity: 0.7 },
  infoCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  infoValue: { fontSize: 15, color: colors.foreground, fontWeight: '500' },
  divider: { height: 0.5, backgroundColor: colors.border, marginVertical: 12 },
  publisherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  publisherName: { fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 13, color: colors.muted, marginLeft: 4 },
  publisherLabel: { fontSize: 12, color: colors.muted },
  ownerNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary + '10', borderRadius: 12, padding: 12 },
  ownerNoteText: { fontSize: 14, color: colors.primary },
  bottomBar: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: colors.border, backgroundColor: colors.background },
  acceptBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  acceptBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
