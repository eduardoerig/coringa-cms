-- Migração: separação rascunho × publicado em page_layouts
-- Rode uma vez no SQL editor do Supabase em bancos já existentes.
--
-- Semântica:
--   sections           = rascunho (editado no Studio, gravado pelo auto-save)
--   published_sections = versão ao vivo (lida pela landing pública)

ALTER TABLE public.page_layouts
  ADD COLUMN IF NOT EXISTS published_sections JSONB NOT NULL DEFAULT '[]';

-- Backfill: o que já estava publicado vira a versão ao vivo.
-- Para linhas publicadas, copia o conteúdo atual de `sections` para `published_sections`.
UPDATE public.page_layouts
SET published_sections = sections
WHERE is_published = true
  AND (published_sections IS NULL OR published_sections = '[]'::jsonb);
