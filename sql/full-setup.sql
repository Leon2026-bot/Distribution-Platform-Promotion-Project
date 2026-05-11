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
-- 03-categories.sql
-- 分类表

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  parent_id       UUID REFERENCES categories(id),
  product_count   INT DEFAULT 0,
  sort_order      INT DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_admin_write" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
-- 04-products.sql
-- 商品主表

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(500) NOT NULL,
  title_zh        VARCHAR(500),
  slug            VARCHAR(300) UNIQUE NOT NULL,
  description     TEXT,
  description_zh  TEXT,
  price_cny       DECIMAL(10,2) NOT NULL,
  price_usd       DECIMAL(10,2),
  images          TEXT[] NOT NULL,
  original_images TEXT[],
  brand           VARCHAR(100),
  category        VARCHAR(100) NOT NULL,
  sizes           JSONB,
  colors          TEXT[],
  source_type     VARCHAR(50) NOT NULL,
  source_url      TEXT,
  source_item_id  VARCHAR(200) NOT NULL,
  tags            TEXT[],
  seo_title       VARCHAR(100),
  seo_description VARCHAR(300),
  is_active       BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  view_count      INT DEFAULT 0,
  click_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_type, source_item_id)
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_source ON products(source_type, source_item_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_clicks ON products(click_count DESC);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
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
-- 12-blog_posts.sql
-- Blog 文章表

CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(300) NOT NULL,
  slug            VARCHAR(300) UNIQUE NOT NULL,
  excerpt         VARCHAR(500),
  content         TEXT NOT NULL,
  cover_image     TEXT,
  seo_title       VARCHAR(100),
  seo_description VARCHAR(300),
  focus_keyword   VARCHAR(100),
  related_products UUID[],
  tags            TEXT[],
  status          VARCHAR(20) DEFAULT 'draft',
  is_ai_generated BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  author_id       UUID REFERENCES auth.users(id),
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 公开可读（已发布）
CREATE POLICY "blog_public_read" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "blog_admin_all" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );
-- 13-trigger-handle-new-user.sql
-- 注册自动触发器：新用户注册时自动在 promoters 表创建记录

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.promoters (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
