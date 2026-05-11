-- 06-promoter_channels.sql
-- 推广者渠道配置表

CREATE TABLE promoter_channels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promoter_id     UUID REFERENCES promoters(id) ON DELETE CASCADE,
  platform_id     UUID REFERENCES agent_platforms(id) ON DELETE CASCADE,
  member_id       VARCHAR(200) NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promoter_id, platform_id)
);

ALTER TABLE promoter_channels ENABLE ROW LEVEL SECURITY;

-- 自己可读写
CREATE POLICY "channels_self_read" ON promoter_channels
  FOR SELECT USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "channels_self_write" ON promoter_channels
  FOR ALL USING (
    promoter_id IN (
      SELECT id FROM promoters WHERE user_id = auth.uid()
    )
  );

-- 管理员全权限
CREATE POLICY "channels_admin_all" ON promoter_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
