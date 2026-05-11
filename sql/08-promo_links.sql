-- 08-promo_links.sql
-- 推广链接表

CREATE TABLE promo_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id     UUID REFERENCES promoters(id) ON DELETE CASCADE,
  product_id      UUID,
  product_type    VARCHAR(20) DEFAULT 'standard',
  platform_id     UUID REFERENCES agent_platforms(id),
  promoter_code   VARCHAR(200),
  short_code      VARCHAR(50) UNIQUE NOT NULL,
  final_url       TEXT,
  click_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ
);

ALTER TABLE promo_links ENABLE ROW LEVEL SECURITY;

-- 自己可读写
CREATE POLICY "promo_links_self_read" ON promo_links
  FOR SELECT USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "promo_links_self_write" ON promo_links
  FOR ALL USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

-- 短链跳转不需要登录即可读
CREATE POLICY "promo_links_public_redirect" ON promo_links
  FOR SELECT USING (true);

-- 管理员全权限
CREATE POLICY "promo_links_admin_all" ON promo_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
