import { useState } from 'react';
import { supabase, type Review } from '@/lib/supabase';

export function useSupabaseReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取得用戶收到的評價
  const fetchUserReviews = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReviews(data as Review[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得評價失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 取得任務的評價
  const fetchErrandReviews = async (errandId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('errand_id', errandId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReviews(data as Review[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得任務評價失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 建立評價
  const createReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();

      if (createError) throw createError;
      setReviews([data as Review, ...reviews]);
      return { data: data as Review, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立評價失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  return {
    reviews,
    loading,
    error,
    fetchUserReviews,
    fetchErrandReviews,
    createReview,
  };
}
