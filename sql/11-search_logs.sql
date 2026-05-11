-- 11-search_logs.sql
-- 搜索雷达日志表

CREATE TABLE search_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query    VARCHAR(200) NOT NULL,
  result_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_logs_admin_read" ON search_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- 允许匿名插入
CREATE POLICY "search_logs_anon_insert" ON search_logs
  FOR INSERT WITH CHECK (true);
