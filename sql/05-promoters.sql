-- 05-promoters.sql
-- 推广者主表

CREATE TABLE promoters (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username            VARCHAR(100) UNIQUE NOT NULL,
  display_name        VARCHAR(200),
  bio                 TEXT,
  avatar_url          TEXT,
  social_links        JSONB,
  theme_config        JSONB DEFAULT '{"banner_color": "#000000"}',
  banner_config       JSONB,
  default_platform_id UUID REFERENCES agent_platforms(id),
  status              VARCHAR(20) DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;

-- 公开可读（推广者店铺页）
CREATE POLICY "promoters_public_read" ON promoters
  FOR SELECT USING (status = 'active');

-- 自己可读写
CREATE POLICY "promoters_self_read" ON promoters
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "promoters_self_update" ON promoters
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- 管理员全权限
CREATE POLICY "promoters_admin_all" ON promoters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
