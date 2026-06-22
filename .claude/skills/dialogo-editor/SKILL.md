---
name: dialogo-editor
description: Cria diálogos de confirmação e popups/modais dentro do editor do Coringa-CMS que NÃO encolhem nem se descentralizam com o zoom do canvas. Use quando o usuário disser que um popup/modal/confirmação aparece pequeno, no meio do preview do site em vez da tela, some/encolhe com zoom out, ou pedir uma confirmação de "remover/excluir" no editor (camada, seção, item).
disable-model-invocation: false
---

# Diálogos e popups no editor (sem quebrar com o zoom)

Argumento (`$ARGUMENTS`): o que o diálogo deve confirmar/mostrar (ex.: `confirmar remoção de item`, "popup aparece pequeno no canvas"). Se vier vazio, pergunte o que precisa ser confirmado/exibido e em qual componente.

## A armadilha (causa raiz — sempre verifique isto primeiro)

`position: fixed` **não** se ancora na viewport quando existe um ancestral com `transform` — ele se ancora nesse ancestral. O **canvas do editor aplica um `transform` de zoom**, então qualquer elemento `fixed` renderizado *dentro* do canvas (ex.: `SectionInCanvas`, componentes de seção, toolbars) escala junto com o zoom e centraliza no canvas, não na tela. É por isso que um popup "aparece pequeno no meio do preview" com zoom out.

**Correção:** renderizar o overlay num **portal para `document.body`**, fora da árvore transformada.

## Padrão correto (use sempre — não recrie diálogos inline)

O projeto já tem a infraestrutura pronta. **Não** escreva um `DeleteConfirm`/modal `fixed inset-0` inline dentro de um componente do canvas — esse é exatamente o bug.

1. **Hook + componente compartilhados:**
   - `useConfirm()` de `@/hooks/useConfirm` → retorna `{ confirm, confirmState, respondConfirm }`.
   - `<ConfirmDialog>` de `@/components/admin/ConfirmDialog` → já renderiza via `createPortal(..., document.body)` (guard `if (typeof document === "undefined") return null;` para SSR).

2. **No componente que dispara a confirmação:**
   ```tsx
   import { useConfirm } from "@/hooks/useConfirm";
   import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

   const { confirm, confirmState, respondConfirm } = useConfirm();

   const handleRemove = async () => {
     const ok = await confirm({
       title: "Remover seção?",
       message: "Esta seção será removida do layout. Você pode desfazer com Ctrl+Z.",
       variant: "danger",      // "danger" mostra ícone vermelho + botão vermelho
       confirmLabel: "Remover",
     });
     if (ok) removeSection(id);
   };
   ```
   - `confirm(options)` devolve `Promise<boolean>`. `ConfirmOptions`: `title` (obrigatório), `message?`, `confirmLabel?`, `cancelLabel?`, `variant?: "danger" | "default"`.
   - No JSX, renderize `<ConfirmDialog state={confirmState} onRespond={respondConfirm} />` uma vez. Por ser portado ao `body`, pode ficar em qualquer lugar da árvore — inclusive dentro do canvas.
   - Botão de ação: `onClick={(e) => { e.stopPropagation(); handleRemove(); }}` (o `stopPropagation` evita selecionar/propagar no canvas).

3. **Para um popup/modal NÃO-confirmação dentro do canvas:** aplique o mesmo princípio — `createPortal(conteúdo, document.body)` com o mesmo guard de SSR. Use overlay `fixed inset-0 z-[200] flex items-center justify-center` com backdrop, igual ao `ConfirmDialog`.

## Onde isto já está aplicado (referências e armadilhas conhecidas)

Existem **vários** caminhos de remoção — todos devem usar o `ConfirmDialog` portado, nunca um diálogo inline:
- `src/components/editor/SectionInCanvas.tsx` — lixeira da barra flutuante da seção **dentro do canvas** (foi a origem do bug "popup pequeno com zoom"; um `DeleteConfirm` inline `fixed` foi removido daqui).
- `src/components/editor/LayerPanel.tsx` — lixeira no painel de Camadas (cuidado: linha com `overflow-hidden` recortava diálogos `absolute` antigos).
- `src/app/admin/editor/focused/page.tsx` — tecla Delete / nível de página.

## Erros a não repetir

- **Não** use `useEffect(() => setMounted(true), [])` para "esperar montar" antes do portal — o ESLint do projeto barra com `react-hooks/set-state-in-effect`. Use o guard `if (typeof document === "undefined") return null;`.
- **Não** deixe um modal `fixed`/`absolute inset-0` renderizado dentro do canvas zoomado. Se vir isso, é o bug — porte para o `body`.
- **Não** crie um novo componente de confirmação; reutilize `useConfirm` + `ConfirmDialog`.

## Validação

- `npm run lint` — zero erros novos (em especial nenhum `react-hooks/set-state-in-effect`).
- Manual em `/admin/editor/focused`: com o canvas em ~35% de zoom, dispare a confirmação — o popup deve cobrir a tela inteira, centralizado e em tamanho normal, independente do zoom.
