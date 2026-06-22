---
name: campo-editavel
description: Torna um elemento de uma seção do page builder totalmente editável no Coringa-CMS — adiciona campo de texto e/ou cor da paleta no registry e aplica no componente com a cadeia de fallback correta. Use quando o usuário disser que um elemento só deixa editar o texto mas não a cor (ou vice-versa), que um rótulo/selo/botão/stat não pode ser editado, ou pedir para "deixar editável" / "poder trocar a cor" de algo numa seção.
disable-model-invocation: false
---

# Tornar um elemento de seção totalmente editável

Argumento (`$ARGUMENTS`): qual elemento de qual seção precisa ficar editável (ex.: `cor do rótulo da seção Sobre`, "o botão do cardápio só edita o texto", "o selo do About"). Se vier vazio, pergunte qual seção e qual elemento (rótulo, botão, selo, stat, título...) e o que falta editar (texto, cor de fundo, cor do texto).

## Como o editor por blocos funciona (contexto)

O painel direito (`src/components/editor/PropertiesPanel.tsx`) é **drill-in**: ele agrupa os `fields` de cada seção por `group` e mostra um bloco/botão por elemento. Não há nada a mexer no painel — **ele monta a tela automaticamente a partir do `group` de cada campo** no registry. Campos `type: "color"` já caem no `InlineColorPicker` (mostra a paleta global). Portanto, "deixar editável" = **adicionar o `PropField` no `group` certo do registry + aplicar a prop no componente**.

Regra de cor do projeto: `""` (vazio) significa **herdar do Tema Global**. Toda cor tem fallback; nunca force uma cor fixa sem fallback.

## Passos

1. **Localize a seção** em `src/components/editor/sections/registry.ts` e ache (ou crie) o `group` do elemento (ex.: `"Rótulo"`, `"Botão CTA"`, `"Selo"`, `"Estatísticas"`). Os blocos de cor por elemento já têm helpers no topo do arquivo — reutilize quando servirem:
   - `TITLE_COLOR`, `EYEBROW_COLOR` (rótulo), `TEXT_COLOR(group)`, `BTN_COLORS(group)`.
   - Se nenhum servir, declare o `PropField` no mesmo formato:
     ```ts
     { key: "decalBgColor", label: "Cor do selo", type: "color", placeholder: "Automático", category: "appearance", group: "Selo" }
     ```
   - Convenções de `key`: sufixo `Color` para cor (`eyebrowColor`, `pdfBtnBgColor`, `statValueColor`). Texto sem sufixo.

2. **Adicione o campo aos `fields`** da seção, **no mesmo `group`** do texto correspondente, logo após o campo de texto do elemento (assim aparecem juntos no bloco). Texto → `category: "content"`; cor → `category: "appearance"`.

3. **Adicione o default em `defaultProps`** da MESMA seção — uma chave por `key` novo. Cor herdável = `""`. **Sem isso o bloco abre vazio** e a prop nunca chega ao componente.

4. **Aplique no componente** (`src/components/sections/<Nome>.tsx`):
   - Leia a prop: `const eyebrowColor = (editorProps?.eyebrowColor as string) || "";`
   - Aplique com cadeia de fallback (vazio → token do elemento → token semântico → cor crua). Ex. reais deste projeto:
     - Rótulo: `<Eyebrow color={eyebrowColor || accentColor} .../>`
     - Selo (About): `backgroundColor: decalBgColor || accentColor || btnBgColor || "..."`, `color: decalNumberColor || btnTextColor || "#FFFFFF"`
     - Stats (Franchise): `color: statValueColor || titleColor || "..."` e `color: statLabelColor || accentColor || "..."`
     - Texto inline opcional: `style={decalTextColor ? { color: decalTextColor } : undefined}`
   - Para botões use o primitivo `SoftButton` passando `bgColor` / `textColor` / `borderColor`. **Atenção:** a variante `secondary` do `SoftButton` só pinta o fundo se `bgColor` for passado (`backgroundColor: bgColor || "transparent"`).

5. **Edição inline de texto (grátis):** campos `type: "text"`/`"textarea"` de nível superior já são editáveis por duplo-clique no canvas via `SectionInCanvas` desde que o elemento no JSX tenha `data-field="<key>"`. Garanta que o elemento de texto tenha esse atributo. Itens de array usam `data-field` + `data-item-index`.

6. **Valide:** `npm run lint` — zero erros novos de TS/ESLint nos arquivos tocados.

## Checklist final

- [ ] `PropField` adicionado no `group` certo dos `fields` da seção.
- [ ] Chave correspondente em `defaultProps` (cor herdável = `""`).
- [ ] Prop lida e aplicada no componente com cadeia de fallback (nunca cor fixa sem fallback).
- [ ] Elemento de texto tem `data-field` (e `data-item-index` se for array).
- [ ] Labels/placeholders em pt-BR (`"Automático"` para cor herdável).
- [ ] `npm run lint` passou.
