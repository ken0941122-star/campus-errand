import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useApp } from '@/lib/app-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ReviewScreen() {
  const colors = useColors();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { state, submitReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const order = useMemo(() => state.orders.find((o) => o.id === orderId), [state.orders, orderId]);
  const isPublisher = order?.publisherId === 'local_user';
  const revieweeName = isPublisher ? order?.task.acceptorName : order?.task.publisherName;
  const revieweeId = isPublisher ? order?.acceptorId : order?.publisherId;

  const alreadyReviewed = useMemo(() => {
    if (!order) return false;
    return state.reviews.some((r) => r.orderId === orderId && r.reviewerId === 'local_user');
  }, [state.reviews, orderId, order]);

  if (!order) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>找不到此訂單</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary }}>返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleSubmit = async () => {
    if (!revieweeId) return;
    setSubmitting(true);
    try {
      await submitReview(orderId, revieweeId, rating, comment.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('評價成功！', '感謝你的評價，讓校園跑腿更美好！', [
        { text: '確定', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('評價失敗', '請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const s = styles(colors);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.navBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={s.navTitle}>給予評價</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {alreadyReviewed ? (
            <View style={s.alreadyReviewed}>
              <Text style={s.alreadyEmoji}>✅</Text>
              <Text style={s.alreadyTitle}>你已經評價過了</Text>
              <Text style={s.alreadySubtitle}>感謝你的評價！</Text>
              <TouchableOpacity style={s.backHomeBtn} onPress={() => router.back()} activeOpacity={0.8}>
                <Text style={s.backHomeBtnText}>返回</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Target User */}
              <View style={s.targetCard}>
                <View style={[s.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={s.avatarText}>{(revieweeName ?? '?').charAt(0)}</Text>
                </View>
                <View>
                  <Text style={s.targetRole}>{isPublisher ? '接單人' : '發單人'}</Text>
                  <Text style={s.targetName}>{revieweeName ?? '未知'}</Text>
                </View>
              </View>

              {/* Star Rating */}
              <Text style={s.sectionLabel}>評分</Text>
              <View style={s.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setRating(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name={i <= rating ? 'star.fill' : 'star'} size={40} color={i <= rating ? '#F59E0B' : colors.border} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.ratingLabel}>
                {rating === 1 ? '非常差' : rating === 2 ? '差' : rating === 3 ? '普通' : rating === 4 ? '好' : '非常好！'}
              </Text>

              {/* Comment */}
              <Text style={s.sectionLabel}>評語（選填）</Text>
              <TextInput
                style={s.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="分享你的合作體驗..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={s.charCount}>{comment.length}/200</Text>

              <TouchableOpacity
                style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <IconSymbol name="star.fill" size={18} color="#FFFFFF" />
                <Text style={s.submitBtnText}>{submitting ? '提交中...' : '提交評價'}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  content: { padding: 20 },
  targetCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, color: '#FFFFFF', fontWeight: '700' },
  targetRole: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  targetName: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 24 },
  commentInput: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, fontSize: 15, color: colors.foreground, borderWidth: 1, borderColor: colors.border, height: 100, marginBottom: 4 },
  charCount: { fontSize: 12, color: colors.muted, textAlign: 'right', marginBottom: 24 },
  submitBtn: { backgroundColor: '#F59E0B', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  alreadyReviewed: { alignItems: 'center', paddingTop: 60 },
  alreadyEmoji: { fontSize: 64, marginBottom: 16 },
  alreadyTitle: { fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  alreadySubtitle: { fontSize: 15, color: colors.muted, marginBottom: 32 },
  backHomeBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  backHomeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
