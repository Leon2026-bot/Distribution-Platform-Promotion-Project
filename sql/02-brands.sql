-- 02-brands.sql
-- 品牌表

CREATE TABLE brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  logo_url        TEXT,
  product_count   INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (true);

CREATE POLICY "brands_admin_write" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
