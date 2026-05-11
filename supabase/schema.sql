-- ============================================
-- 校園跑腿 APP - Supabase Schema
-- ============================================

-- 1. 使用者表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_tasks_posted INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 跑腿任務表
CREATE TABLE IF NOT EXISTS errands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'food', 'document', 'shopping', 'delivery', 'other'
  location TEXT NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'accepted', 'completed', 'cancelled'
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. 接單報價表
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2),
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 訊息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. 交易紀錄表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  payment_method TEXT, -- 'cash', 'transfer', 'other'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. 評價表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 索引優化查詢效能
-- ============================================

CREATE INDEX idx_errands_user_id ON errands(user_id);
CREATE INDEX idx_errands_status ON errands(status);
CREATE INDEX idx_errands_deadline ON errands(deadline);
CREATE INDEX idx_errands_category ON errands(category);
CREATE INDEX idx_bids_errand_id ON bids(errand_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_messages_errand_id ON messages(errand_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_transactions_errand_id ON transactions(errand_id);
CREATE INDEX idx_reviews_errand_id ON reviews(errand_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- 行級安全性 (RLS) 規則
-- ============================================

-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Errands RLS
CREATE POLICY "Anyone can view open errands" ON errands FOR SELECT USING (status = 'open' OR auth.uid() = user_id);
CREATE POLICY "Users can view their own errands" ON errands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create errands" ON errands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own errands" ON errands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own errands" ON errands FOR DELETE USING (auth.uid() = user_id);

-- Bids RLS
CREATE POLICY "Users can view bids on their errands" ON bids FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT user_id FROM errands WHERE id = errand_id)
);
CREATE POLICY "Users can create bids" ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bids" ON bids FOR UPDATE USING (auth.uid() = user_id);

-- Messages RLS
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Transactions RLS
CREATE POLICY "Users can view their transactions" ON transactions FOR SELECT USING (
  auth.uid() = payer_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = payer_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = payer_id);

-- Reviews RLS
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================
-- 觸發器：自動更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_errands_updated_at BEFORE UPDATE ON errands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
