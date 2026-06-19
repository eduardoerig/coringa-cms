---
name: nova-secao
description: Cria um novo tipo de seção do page builder no Coringa-CMS — gera o componente em src/components/sections/ e faz os três registros em src/components/editor/sections/registry.ts. Use quando o usuário pedir para adicionar/criar uma nova seção, bloco ou tipo de seção ao editor/landing.
disable-model-invocation: false
---

# Criar nova seção do page builder

Argumento (`$ARGUMENTS`): descrição da seção desejada (ex.: `depoimentos`, "FAQ com perguntas e respostas", "faixa de logos de parceiros"). Se vier vazio, pergunte ao usuário o propósito da seção e quais campos editáveis ela precisa.

## Convenções deste projeto (não invente outras)

- Todo texto visível ao usuário (labels, placeholders, descriptions) é em **português (pt-BR)**.
- Componentes ficam em `src/components/sections/<NomePascal>.tsx` e são `"use client"`.
- Use `getSectionStyles` de `@/utils/sectionStyles` para aplicar fundo/padding (`styles.container`, `styles.style`, `styles.isDark`).
- Cores vêm de tokens semânticos nas props (`titleColor`, `subtitleColor`, `accentColor`, `btnBgColor`, `btnTextColor`). Quando vazias, faça fallback para CSS variables (`var(--color-text-900)`, `var(--color-text-600)`, `var(--color-primary)`) respeitando `styles.isDark`.
- Animações com `framer-motion` (`initial`/`whileInView`/`viewport={{ once: true }}`), igual às seções existentes.
- Conteúdo `richtext` SEMPRE renderizado via `DOMPurify.sanitize(...)` de `isomorphic-dompurify` em `dangerouslySetInnerHTML`. Nunca renderize HTML do usuário sem sanitizar.
- Ícones vêm de `lucide-react`.

## Passos

1. **Defina a identidade da seção:**
   - `type`: snake_case único (ex.: `testimonials`). Confirme que não existe em `sectionRegistry`/`sectionComponentMap` em `src/components/editor/sections/registry.ts`.
   - Nome do componente em PascalCase (ex.: `Testimonials`).
   - `label`, `description` e um ícone do `lucide-react` apropriado.
   - Os `fields` editáveis (com `category: "content"` por padrão) e seus `defaultProps`.

2. **Leia uma seção parecida como molde** antes de escrever — ex.: `src/components/sections/TextBlock.tsx` (simples) ou `Highlights.tsx`/`Gallery.tsx` (com `array`). Replique o estilo de código.

3. **Crie o componente** em `src/components/sections/<NomePascal>.tsx`:
   - Props tipadas com os campos da seção mais os tokens comuns de aparência e `[key: string]: any`.
   - `const styles = getSectionStyles(props || {});`
   - Wrapper `<section className={\`relative overflow-hidden ${styles.container}\`} style={styles.style}>`.
   - Exporte nomeado **e** default: `export function <Nome>(...)` + `export default <Nome>;`.

4. **Registre nos três pontos de `src/components/editor/sections/registry.ts`:**
   - **Import** do componente no topo (e do ícone na lista de `lucide-react`).
   - Entrada em `sectionComponentMap`: `<type>: <Nome>,`.
   - Entrada em `sectionRegistry` seguindo o shape de `SectionRegistryEntry`. Para os campos de aparência padrão, **reutilize** `...COMMON_APPEARANCE_FIELDS` nos `fields` e `...COMMON_APPEARANCE_DEFAULTS` nos `defaultProps` (não duplique manualmente os tokens). Adicione `maxInstances: 1` apenas se a seção deve ser única.
   - `defaultProps` deve ter uma chave para CADA `field` com `key` (exceto os cobertos pelos spreads comuns), senão o painel de propriedades abre vazio.

5. **Para campos `type: "array"`**: defina `itemFields` e um array de exemplo (ou `[]`) em `defaultProps`. Renderize com `.map(...)` no componente, como em `Gallery`/`Highlights`.

6. **Valide:** rode `npm run lint`. Garanta zero erros de TypeScript/ESLint nos arquivos tocados.

## Checklist final

- [ ] Componente criado, `"use client"`, com export nomeado + default.
- [ ] Import + `sectionComponentMap` + `sectionRegistry` atualizados (os três).
- [ ] `defaultProps` cobre todos os `fields`; aparência via spreads comuns.
- [ ] richtext sanitizado com DOMPurify.
- [ ] Labels/placeholders em pt-BR.
- [ ] `npm run lint` passou.
