-- جدول المقالات الطبية
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT 'عام',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);

-- RLS Policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة المقالات المنشورة
CREATE POLICY "Allow public read access to published articles"
  ON articles FOR SELECT
  TO public
  USING (is_published = true);

-- الأطباء والمشرفون يمكنهم إنشاء مقالات
CREATE POLICY "Allow doctors and admins to create articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المؤلف والمشرفون يمكنهم تحديث المقالات
CREATE POLICY "Allow authors and admins to update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- المشرفون فقط يمكنهم حذف المقالات
CREATE POLICY "Allow admins to delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
