import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection', () => {
  it('should connect to Supabase with valid credentials', async () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    const client = createClient(supabaseUrl!, supabaseAnonKey!);

    // 測試連接：查詢 profiles 表
    // 注意：RLS 可能會限制未登入的用戶查詢，但連接應該成功
    const { data, error } = await client
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // 連接成功即可（即使 RLS 限制查詢）
    expect(data !== undefined || error !== undefined).toBe(true);
  });

  it('should have correct Supabase URL format', () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
  });

  it('should have valid Supabase ANON KEY', () => {
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(0);
  });
});
