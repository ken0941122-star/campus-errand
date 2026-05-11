import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { TASK_CATEGORIES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/lib/types';
import { formatDeadline } from '@/lib/storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

const STATUS_STEPS = [
  { key: 'open', label: '待接單', icon: 'circle.dotted' as const },
  { key: 'accepted', label: '進行中', icon: 'arrow.right.circle.fill' as const },
  { key: 'completed', label: '已完成', icon: 'checkmark.seal.fill' as const },
];

export default function OrderDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, completeOrder, cancelOrder } = useApp();

  const order = useMemo(() => state.orders.find((o) => o.id === id), [state.orders, id]);

  if (!order) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 16 }}>找不到此訂單</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 15 }}>返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const isPublisher = order.publisherId === 'local_user';
  const isAcceptor = order.acceptorId === 'local_user';
  const catInfo = TASK_CATEGORIES.find((c) => c.key === order.task.category);
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const handleComplete = () => {
    Alert.alert(
      isAcceptor ? '確認完成任務' : '確認收貨',
      isAcceptor ? '確定已完成任務並送達？' : '確定已收到物品？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認',
          onPress: async () => {
            await completeOrder(order.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('訂單完成！', '感謝你的使用，記得互相評價喔！', [
              { text: '去評價', onPress: () => router.push(`/review/${order.id}` as any) },
              { text: '稍後再說', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('取消訂單', '確定要取消這個訂單嗎？', [
      { text: '不取消', style: 'cancel' },
      {
        text: '確認取消',
        style: 'destructive',
        onPress: async () => {
          await cancelOrder(order.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  const s = styles(colors);

  return (
    <ScreenContainer>
      <View style={s.navBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          <Text style={s.backText}>返回</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>訂單詳情</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        {!isCancelled ? (
          <View style={s.timelineCard}>
            <Text style={s.sectionTitle}>訂單進度</Text>
            <View style={s.timeline}>
              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <View key={step.key} style={s.timelineStep}>
                    <View style={[s.timelineDot, isActive && s.timelineDotActive, isCurrent && s.timelineDotCurrent]}>
                      <IconSymbol name={step.icon} size={16} color={isActive ? '#FFFFFF' : colors.border} />
                    </View>
                    <Text style={[s.timelineLabel, isActive && s.timelineLabelActive]}>{step.label}</Text>
                    {idx < STATUS_STEPS.length - 1 && (
                      <View style={[s.timelineLine, idx < currentStepIdx && s.timelineLineActive]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={[s.timelineCard, { backgroundColor: colors.error + '10' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="xmark.circle.fill" size={22} color={colors.error} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.error }}>訂單已取消</Text>
            </View>
          </View>
        )}

        {/* Task Info */}
        <View style={s.infoCard}>
          <View style={s.catBadge}>
            <Text style={s.catBadgeText}>{catInfo?.icon} {catInfo?.label}</Text>
          </View>
          <Text style={s.taskTitle}>{order.task.title}</Text>
          {order.task.description ? <Text style={s.taskDesc}>{order.task.description}</Text> : null}

          <View style={s.divider} />
          <View style={s.detailRow}>
            <IconSymbol name="mappin" size={15} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>取件地點</Text>
              <Text style={s.detailValue}>{order.task.pickupLocation}</Text>
            </View>
          </View>
          <View style={s.detailRow}>
            <IconSymbol name="mappin.and.ellipse" size={15} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>送達地點</Text>
              <Text style={s.detailValue}>{order.task.deliveryLocation}</Text>
            </View>
          </View>
          <View style={s.detailRow}>
            <IconSymbol name="clock.fill" size={15} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={s.detailLabel}>截止時間</Text>
              <Text style={s.detailValue}>{formatDeadline(order.task.deadline)}</Text>
            </View>
          </View>
        </View>

        {/* Reward */}
        <View style={s.rewardCard}>
          <Text style={s.rewardLabel}>任務報酬</Text>
          <Text style={s.rewardAmount}>${order.task.reward}</Text>
        </View>

        {/* Parties */}
        <View style={s.partiesCard}>
          <View style={s.partyRow}>
            <View style={[s.partyAvatar, { backgroundColor: colors.primary }]}>
              <Text style={s.partyAvatarText}>{order.task.publisherName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.partyRole}>發單人</Text>
              <Text style={s.partyName}>{order.task.publisherName}</Text>
            </View>
            {isPublisher && <Text style={s.youBadge}>你</Text>}
          </View>
          {order.task.acceptorName && (
            <>
              <View style={s.divider} />
              <View style={s.partyRow}>
                <View style={[s.partyAvatar, { backgroundColor: colors.success }]}>
                  <Text style={s.partyAvatarText}>{order.task.acceptorName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.partyRole}>接單人</Text>
                  <Text style={s.partyName}>{order.task.acceptorName}</Text>
                </View>
                {isAcceptor && <Text style={s.youBadge}>你</Text>}
              </View>
            </>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      {order.status === 'accepted' && (
        <View style={s.bottomBar}>
          {isPublisher && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={s.cancelBtnText}>取消訂單</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.completeBtn, isPublisher && { flex: 1 }]} onPress={handleComplete} activeOpacity={0.85}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
            <Text style={s.completeBtnText}>{isAcceptor ? '確認完成' : '確認收貨'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {order.status === 'completed' && (
        <View style={s.bottomBar}>
          <TouchableOpacity
            style={s.reviewBtn}
            onPress={() => router.push(`/review/${order.id}` as any)}
            activeOpacity={0.85}
          >
            <IconSymbol name="star.fill" size={18} color="#FFFFFF" />
            <Text style={s.reviewBtnText}>給予評價</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 60 },
  backText: { fontSize: 16, color: colors.foreground },
  navTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  content: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
  timelineCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timelineStep: { flex: 1, alignItems: 'center', position: 'relative' },
  timelineDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  timelineDotActive: { backgroundColor: colors.success },
  timelineDotCurrent: { backgroundColor: colors.primary },
  timelineLabel: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  timelineLabelActive: { color: colors.foreground, fontWeight: '600' },
  timelineLine: { position: 'absolute', top: 18, left: '60%', right: '-60%', height: 2, backgroundColor: colors.border },
  timelineLineActive: { backgroundColor: colors.success },
  infoCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  catBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  catBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  taskTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  taskDesc: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 4 },
  divider: { height: 0.5, backgroundColor: colors.border, marginVertical: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  detailLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  detailValue: { fontSize: 14, color: colors.foreground, fontWeight: '500' },
  rewardCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.85 },
  rewardAmount: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  partiesCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  partyAvatarText: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  partyRole: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  partyName: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  youBadge: { fontSize: 12, color: colors.primary, fontWeight: '700', backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bottomBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 10, borderTopWidth: 0.5, borderTopColor: colors.border, backgroundColor: colors.background },
  cancelBtn: { borderWidth: 1.5, borderColor: colors.error, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: colors.error, fontSize: 15, fontWeight: '600' },
  completeBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  completeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  reviewBtn: { flex: 1, backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  reviewBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
