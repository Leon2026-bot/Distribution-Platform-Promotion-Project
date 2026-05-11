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
