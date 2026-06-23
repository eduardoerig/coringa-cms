-- ============================================================================
-- Meus blocos — blocos reutilizáveis salvos pelo usuário (editor)
-- Roda no SQL Editor do Supabase. Idempotente. Segue o padrão de `categories`.
-- ============================================================================

create table if not exists public.saved_blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('section', 'block')),
  type text not null,
  props jsonb not null default '{}',
  created_at timestamptz default now()
);

alter table public.saved_blocks enable row level security;

-- Editor é sempre autenticado (todo autenticado é admin). Leitura/escrita p/ autenticados.
drop policy if exists "auth_all_saved_blocks" on public.saved_blocks;
create policy "auth_all_saved_blocks"
  on public.saved_blocks for all
  to authenticated
  using (true)
  with check (true);
