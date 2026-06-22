<div align="center">

# Coringa CMS

**CMS white-label em Next.js + Supabase para criar landing pages totalmente data-driven, com editor visual de blocos e dashboard administrativo.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## Visão geral

O **Coringa CMS** é uma base profissional para entregar sites institucionais e landing pages gerenciáveis sem tocar no código. A página pública é renderizada dinamicamente a partir do banco — ordem, conteúdo, estilo e visibilidade das seções vivem no Supabase e são editados por um construtor visual drag & drop. O foco está em performance, branding *white-label* e experiência de edição de nível premium.

## Funcionalidades

- **Landing page data-driven** — estrutura, textos, imagens, cores e visibilidade das seções vêm do banco; nada é hard-coded.
- **Editor visual de blocos** — canvas com drag & drop (desktop e mobile), biblioteca de seções, painel de propriedades com navegação *drill-in* por elemento e edição de texto inline no canvas.
- **Fluxo rascunho × publicado** — o auto-save grava o rascunho; o botão *Publicar* promove a versão ao vivo, permitindo editar com segurança sem afetar o site no ar.
- **Tema global white-label** — paleta de cores semânticas e tipografia aplicadas via CSS variables, com herança por seção (deixe um campo vazio para herdar do tema).
- **Dashboard administrativo** — área `/admin` protegida para gerir produtos, categorias, estatísticas e leads.
- **Autenticação segura** — login de administradores via Supabase Auth, com rotas `/admin/*` protegidas.
- **Exportação em PDF e captura de tela** — geração de cardápio/material em PDF e snapshots de seções.
- **UX animada** — transições fluidas com Framer Motion e ícones Lucide.

## Stack

| Camada | Tecnologias |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Estilo** | [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide](https://lucide.dev/) |
| **Editor** | [dnd-kit](https://dndkit.com/) (drag & drop), [Tiptap](https://tiptap.dev/) (rich text), [Zustand](https://zustand-demo.pmnd.rs/) (estado + undo/redo) |
| **Backend** | [Supabase](https://supabase.com/) — PostgreSQL + Auth + Storage |
| **Utilitários** | [DOMPurify](https://github.com/cure53/DOMPurify) (sanitização de HTML), [jsPDF](https://github.com/parallax/jsPDF), [modern-screenshot](https://github.com/qq15725/modern-screenshot) |

## Começando

### Pré-requisitos

- **Node.js 20+**
- Um projeto no [Supabase](https://supabase.com/)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/eduardoerig/coringa-cms.git
cd coringa-cms

# 2. Instale as dependências
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com as chaves do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Banco de dados

No **SQL Editor** do Supabase, execute os scripts da pasta `supabase/`:

1. `init-db.sql` — cria o schema base (tabelas, políticas e seeds).
2. `add-draft-publish.sql` — habilita o fluxo rascunho × publicado (necessário em bancos criados antes dessa separação).

### Execução

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para a landing page pública ou [/admin](http://localhost:3000/admin) para o painel.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build de produção |
| `npm run lint` | ESLint (flat config em `eslint.config.mjs`) |

> Não há framework de testes nem Prettier configurados no projeto.

## Arquitetura

- **Autenticação (Next.js 16):** o middleware foi renomeado para `proxy` — a sessão é validada em `src/proxy.ts`, que protege `/admin/*` e redireciona não autenticados para `/admin/login`. Não há camada de papéis: qualquer usuário autenticado é admin.
- **Data layer:** cliente Supabase JS direto (sem ORM). Use `src/utils/supabase/server.ts` em Server Components/rotas e `client.ts` no browser.
- **Rascunho × publicado:** `page_layouts.sections` guarda o rascunho (auto-save); `page_layouts.published_sections` é a versão ao vivo lida pela landing quando `is_published`. *Publicar* copia rascunho → publicado.
- **Theming:** cores semânticas e tipografia ficam em `site_settings` e são injetadas como CSS variables no root layout.
- **Segurança:** todo HTML vindo do usuário é sanitizado com DOMPurify antes de renderizar.

### Estrutura de pastas

```
src/
├── app/                      # Rotas (landing pública + /admin)
├── components/
│   ├── sections/             # Blocos da landing (Hero, About, Highlights, MenuSection,
│   │                         #   Franchise, Gallery, CTABanner, FooterBlock, TextBlock)
│   ├── editor/               # Editor visual: canvas, properties, library, registry
│   └── admin/                # UI do dashboard administrativo
├── stores/                   # Estado global (Zustand) com histórico undo/redo
├── utils/supabase/           # Clients Supabase (server / client / proxy)
└── proxy.ts                  # Autenticação e proteção de rotas
supabase/                     # Scripts SQL (init-db, add-draft-publish, ...)
```

### Adicionando uma nova seção

1. Crie o bloco em `src/components/sections/`.
2. Registre-o em `src/components/editor/sections/registry.ts` (campos editáveis, defaults e grupos).
3. Leia e aplique as props no componente com a cadeia de fallback de cores (campo vazio = herda do tema global).

## Licença

Projeto concebido como *boilerplate* para criar aplicações e sites gerenciáveis rapidamente.
