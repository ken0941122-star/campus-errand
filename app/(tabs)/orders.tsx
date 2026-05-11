import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ListRenderItemInfo,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { Order, Task, TASK_CATEGORIES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/lib/types';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

type TabType = 'published' | 'accepted';

export default function OrdersScreen() {
  const colors = useColors();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('published');

  // 我發出的任務
  const publishedTasks = useMemo(
    () => state.tasks.filter((t) => t.publisherId === 'local_user'),
    [state.tasks]
  );

  // 我接的訂單
  const acceptedOrders = useMemo(
    () => state.orders.filter((o) => o.acceptorId === 'local_user'),
    [state.orders]
  );

  const s = styles(colors);

  const renderPublishedTask = ({ item }: ListRenderItemInfo<Task>) => {
    const catInfo = TASK_CATEGORIES.find((c) => c.key === item.category);
    const statusColor = TASK_STATUS_COLORS[item.status];
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/task/${item.id}` as any); }}
        activeOpacity={0.75}
      >
        <View style={s.cardHeader}>
          <View style={s.catBadge}>
            <Text style={s.catBadgeText}>{catInfo?.icon} {catInfo?.label}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[s.statusText, { color: statusColor }]}>{TASK_STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <Text style={s.taskTitle} numberOfLines={1}>{item.title}</Text>
        <View style={s.locationRow}>
          <IconSymbol name="mappin" size={13} color={colors.primary} />
          <Text style={s.locationText} numberOfLines={1}>{item.pickupLocation} → {item.deliveryLocation}</Text>
        </View>
        <View style={s.cardFooter}>
          <View style={s.rewardBadge}>
            <Text style={s.rewardText}>${item.reward} 報酬</Text>
          </View>
          {item.acceptorName && (
            <Text style={s.partnerText}>接單人：{item.acceptorName}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAcceptedOrder = ({ item }: ListRenderItemInfo<Order>) => {
    const catInfo = TASK_CATEGORIES.find((c) => c.key === item.task.category);
    const statusColor = TASK_STATUS_COLORS[item.status];
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/order/${item.id}` as any); }}
        activeOpacity={0.75}
      >
        <View style={s.cardHeader}>
          <View style={s.catBadge}>
            <Text style={s.catBadgeText}>{catInfo?.icon} {catInfo?.label}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[s.statusText, { color: statusColor }]}>{TASK_STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <Text style={s.taskTitle} numberOfLines={1}>{item.task.title}</Text>
        <View style={s.locationRow}>
          <IconSymbol name="mappin" size={13} color={colors.primary} />
          <Text style={s.locationText} numberOfLines={1}>{item.task.pickupLocation} → {item.task.deliveryLocation}</Text>
        </View>
        <View style={s.cardFooter}>
          <View style={s.rewardBadge}>
            <Text style={s.rewardText}>${item.task.reward} 報酬</Text>
          </View>
          <Text style={s.partnerText}>發單人：{item.task.publisherName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const displayItems = activeTab === 'published' ? publishedTasks : acceptedOrders;
  const renderItem = activeTab === 'published' ? renderPublishedTask : renderAcceptedOrder;

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Text style={s.headerTitle}>我的訂單</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'published' && s.tabActive]}
          onPress={() => { setActiveTab('published'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          activeOpacity={0.7}
        >
          <Text style={[s.tabText, activeTab === 'published' && s.tabTextActive]}>
            我發出的 {publishedTasks.length > 0 ? `(${publishedTasks.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'accepted' && s.tabActive]}
          onPress={() => { setActiveTab('accepted'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          activeOpacity={0.7}
        >
          <Text style={[s.tabText, activeTab === 'accepted' && s.tabTextActive]}>
            我接的 {acceptedOrders.length > 0 ? `(${acceptedOrders.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {displayItems.length > 0 ? (
        <View style={s.listContent}>
          {displayItems.map((item: any) => renderItem({ item, index: 0, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } }))}
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>
            {activeTab === 'published' ? '還沒發出任務' : '還沒接過任務'}
          </Text>
          <Text style={s.emptyDesc}>
            {activeTab === 'published' ? '前往「發單」發布任務吧！' : '前往「探索」接受任務吧！'}
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: 20, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  taskTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locationText: { fontSize: 12, color: colors.muted, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: colors.border },
  rewardBadge: { backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rewardText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  partnerText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
