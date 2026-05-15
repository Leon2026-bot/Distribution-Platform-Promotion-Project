-- 14-promoters-permissions.sql
-- 扩展 promoters 表：添加模块权限 JSONB 字段和 is_active 字段

-- 添加模块权限 JSONB 字段（默认全开）
ALTER TABLE promoters
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
  "dashboard": true,
  "products": true,
  "my_products": true,
  "custom": true,
  "links": true,
  "settings": true,
  "decorate": true
}'::jsonb;

-- 添加账号激活状态字段（与 status 区分：status 是业务状态，is_active 是账号开关）
ALTER TABLE promoters
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 为 is_active 添加索引
CREATE INDEX IF NOT EXISTS idx_promoters_is_active ON promoters(is_active);

-- 更新现有数据：将所有现有记录的权限设为全开，is_active 设为 true
UPDATE promoters
SET permissions = '{
  "dashboard": true,
  "products": true,
  "my_products": true,
  "custom": true,
  "links": true,
  "settings": true,
  "decorate": true
}'::jsonb,
is_active = true
WHERE permissions IS NULL OR is_active IS NULL;
