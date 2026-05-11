-- 03-categories.sql
-- 分类表

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  parent_id       UUID REFERENCES categories(id),
  product_count   INT DEFAULT 0,
  sort_order      INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
