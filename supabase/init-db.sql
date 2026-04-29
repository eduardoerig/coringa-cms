-- =================================================================
-- CAMARIM ESTÉTICA - SETUP COMPLETO DO BANCO DE DADOS
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
    ('general_site_name', 'Camarim Estética, Spa e Saúde Integrada', 'geral', 'Nome do Site', 'text'),
    ('general_maintenance_mode', 'false', 'geral', 'Modo Manutenção', 'switch'),

    -- Aparência / Tema
    ('theme_primary_color', '#C8687B', 'aparencia', 'Cor Primária', 'color'),
    ('theme_bg_color', '#FFF8F6', 'aparencia', 'Cor de Fundo', 'color'),
    ('theme_tertiary_color', '#D4AF37', 'aparencia', 'Cor Terciária (Destaques)', 'color'),
    ('theme_button_hover', '#A85068', 'aparencia', 'Cor Hover dos Botões', 'color'),
    ('theme_heading_color', '#2C2218', 'aparencia', 'Cor dos Títulos', 'color'),
    ('theme_text_color', '#5C4A3A', 'aparencia', 'Cor do Texto', 'color'),
    ('theme_logo_url', '', 'aparencia', 'URL do Logo (horizontal)', 'url'),
    ('theme_favicon_url', '', 'aparencia', 'URL do Favicon', 'url'),
    ('theme_icon_url', '', 'aparencia', 'URL do Ícone (quadrado)', 'url'),

    -- Contato
    ('contact_whatsapp', '(45) 99840-4228', 'contato', 'WhatsApp (com DDD)', 'text'),
    ('contact_email', 'franriechel@gmail.com', 'contato', 'E-mail de Contato', 'text'),
    ('contact_address', 'Rua Dom Pedro I, 157 - Centro, Marechal Cândido Rondon/PR - CEP 85960-000', 'contato', 'Endereço Comercial', 'textarea'),

    -- Redes Sociais
    ('social_instagram', 'https://instagram.com/camarimesteticaspaesaude', 'social', 'Instagram URL', 'url'),
    ('social_facebook', 'https://facebook.com/camarimesteticaspaesaude', 'social', 'Facebook URL', 'url'),
    ('social_tiktok', '', 'social', 'TikTok URL', 'url'),

    -- Marketing & SEO
    ('marketing_ga_id', '', 'marketing', 'Google Analytics ID (GA4)', 'text'),
    ('marketing_pixel_id', '', 'marketing', 'Facebook Pixel ID', 'text'),
    ('marketing_cta_link', 'https://wa.me/5545998404228?text=Olá!%20Gostaria%20de%20agendar%20uma%20sessão.', 'marketing', 'Link do CTA principal', 'url'),
    ('marketing_cta_label', 'Agende sua Sessão', 'marketing', 'Texto do botão CTA', 'text'),
    ('seo_description', 'Camarim Estética, Spa e Saúde Integrada — o único spa urbano de Marechal Cândido Rondon. Tratamentos estéticos personalizados, harmonização facial, spa para casais, nutrição integrada e tecnologias de ponta. Sinta o poder do autocuidado!', 'marketing', 'Meta Descrição Global', 'textarea'),

    -- Rodapé
    ('footer_company_name', 'Camarim Estetica e Spa LTDA', 'rodape', 'Razão Social / Nome', 'text'),
    ('footer_cnpj', '26.031.413/0001-27', 'rodape', 'CNPJ', 'text'),
    ('footer_description', 'Mais que estética, cuidamos de você. Clínica de estética personalizada com foco em autoestima, bem-estar e saúde integrada.', 'rodape', 'Descrição no Rodapé', 'textarea')
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

-- Seed: layout padrão Camarim Estética
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
        "badge": "✨ Spa Urbano Exclusivo",
        "title": "Sinta o poder do autocuidado",
        "subtitle": "Mais que estética, cuidamos de você. Tratamentos personalizados com tecnologia de ponta em Marechal Cândido Rondon.",
        "ctaText": "Nossos Serviços",
        "ctaLink": "#cardapio",
        "ctaSecondaryText": "Agende sua Sessão",
        "ctaSecondaryLink": "https://wa.me/5545998404228",
        "products": [
          {"src": "https://placehold.co/600x400/C8687B/FFFFFF/png?text=Harmonização+Facial", "alt": "Harmonização Facial", "description": "Realce sua beleza natural com técnicas avançadas."},
          {"src": "https://placehold.co/600x400/C8687B/FFFFFF/png?text=Spa+para+Casais", "alt": "Spa para Casais", "description": "Uma experiência única de relaxamento a dois."},
          {"src": "https://placehold.co/600x400/C8687B/FFFFFF/png?text=Ultraformer+MPT", "alt": "Ultraformer MPT", "description": "Lifting sem cirurgia com ultrassom microfocado."}
        ]
      }
    },
    {
      "id": "sec_divider_wave",
      "type": "divider",
      "visible": true,
      "props": {
        "style": "wave"
      }
    },
    {
      "id": "sec_highlights",
      "type": "highlights",
      "visible": true,
      "props": {
        "title": "Tratamentos em Destaque",
        "subtitle": "Descubra os procedimentos que transformam a autoestima dos nossos pacientes."
      }
    },
    {
      "id": "sec_divider_line",
      "type": "divider",
      "visible": true,
      "props": {
        "style": "line"
      }
    },
    {
      "id": "sec_menu",
      "type": "menu",
      "visible": true,
      "props": {
        "title": "Nossos Serviços",
        "subtitle": "Cuidado integral com protocolos personalizados para cada paciente."
      }
    },
    {
      "id": "sec_divider_space",
      "type": "divider",
      "visible": true,
      "props": {
        "style": "space"
      }
    },
    {
      "id": "sec_about",
      "type": "about",
      "visible": true,
      "props": {
        "title": "Nossa História",
        "content": "<p>Fundada em 2016, a <strong>Camarim Estética, Spa e Saúde Integrada</strong> nasceu com o propósito de oferecer cuidado integral e personalizado. Sob a direção da <strong>Dra. Luisa Vitória Miranda</strong> (Biomédica Esteta), nossa equipe de cerca de 10 profissionais especializados trabalha com dedicação para proporcionar autoestima, bem-estar e saúde.</p><p>Somos o <strong>único spa urbano de Marechal Cândido Rondon</strong> e região, oferecendo experiências exclusivas como spa para casais, spa para noivas e spa infantil. Em 2024, renovamos completamente nosso espaço para oferecer ainda mais conforto e excelência.</p>",
        "buttonText": "Conheça nosso espaço",
        "buttonLink": "https://instagram.com/camarimesteticaspaesaude",
        "image": "https://placehold.co/800x600/FFF8F6/C8687B/png?text=Camarim+Estética"
      }
    },
    {
      "id": "sec_franchise",
      "type": "franchise",
      "visible": true,
      "props": {
        "title": "Spa Urbano Exclusivo",
        "description": "<p>Viva uma experiência de relaxamento e renovação no <strong>único spa urbano de Marechal Cândido Rondon</strong>. Oferecemos pacotes exclusivos para casais, noivas, e até para os pequenos. Venha se cuidar!</p>",
        "buttonText": "Agende seu Spa",
        "stats": [
          {"value": "🏆 4x", "label": "Premiada"},
          {"value": "10+", "label": "Profissionais"},
          {"value": "2016", "label": "Desde"}
        ],
        "image": "https://placehold.co/800x600/FFF8F6/C8687B/png?text=Spa+Urbano"
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
