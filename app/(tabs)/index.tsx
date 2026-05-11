import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ListRenderItemInfo, ScrollView,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { trpc } from '@/lib/trpc';
import { Task, TaskCategory, TASK_CATEGORIES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/lib/types';
import { formatDeadline } from '@/lib/storage';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const ALL_CATEGORIES = [{ key: 'all' as const, label: '全部', icon: '🔍' }, ...TASK_CATEGORIES];

export default function HomeScreen() {
  const colors = useColors();
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<TaskCategory | 'all'>('all');

  // 使用 tRPC 查詢所有任務
  const { data: cloudTasks = [] } = trpc.tasks.list.useQuery();
  // 合併本地任務和雲端任務
  const allTasks = useMemo(() => [...state.tasks, ...cloudTasks], [state.tasks, cloudTasks]);

  const openTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (t.status !== 'open') return false;
      if (selectedCat !== 'all' && t.category !== selectedCat) return false;
      if (search.trim() && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.pickupLocation.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTasks, selectedCat, search]);

  const s = styles(colors);

  const renderTask = ({ item }: ListRenderItemInfo<Task>) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/task/${item.id}` as any); }}
      activeOpacity={0.75}
    >
      <View style={s.cardTop}>
        <View style={s.cardLeft}>
          <View style={s.categoryBadge}>
            <Text style={s.categoryBadgeText}>
              {TASK_CATEGORIES.find((c) => c.key === item.category)?.icon} {TASK_CATEGORIES.find((c) => c.key === item.category)?.label}
            </Text>
          </View>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.description ? <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
        </View>
        <View style={s.rewardBox}>
          <Text style={s.rewardText}>${item.reward}</Text>
        </View>
      </View>
      <View style={s.cardBottom}>
        <View style={s.locationRow}>
          <IconSymbol name="mappin" size={12} color={colors.muted} />
          <Text style={s.locationText} numberOfLines={1}>{item.pickupLocation}</Text>
        </View>
        <Text style={s.deadlineText}>{formatDeadline(item.deadline)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>探索任務</Text>
        <Text style={s.headerSubtitle}>找到你需要的幫手</Text>
      </View>

      {/* Search Bar */}
      <View style={s.searchContainer}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="搜尋任務..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Tabs */}
      <View style={s.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryList}
        >
          {ALL_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[s.categoryTab, selectedCat === item.key && s.categoryTabActive]}
              onPress={() => { setSelectedCat(item.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              <Text style={[s.categoryTabText, selectedCat === item.key && s.categoryTabTextActive]} numberOfLines={1}>
                {item.icon} {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks List */}
      {openTasks.length > 0 ? (
        <View style={s.listContent}>
          {openTasks.map((item) => (
            <View key={item.id.toString()}>
              {renderTask({ item, index: 0, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } })}
            </View>
          ))}
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>目前沒有任務</Text>
          <Text style={s.emptyDesc}>切換類別篩選後再來看看，或是前往「發單」發布任務！</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.foreground, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: colors.muted },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: colors.foreground },
  categoryContainer: { height: 60, paddingHorizontal: 12, marginBottom: 12 },
  categoryList: { gap: 8 },
  categoryTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryTabText: { fontSize: 13, fontWeight: '600', color: colors.muted, whiteSpace: 'nowrap' },
  categoryTabTextActive: { color: '#FFFFFF', fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardLeft: { flex: 1 },
  categoryBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  categoryBadgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  rewardBox: { backgroundColor: colors.primary + '10', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, justifyContent: 'center' },
  rewardText: { fontSize: 16, fontWeight: '800', color: colors.primary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.border },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  locationText: { fontSize: 12, color: colors.muted, flex: 1 },
  deadlineText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
