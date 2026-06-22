-- ============================================================================
-- Security hardening — Coringa CMS
-- Roda no SQL Editor do Supabase. Todas as instruções são idempotentes
-- (IF EXISTS), seguras para rodar mais de uma vez e em qualquer um dos
-- projetos (generic-site / coringa-cms).
--
-- Baseado no Security Advisor do Supabase. Cobre os WARN encontrados.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Buckets públicos: impedir LISTAGEM de arquivos
-- ----------------------------------------------------------------------------
-- Buckets públicos servem cada objeto pela URL pública (getPublicUrl) SEM
-- precisar de policy de SELECT em storage.objects. A policy ampla de SELECT só
-- habilita a API de `list()`, que o app NÃO usa — então removê-la impede que
-- terceiros enumerem todos os arquivos, sem quebrar a exibição das imagens.
--
-- (Os nomes variam entre os projetos; todos os DROPs são IF EXISTS.)
DROP POLICY IF EXISTS "Public Access"                          ON storage.objects;
DROP POLICY IF EXISTS "Acesso Público Leitura - site-assets"   ON storage.objects;
DROP POLICY IF EXISTS "Acesso Público Leitura - products"      ON storage.objects;

-- Verificação: depois de rodar, não deve sobrar policy de SELECT "para todos"
-- em storage.objects. Confira em Storage → Policies.


-- ----------------------------------------------------------------------------
-- 2. (OPCIONAL / defense-in-depth) Restringir escrita "authenticated = admin"
-- ----------------------------------------------------------------------------
-- Hoje as policies de escrita usam USING (true) para o papel `authenticated`,
-- ou seja: QUALQUER usuário logado tem acesso total de escrita. Isso é OK
-- ENQUANTO o cadastro público (sign-up) estiver DESATIVADO — só você cria
-- contas. **Esse é o controle principal: deixe o sign-up desligado.**
--
-- Se quiser uma camada extra (caso o sign-up precise ficar aberto algum dia),
-- crie uma allowlist de admins e troque o USING(true) por uma checagem real.
-- Descomente o bloco abaixo SOMENTE se for adotar esse modelo — do contrário
-- o painel admin para de gravar.
--
-- create table if not exists public.admins (
--   user_id uuid primary key references auth.users(id) on delete cascade
-- );
-- alter table public.admins enable row level security;
--
-- -- Cadastre seu próprio usuário (pegue o id em Authentication → Users):
-- -- insert into public.admins (user_id) values ('SEU-UUID-AQUI');
--
-- create or replace function public.is_admin()
-- returns boolean language sql stable security definer set search_path = public as $$
--   select exists (select 1 from public.admins a where a.user_id = auth.uid());
-- $$;
--
-- -- Exemplo para uma tabela; repita o padrão para products, categories,
-- -- page_layouts, site_settings (mantenha o INSERT público de `leads`!).
-- drop policy if exists "admin_all_products" on public.products;
-- create policy "admin_all_products" on public.products
--   for all to authenticated
--   using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 3. Proteção contra senhas vazadas (NÃO é SQL — é toggle no painel)
-- ----------------------------------------------------------------------------
-- Authentication → Providers → Email → "Leaked password protection" → ON.
-- Checa a senha contra o HaveIBeenPwned na criação/troca de senha.

-- ----------------------------------------------------------------------------
-- 4. Cadastro público (NÃO é SQL — é toggle no painel)
-- ----------------------------------------------------------------------------
-- Authentication → Sign In / Providers → "Allow new users to sign up" → OFF.
-- Mantenha desligado: como não há camada de papéis, todo usuário autenticado
-- é admin com acesso total.
