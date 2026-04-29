-- ===============================================================
-- CAMARIM ESTÉTICA - Atualização de Tema e Dados
-- Cole este SQL no SQL Editor do Supabase Dashboard
-- ===============================================================

-- === GERAL ===
UPDATE public.site_settings SET value = 'Camarim Estética, Spa e Saúde Integrada' WHERE key = 'general_site_name';

-- === APARÊNCIA / TEMA (Rosa + Dourado) ===
UPDATE public.site_settings SET value = '#C8687B' WHERE key = 'theme_primary_color';
UPDATE public.site_settings SET value = '#FFF8F6' WHERE key = 'theme_bg_color';
UPDATE public.site_settings SET value = '#D4AF37' WHERE key = 'theme_tertiary_color';
UPDATE public.site_settings SET value = '#A85068' WHERE key = 'theme_button_hover';
UPDATE public.site_settings SET value = '#2C2218' WHERE key = 'theme_heading_color';
UPDATE public.site_settings SET value = '#5C4A3A' WHERE key = 'theme_text_color';

-- === CONTATO ===
UPDATE public.site_settings SET value = '(45) 99840-4228' WHERE key = 'contact_whatsapp';
UPDATE public.site_settings SET value = 'franriechel@gmail.com' WHERE key = 'contact_email';
UPDATE public.site_settings SET value = 'Rua Dom Pedro I, 157 - Centro, Marechal Cândido Rondon/PR - CEP 85960-000' WHERE key = 'contact_address';

-- === REDES SOCIAIS ===
UPDATE public.site_settings SET value = 'https://instagram.com/camarimesteticaspaesaude' WHERE key = 'social_instagram';
UPDATE public.site_settings SET value = 'https://facebook.com/camarimesteticaspaesaude' WHERE key = 'social_facebook';
UPDATE public.site_settings SET value = '' WHERE key = 'social_tiktok';

-- === MARKETING & SEO ===
UPDATE public.site_settings SET value = 'Agende sua Sessão' WHERE key = 'marketing_cta_label';
UPDATE public.site_settings SET value = 'https://wa.me/5545998404228?text=Olá!%20Gostaria%20de%20agendar%20uma%20sessão.' WHERE key = 'marketing_cta_link';
UPDATE public.site_settings SET value = 'Camarim Estética, Spa e Saúde Integrada — o único spa urbano de Marechal Cândido Rondon. Tratamentos estéticos personalizados, harmonização facial, spa para casais, nutrição integrada e tecnologias de ponta. Sinta o poder do autocuidado!' WHERE key = 'seo_description';

-- === RODAPÉ ===
UPDATE public.site_settings SET value = 'Camarim Estetica e Spa LTDA' WHERE key = 'footer_company_name';
UPDATE public.site_settings SET value = '26.031.413/0001-27' WHERE key = 'footer_cnpj';
UPDATE public.site_settings SET value = 'Mais que estética, cuidamos de você. Clínica de estética personalizada com foco em autoestima, bem-estar e saúde integrada.' WHERE key = 'footer_description';

-- === INSERIR CHAVES QUE PODEM NÃO EXISTIR AINDA ===
INSERT INTO public.site_settings (key, value, "group", label, type)
VALUES
    ('theme_tertiary_color', '#D4AF37', 'aparencia', 'Cor Terciária (Destaques)', 'color'),
    ('theme_button_hover', '#A85068', 'aparencia', 'Cor Hover dos Botões', 'color'),
    ('theme_heading_color', '#2C2218', 'aparencia', 'Cor dos Títulos', 'color'),
    ('theme_text_color', '#5C4A3A', 'aparencia', 'Cor do Texto', 'color')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    "group" = EXCLUDED."group",
    label = EXCLUDED.label,
    type = EXCLUDED.type;

-- Verificação
SELECT key, value FROM public.site_settings ORDER BY key;
