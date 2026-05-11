-- 10-attribution_sessions.sql
-- 归因会话表

CREATE TABLE attribution_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           VARCHAR(100) NOT NULL UNIQUE,
  promoter_id          UUID REFERENCES promoters(id),
  promoter_username    VARCHAR(100),
  first_touch_ref      VARCHAR(100),
  last_touch_ref       VARCHAR(100),
  device_fingerprint   VARCHAR(200),
  device_type          VARCHAR(20),
  os                   VARCHAR(50),
  referrer             VARCHAR(500),
  utm_source           VARCHAR(100),
  utm_medium           VARCHAR(100),
  utm_campaign         VARCHAR(100),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  expires_at           TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_attribution_session_id ON attribution_sessions(session_id);
CREATE INDEX idx_attribution_promoter ON attribution_sessions(promoter_id);
CREATE INDEX idx_attribution_expires ON attribution_sessions(expires_at);

ALTER TABLE attribution_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attribution_admin_all" ON attribution_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- 允许匿名插入（API 用 service role key）
CREATE POLICY "attribution_anon_insert" ON attribution_sessions
  FOR INSERT WITH CHECK (true);
