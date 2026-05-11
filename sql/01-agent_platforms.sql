-- 01-agent_platforms.sql
-- 代购平台表

CREATE TABLE agent_platforms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(100) NOT NULL,
  slug                VARCHAR(100) UNIQUE NOT NULL,
  logo_url            TEXT,
  website_url         TEXT,
  jump_url_template   TEXT NOT NULL,
  site_promo_code     VARCHAR(200),
  supported_sources   TEXT[],
  fee_description     TEXT,
  is_active           BOOLEAN DEFAULT true,
  display_order       INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public read, admin write
ALTER TABLE agent_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_platforms_public_read" ON agent_platforms
  FOR SELECT USING (true);

CREATE POLICY "agent_platforms_admin_write" ON agent_platforms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
