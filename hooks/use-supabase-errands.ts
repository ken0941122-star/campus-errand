import { useEffect, useState } from 'react';
import { supabase, type Errand } from '@/lib/supabase';

export function useSupabaseErrands() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取得所有開放任務
  const fetchOpenErrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('errands')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setErrands(data as Errand[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得任務失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 取得用戶發布的任務
  const fetchUserErrands = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('errands')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setErrands(data as Errand[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得用戶任務失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 取得單個任務詳情
  const fetchErrandDetail = async (errandId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('errands')
        .select('*')
        .eq('id', errandId)
        .single();

      if (fetchError) throw fetchError;
      return { data: data as Errand, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得任務詳情失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 建立新任務
  const createErrand = async (errand: Omit<Errand, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('errands')
        .insert([errand])
        .select()
        .single();

      if (createError) throw createError;
      setErrands([data as Errand, ...errands]);
      return { data: data as Errand, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立任務失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  // 更新任務狀態
  const updateErrandStatus = async (errandId: string, status: string, acceptedBy?: string) => {
    try {
      setError(null);

      const updateData: any = { status };
      if (acceptedBy) {
        updateData.accepted_by = acceptedBy;
      }

      const { data, error: updateError } = await supabase
        .from('errands')
        .update(updateData)
        .eq('id', errandId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 更新本地狀態
      setErrands(
        errands.map((e) => (e.id === errandId ? (data as Errand) : e))
      );

      return { data: data as Errand, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新任務失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  // 刪除任務
  const deleteErrand = async (errandId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('errands')
        .delete()
        .eq('id', errandId);

      if (deleteError) throw deleteError;

      // 更新本地狀態
      setErrands(errands.filter((e) => e.id !== errandId));
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '刪除任務失敗';
      setError(message);
      return { error: message };
    }
  };

  // 按分類篩選
  const filterByCategory = async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('errands')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setErrands(data as Errand[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '篩選失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 搜尋任務
  const searchErrands = async (keyword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: searchError } = await supabase
        .from('errands')
        .select('*')
        .eq('status', 'open')
        .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });

      if (searchError) throw searchError;
      setErrands(data as Errand[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜尋失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    errands,
    loading,
    error,
    fetchOpenErrands,
    fetchUserErrands,
    fetchErrandDetail,
    createErrand,
    updateErrandStatus,
    deleteErrand,
    filterByCategory,
    searchErrands,
  };
}
