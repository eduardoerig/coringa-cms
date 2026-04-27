# Coringa CMS Boilerplate

Uma base sólida, moderna e totalmente dinâmica para criar Landing Pages profissionais com um poderoso Dashboard Administrativo (CMS) integrado. Desenvolvido com foco em alta performance, branding *white-label* e excelente experiência de usuário (UX).

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E)

## 🚀 Funcionalidades Principais

- **Landing Page Dinâmica**: Toda a estrutura da página principal (ordem das seções, textos, imagens e visibilidade) pode ser configurada sem tocar no código.
- **Dashboard Administrativo**: Um painel restrito e responsivo (`/admin`) para gestão do conteúdo.
- **Editor Visual "Drag & Drop"**: Ferramenta premium para edição da página principal, contendo biblioteca de blocos (Hero, About, Highlights, Gallery, CTA) e painel de propriedades. Reordenação otimizada tanto para desktop quanto para dispositivos móveis.
- **Autenticação Segura**: Gerenciamento de login de administradores utilizando o Supabase Auth.
- **Gestão de Entidades**: Gerencie produtos, categorias, estatísticas de destaque e captação de leads.
- **Design Premium**: Interface fluida animada com `framer-motion`, utilizando cores neutras e sistema de paletas semântico, facilmente adaptável a qualquer marca comercial (White Label).

## 🛠 Tecnologias Utilizadas

- **Front-end**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Animações & Ícones**: [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Back-end & Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Editor Rico**: [Tiptap](https://tiptap.dev/) para edição de textos
- **Validação de Dados**: [Zod](https://zod.dev/)

## 📦 Como rodar o projeto localmente

### Pré-requisitos
- Node.js versão 18+ ou superior.
- Um projeto criado no [Supabase](https://supabase.com/).

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/coringa-cms.git
cd coringa-cms
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

4. Inicialize o Banco de Dados:
Vá até a aba *SQL Editor* no Supabase e rode o script unificado presente no arquivo `supabase/init-db.sql`.

5. Inicie o servidor local:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a Landing Page ou acesse `/admin` para configurar seu CMS.

## 📁 Estrutura do Projeto

- `src/app`: Rotas da aplicação (Front-end público e rotas `/admin`).
- `src/components/sections`: Blocos de conteúdo da Landing Page (ex: Hero, Galeria).
- `src/components/editor`: Todo o ecossistema do construtor de páginas (Canvas, Properties, Library).
- `src/stores`: Gerenciamento de estado global com Zustand.
- `supabase/`: Scripts SQL unificados.

## 📄 Licença

Este projeto foi desenhado como um *Boilerplate* genérico para criar aplicações e sites gerenciáveis rapidamente.
