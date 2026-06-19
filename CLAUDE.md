# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Coringa-CMS — CMS white-label em Next.js 16 (App Router) + Supabase. A landing page pública é
totalmente data-driven: ordem, props e visibilidade das seções vêm da tabela Supabase `page_layouts`
e são renderizadas por `src/components/layout/DynamicSections`. O dashboard admin fica em `src/app/admin`.

## Comandos

- `npm run dev` — servidor de desenvolvimento (http://localhost:3000)
- `npm run build` — build de produção
- `npm run lint` — ESLint (flat config em `eslint.config.mjs`)

Não há framework de testes nem Prettier configurados.

## Arquitetura

- **Next.js 16:** o middleware foi renomeado para `proxy`. A autenticação roda em `src/proxy.ts`
  (exporta `proxy`, não `middleware`), que chama `updateSession` de `src/utils/supabase/middleware.ts`.
- **Data layer:** cliente Supabase JS direto (sem Prisma/Drizzle). Clients em `src/utils/supabase/`
  — use `server.ts` em Server Components/rotas e `client.ts` no browser.
- **Auth:** Supabase email/senha. `/admin/*` é protegido pelo proxy (redireciona para `/admin/login`).
  Não há camada de papéis — qualquer usuário autenticado é admin com acesso total.
- **Page builder:** o editor (`src/components/editor/`) usa o store Zustand `src/stores/editorStore.ts`,
  que mantém histórico de undo/redo. Para adicionar um tipo de seção: crie o bloco em
  `src/components/sections/` e registre-o em `src/components/editor/sections/registry.ts`.
- **Theming:** cores semânticas ficam na tabela `site_settings` e são injetadas como CSS variables
  num `<style>` no root layout (`src/app/layout.tsx`). Tailwind 4 via `@tailwindcss/postcss`.
- Sanitize qualquer HTML vindo do usuário com DOMPurify antes de renderizar.

## Convenções

- TypeScript strict; importe pelo alias `@/*` (→ `./src/*`).
- Código e mensagens de commit em português (pt-BR).

## Setup

Variáveis de ambiente necessárias em `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Inicialize o banco rodando
`supabase/init-db.sql` no SQL editor do Supabase.
