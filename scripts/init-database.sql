-- Profilesテーブル（ユーザー情報・管理者フラグ）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profilesテーブルのセキュリティ設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 全員が自分のプロファイルを閲覧可能
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- ユーザーは自分のプロファイルを更新可能（is_admin以外）
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- サインアップ時にプロファイルを作成可能
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Programsテーブル
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT[] NOT NULL,
  application_period TEXT,
  location TEXT,
  cost TEXT,
  application_process TEXT,
  official_url TEXT,
  format TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  device_id TEXT,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  device_id TEXT NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_reviews_program_id ON reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_device_id ON favorites(device_id);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_device_id ON drafts(device_id);

-- Row Level Securityを設定
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Policies を作成（Programsは誰でも読み取り可能）
CREATE POLICY "Programs are viewable by everyone" 
  ON programs FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert programs" 
  ON programs FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update programs" 
  ON programs FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can delete programs" 
  ON programs FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Profilesテーブルのセキュリティ
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
  ON reviews FOR UPDATE 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can delete own reviews" 
  ON reviews FOR DELETE 
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Commentsは同様の設定
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- FavoritesはユーザーとデバイスIDの両方をサポート
CREATE POLICY "Users can view own favorites" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id OR device_id IS NOT NULL);

CREATE POLICY "Users can create favorites" 
  ON favorites FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete own favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- DraftsはデバイスIDでもアクセス可能
CREATE POLICY "Users can view own drafts" 
  ON drafts FOR SELECT 
  USING (auth.uid() = user_id OR device_id IS NOT NULL);

CREATE POLICY "Users can create drafts" 
  ON drafts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own drafts" 
  ON drafts FOR UPDATE 
  USING (auth.uid() = user_id OR device_id IS NOT NULL);

CREATE POLICY "Users can delete own drafts" 
  ON drafts FOR DELETE 
  USING (auth.uid() = user_id OR device_id IS NOT NULL);
