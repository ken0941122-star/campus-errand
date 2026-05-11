import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput, Modal,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { clearAllStorage } from '@/lib/clear-storage';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const colors = useColors();
  const { state, updateUserName } = useApp();
  const { user, reviews, orders } = state;
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const myReviews = useMemo(
    () => reviews.filter((r) => r.revieweeId === 'local_user'),
    [reviews]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders]
  );

  const avgRating = useMemo(() => {
    if (myReviews.length === 0) return 5.0;
    return myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length;
  }, [myReviews]);

  const handleSaveName = async () => {
    if (!newName.trim()) { Alert.alert('暱稱不能為空'); return; }
    await updateUserName(newName.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingName(false);
  };

  const s = styles(colors);

  return (
    <ScreenContainer>
      <View style={s.header}>
        <Text style={s.headerTitle}>個人中心</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatarLarge}>
            <Text style={s.avatarLargeText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={s.profileInfo}>
            <View style={s.nameRow}>
              <Text style={s.userName}>{user.name}</Text>
              <TouchableOpacity
                onPress={() => { setNewName(user.name); setEditingName(true); }}
                style={s.editBtn}
                activeOpacity={0.7}
              >
                <IconSymbol name="pencil" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={s.ratingRow}>
              {[1,2,3,4,5].map((i) => (
                <IconSymbol key={i} name={i <= Math.round(avgRating) ? 'star.fill' : 'star'} size={16} color="#F59E0B" />
              ))}
              <Text style={s.ratingText}>{avgRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statNumber}>{user.totalPublished}</Text>
            <Text style={s.statLabel}>發布任務</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNumber}>{user.totalAccepted}</Text>
            <Text style={s.statLabel}>接受任務</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statNumber}>{completedOrders.length}</Text>
            <Text style={s.statLabel}>完成訂單</Text>
          </View>
        </View>

        {/* Reviews */}
        <Text style={s.sectionTitle}>我的評價 ({myReviews.length})</Text>
        {myReviews.length === 0 ? (
          <View style={s.emptyReviews}>
            <Text style={s.emptyEmoji}>⭐</Text>
            <Text style={s.emptyText}>還沒有收到評價</Text>
          </View>
        ) : (
          myReviews.map((review) => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.reviewStars}>
                  {[1,2,3,4,5].map((i) => (
                    <IconSymbol key={i} name={i <= review.rating ? 'star.fill' : 'star'} size={14} color="#F59E0B" />
                  ))}
                </View>
                <Text style={s.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              {review.comment ? (
                <Text style={s.reviewComment}>{review.comment}</Text>
              ) : (
                <Text style={s.reviewNoComment}>（無文字評語）</Text>
              )}
            </View>
          ))
        )}

        {/* About */}
        <View style={s.aboutCard}>
          <View style={s.aboutRow}>
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <Text style={s.aboutText}>校園跑腿 v1.0.0</Text>
          </View>
          <Text style={s.aboutDesc}>讓校園生活更便利的互助平台。付款方式由雙方自行協商。</Text>
        </View>

        <TouchableOpacity
          style={[s.aboutCard, { borderColor: colors.error, borderWidth: 1 }]}
          onPress={() => {
            Alert.alert('清除所有資料', '確定要清除所有任務、訂單和評價嗎？', [
              { text: '取消', style: 'cancel' },
              {
                text: '清除',
                style: 'destructive',
                onPress: async () => {
                  await clearAllStorage();
                  Alert.alert('已清除', '所有資料已清除，請重新啟動 APP');
                },
              },
            ]);
          }}
        >
          <View style={s.aboutRow}>
            <IconSymbol name="trash" size={20} color={colors.error} />
            <Text style={[s.aboutText, { color: colors.error }]}>清除所有資料（測試用）</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>修改暱稱</Text>
            <TextInput
              style={s.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="輸入你的暱稱"
              placeholderTextColor={colors.muted}
              maxLength={20}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setEditingName(false)} activeOpacity={0.7}>
                <Text style={s.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={handleSaveName} activeOpacity={0.85}>
                <Text style={s.modalSaveText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLargeText: { fontSize: 28, color: '#FFFFFF', fontWeight: '800' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.foreground },
  editBtn: { padding: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 14, color: colors.muted, marginLeft: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.muted },
  statDivider: { width: 0.5, backgroundColor: colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  emptyReviews: { alignItems: 'center', paddingVertical: 32, backgroundColor: colors.surface, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.muted },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: 12, color: colors.muted },
  reviewComment: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
  reviewNoComment: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },
  aboutCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: colors.border },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  aboutText: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  aboutDesc: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  modalCard: { width: '100%', backgroundColor: colors.background, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.foreground, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  modalSaveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalSaveText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
});
