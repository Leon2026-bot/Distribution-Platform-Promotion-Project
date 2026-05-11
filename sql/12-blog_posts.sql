-- 12-blog_posts.sql
-- Blog 文章表

CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(300) NOT NULL,
  slug            VARCHAR(300) UNIQUE NOT NULL,
  excerpt         VARCHAR(500),
  content         TEXT NOT NULL,
  cover_image     TEXT,
  seo_title       VARCHAR(100),
  seo_description VARCHAR(300),
  focus_keyword   VARCHAR(100),
  related_products UUID[],
  tags            TEXT[],
  status          VARCHAR(20) DEFAULT 'draft',
  is_ai_generated BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  author_id       UUID REFERENCES auth.users(id),
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 公开可读（已发布）
CREATE POLICY "blog_public_read" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "blog_admin_all" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
