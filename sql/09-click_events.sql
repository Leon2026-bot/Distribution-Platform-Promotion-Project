-- 09-click_events.sql
-- 点击事件追踪表

CREATE TABLE click_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      VARCHAR(50) NOT NULL,
  product_id      UUID REFERENCES products(id),
  promoter_id     UUID REFERENCES promoters(id),
  platform_id     UUID REFERENCES agent_platforms(id),
  blog_id         UUID REFERENCES blog_posts(id),
  session_id      VARCHAR(100),
  ip_country      VARCHAR(10),
  referrer        TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_click_events_product ON click_events(product_id);
CREATE INDEX idx_click_events_promoter ON click_events(promoter_id);
CREATE INDEX idx_click_events_type ON click_events(event_type);
CREATE INDEX idx_click_events_created ON click_events(created_at DESC);

ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

-- 推广者只看自己的
CREATE POLICY "click_events_promoter_read" ON click_events
  FOR SELECT USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

-- 管理员全权限
CREATE POLICY "click_events_admin_all" ON click_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- 允许匿名插入（API 用 service role key）
CREATE POLICY "click_events_anon_insert" ON click_events
  FOR INSERT WITH CHECK (true);
