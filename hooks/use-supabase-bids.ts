import { useState } from 'react';
import { supabase, type Bid } from '@/lib/supabase';

export function useSupabaseBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取得任務的所有報價
  const fetchErrandBids = async (errandId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bids')
        .select('*')
        .eq('errand_id', errandId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBids(data as Bid[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得報價失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 取得用戶的所有報價
  const fetchUserBids = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bids')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBids(data as Bid[]);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得用戶報價失敗';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 建立報價
  const createBid = async (bid: Omit<Bid, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('bids')
        .insert([bid])
        .select()
        .single();

      if (createError) throw createError;
      setBids([data as Bid, ...bids]);
      return { data: data as Bid, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立報價失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  // 接受報價
  const acceptBid = async (bidId: string) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)
        .select()
        .single();

      if (updateError) throw updateError;

      setBids(bids.map((b) => (b.id === bidId ? (data as Bid) : b)));
      return { data: data as Bid, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '接受報價失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  // 拒絕報價
  const rejectBid = async (bidId: string) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('id', bidId)
        .select()
        .single();

      if (updateError) throw updateError;

      setBids(bids.map((b) => (b.id === bidId ? (data as Bid) : b)));
      return { data: data as Bid, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : '拒絕報價失敗';
      setError(message);
      return { data: null, error: message };
    }
  };

  return {
    bids,
    loading,
    error,
    fetchErrandBids,
    fetchUserBids,
    createBid,
    acceptBid,
    rejectBid,
  };
}
