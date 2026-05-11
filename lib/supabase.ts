import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 客戶端配置
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS !== 'web') {
      return SecureStore.getItemAsync(key);
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS !== 'web') {
      return SecureStore.setItemAsync(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (Platform.OS !== 'web') {
      return SecureStore.deleteItemAsync(key);
    }
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 類型定義
export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  rating: number;
  total_tasks_posted: number;
  total_tasks_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Errand {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  location: string;
  reward: number;
  deadline: string;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  accepted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  errand_id: string;
  user_id: string;
  bid_amount?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  errand_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  errand_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  errand_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
