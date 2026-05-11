-- 07-promoter_products.sql
-- 推广者选品表

CREATE TABLE promoter_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id     UUID REFERENCES promoters(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  product_type    VARCHAR(20) DEFAULT 'standard',
  custom_name     VARCHAR(500),
  custom_price    DECIMAL(10,2),
  custom_image    TEXT,
  custom_url      TEXT,
  custom_category VARCHAR(100),
  custom_tags     TEXT[],
  display_order   INT DEFAULT 0,
  is_pinned       BOOLEAN DEFAULT false,
  status          VARCHAR(20) DEFAULT 'active',
  added_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promoter_id, product_id)
);

ALTER TABLE promoter_products ENABLE ROW LEVEL SECURITY;

-- 自己可读写
CREATE POLICY "pproducts_self_read" ON promoter_products
  FOR SELECT USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "pproducts_self_write" ON promoter_products
  FOR ALL USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

-- 管理员全权限
CREATE POLICY "pproducts_admin_all" ON promoter_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
