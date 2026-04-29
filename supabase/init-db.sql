-- =================================================================
-- CORINGA CMS - SETUP COMPLETO DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase para iniciar um novo projeto.
-- =================================================================

-- ---------------------------------------------------------------
-- 1. TABELA: site_settings (Configurações globais + Tema)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    "group" TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública das configurações" ON public.site_settings;
CREATE POLICY "Leitura pública das configurações"
ON public.site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin pode atualizar configurações" ON public.site_settings;
CREATE POLICY "Admin pode atualizar configurações"
ON public.site_settings FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin pode inserir configurações" ON public.site_settings;
CREATE POLICY "Admin pode inserir configurações"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Seed: dados genéricos
INSERT INTO public.site_settings (key, value, "group", label, type)
VALUES
    -- Geral
    ('general_site_name', 'Coringa CMS', 'geral', 'Nome do Site', 'text'),
    ('general_maintenance_mode', 'false', 'geral', 'Modo Manutenção', 'switch'),

    -- Aparência / Tema
    ('theme_primary_color', '#0F172A', 'aparencia', 'Cor Primária', 'color'),
    ('theme_bg_color', '#FAFAFA', 'aparencia', 'Cor de Fundo', 'color'),
    ('theme_logo_url', '', 'aparencia', 'URL do Logo (horizontal)', 'url'),
    ('theme_favicon_url', '', 'aparencia', 'URL do Favicon', 'url'),
    ('theme_icon_url', '', 'aparencia', 'URL do Ícone (quadrado)', 'url'),

    -- Contato
    ('contact_whatsapp', '(11) 99999-9999', 'contato', 'WhatsApp (com DDD)', 'text'),
    ('contact_email', 'contato@coringacms.com.br', 'contato', 'E-mail de Contato', 'text'),
    ('contact_address', 'Av. Paulista, 1000 - São Paulo, SP', 'contato', 'Endereço Comercial', 'textarea'),

    -- Redes Sociais
    ('social_instagram', 'https://instagram.com/', 'social', 'Instagram URL', 'url'),
    ('social_facebook', 'https://facebook.com/', 'social', 'Facebook URL', 'url'),
    ('social_tiktok', 'https://tiktok.com/', 'social', 'TikTok URL', 'url'),

    -- Marketing & SEO
    ('marketing_ga_id', '', 'marketing', 'Google Analytics ID (GA4)', 'text'),
    ('marketing_pixel_id', '', 'marketing', 'Facebook Pixel ID', 'text'),
    ('marketing_cta_link', '#', 'marketing', 'Link do CTA principal', 'url'),
    ('marketing_cta_label', 'Acessar Agora', 'marketing', 'Texto do botão CTA', 'text'),
    ('seo_description', 'Bem-vindo ao nosso site. Descubra nossas soluções inovadoras.', 'marketing', 'Meta Descrição Global', 'textarea'),

    -- Rodapé
    ('footer_company_name', 'Coringa Tecnologia Ltda.', 'rodape', 'Razão Social / Nome', 'text'),
    ('footer_cnpj', '00.000.000/0001-00', 'rodape', 'CNPJ', 'text'),
    ('footer_description', 'Desenvolvendo as melhores experiências digitais.', 'rodape', 'Descrição no Rodapé', 'textarea')
ON CONFLICT (key) DO UPDATE
SET "group" = EXCLUDED."group",
    label = EXCLUDED.label,
    type = EXCLUDED.type;


-- ---------------------------------------------------------------
-- 2. TABELA: categories
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_all_categories" ON public.categories;
CREATE POLICY "admin_all_categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---------------------------------------------------------------
-- 3. TABELA: products
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tag TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_all_products" ON public.products;
CREATE POLICY "admin_all_products"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---------------------------------------------------------------
-- 4. TABELA: leads (formulário de contato / franquia)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_leads" ON public.leads;
CREATE POLICY "public_insert_leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_leads" ON public.leads;
CREATE POLICY "admin_read_leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_leads" ON public.leads;
CREATE POLICY "admin_update_leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_leads" ON public.leads;
CREATE POLICY "admin_delete_leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (true);


-- ---------------------------------------------------------------
-- 5. TABELA: page_layouts (Editor Visual)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.page_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública dos layouts" ON public.page_layouts;
CREATE POLICY "Leitura pública dos layouts"
ON public.page_layouts FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin pode inserir layouts" ON public.page_layouts;
CREATE POLICY "Admin pode inserir layouts"
ON public.page_layouts FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin pode atualizar layouts" ON public.page_layouts;
CREATE POLICY "Admin pode atualizar layouts"
ON public.page_layouts FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin pode deletar layouts" ON public.page_layouts;
CREATE POLICY "Admin pode deletar layouts"
ON public.page_layouts FOR DELETE
TO authenticated
USING (true);

-- Seed: layout padrão genérico (Coringa)
INSERT INTO public.page_layouts (id, name, sections, is_published)
VALUES (
  'home',
  'Página Principal',
  '[
    {
      "id": "sec_hero",
      "type": "hero",
      "visible": true,
      "props": {
        "badge": "Qualidade Premium",
        "title": "A solução que conquista o mercado",
        "subtitle": "Transformando ideias em resultados extraordinários.",
        "ctaText": "Ver Catálogo",
        "ctaLink": "#cardapio",
        "ctaSecondaryText": "Mais Populares",
        "ctaSecondaryLink": "#destaques",
        "products": [
          {"src": "https://placehold.co/600x400/png", "alt": "Produto A", "description": "Qualidade garantida e excelência."},
          {"src": "https://placehold.co/600x400/png", "alt": "Produto B", "description": "Inovação e performance."},
          {"src": "https://placehold.co/600x400/png", "alt": "Produto C", "description": "Feito para a sua melhor experiência."}
        ]
      }
    },
    {
      "id": "sec_divider_scroll",
      "type": "divider",
      "visible": true,
      "props": {
        "style": "scroll_arrow"
      }
    },
    {
      "id": "sec_highlights",
      "type": "highlights",
      "visible": true,
      "props": {
        "title": "Nossos Queridinhos",
        "subtitle": "Descubra as soluções que fazem nossa fama em todo o país."
      }
    },
    {
      "id": "sec_menu",
      "type": "menu",
      "visible": true,
      "props": {
        "title": "Explore nosso Catálogo",
        "subtitle": "Mais de 100 opções preparadas com dedicação para você."
      }
    },
    {
      "id": "sec_about",
      "type": "about",
      "visible": true,
      "props": {
        "title": "Nossa História",
        "content": "<p>Nossa empresa nasceu com o sonho de levar as melhores soluções e experiências para nossos clientes.</p>",
        "buttonText": "Conheça a história completa",
        "buttonLink": "#",
        "image": "https://placehold.co/800x600/png"
      }
    },
    {
      "id": "sec_franchise",
      "type": "franchise",
      "visible": true,
      "props": {
        "title": "Seja um Parceiro",
        "description": "<p>Faça parte da nossa rede de parceiros e transforme o mercado na sua região.</p>",
        "buttonText": "Quero ser um Parceiro",
        "stats": [
          {"value": "100+", "label": "Unidades"},
          {"value": "10+", "label": "Anos de Experiência"}
        ],
        "image": "https://placehold.co/800x600/png"
      }
    }
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;


-- ---------------------------------------------------------------
-- 6. STORAGE: bucket para assets do site
-- ---------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets');

CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets');
