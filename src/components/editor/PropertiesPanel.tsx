"use client";
import { useEditorStore, type PageSection } from "@/stores/editorStore";
import { sectionRegistry, type PropField, type SectionRegistryEntry } from "./sections/registry";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { blockRegistry } from "./blocks/blockRegistry";
import { findBlock, updateBlock, removeBlock, moveBlock, type ContainerRow } from "./blocks/containerModel";
import { canvasElementRegistry } from "./canvas/canvasElementRegistry";
import { findElement, setTransform, setDeviceTransform, resolveElement, resolveHeight, updateElementProps, removeElement, moveZ, type CanvasElement, type Viewport } from "./canvas/canvasModel";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

import { X, Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Palette, Settings2, Layout, ChevronDown as Down, Keyboard, RotateCcw, Type, MousePointerClick, Image as ImageIcon, Tag, LayoutGrid, SlidersHorizontal, Store, Share2, Square, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PropertiesPanel() {
  const { sections, selectedSectionId, selectSection, updateSectionProps, selectedBlock } = useEditorStore();
  const selectedSection = useMemo(() => sections.find((s) => s.id === selectedSectionId), [sections, selectedSectionId]);
  const entry = selectedSection ? sectionRegistry[selectedSection.type] : null;

  // Bloco ativo = campo/item selecionado no canvas que pertence a esta seção.
  // O realce permanece enquanto o bloco estiver selecionado (sem timeout).
  const activeBlock =
    selectedBlock && selectedBlock.sectionId === selectedSectionId ? selectedBlock : null;
  const targetKey = activeBlock?.fieldKey ?? null;
  const targetItem = activeBlock?.itemIndex;
  const targetField = entry?.fields.find((f) => f.key === targetKey) ?? null;
  const targetGroup = targetField?.group ?? null;

  // Navegação drill-in: qual elemento (group) está aberto no painel. `null` = lista.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  // Aba ativa: Conteúdo (textos/imagens) ou Estilo (cores/layout/aparência).
  const [tab, setTab] = useState<"content" | "style">("content");

  // Ao trocar de seção, volta para a lista de elementos.
  const [prevSectionId, setPrevSectionId] = useState(selectedSectionId);
  if (selectedSectionId !== prevSectionId) {
    setPrevSectionId(selectedSectionId);
    setOpenGroup(null);
    setTab("content");
  }

  // Ao clicar num elemento no canvas, entra automaticamente na tela dele.
  const [prevTargetGroup, setPrevTargetGroup] = useState(targetGroup);
  if (targetGroup !== prevTargetGroup) {
    setPrevTargetGroup(targetGroup);
    if (targetGroup) {
      setOpenGroup(targetGroup);
      // Leva para a aba certa conforme o tipo do campo clicado no canvas.
      setTab(targetField?.category === "appearance" ? "style" : "content");
    }
  }

  // Rola até o campo (ou item de lista) alvo quando a seleção muda no canvas.
  useEffect(() => {
    if (!targetKey) return;
    const selector =
      targetItem != null
        ? `[data-item-key="${targetKey}#${targetItem}"]`
        : `[data-field-key="${targetKey}"]`;
    const el = document.querySelector(selector);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [targetKey, targetItem]);

  const { confirm, confirmState, respondConfirm } = useConfirm();
  const { resetTheme } = useEditorStore();

  if (selectedSectionId === "global_theme") {
    return (
      <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-black text-zinc-900 text-sm tracking-tight">Tema Global</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Identidade Visual</p>
          </div>
          <button onClick={() => selectSection(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <Accordion title="Paleta de Cores" icon={<Palette className="w-4 h-4" />} defaultOpen>
            <div className="space-y-5">
              <p className="text-[10px] text-zinc-400">
                O gerenciamento de cores e tipografia está na aba <strong>Paleta Global</strong> no painel lateral esquerdo.
              </p>
            </div>
          </Accordion>

          <div className="pt-2">
            <button
              onClick={async () => {
                const ok = await confirm({
                  title: "Resetar tema?",
                  message: "Isso irá redefinir todas as cores para o padrão neutro.",
                  variant: "danger",
                  confirmLabel: "Resetar",
                });
                if (ok) resetTheme();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Resetar para Padrões Neutros
            </button>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
            <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mb-2 font-bold"><Keyboard className="w-3 h-3" /> Atalhos</p>
            <div className="space-y-1.5">
              {[["Ctrl+K", "Adicionar seção"], ["Ctrl+S", "Salvar"], ["Ctrl+D", "Duplicar seção"], ["Delete", "Remover seção"], ["Esc", "Desselecionar"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">{v}</span>
                  <kbd className="text-[9px] font-black bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md text-zinc-600 shadow-sm">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ConfirmDialog state={confirmState} onRespond={respondConfirm} tone="light" />
      </div>
    );
  }

  if (!selectedSection || !entry) {
    return (
      <div className="w-full bg-white flex flex-col h-full items-center justify-center p-8 text-center select-none">
        <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center mb-5 border-2 border-dashed border-zinc-200">
          <Settings2 className="w-8 h-8 text-zinc-200" />
        </div>
        <p className="text-[13px] font-black text-zinc-900 mb-2">Nada selecionado</p>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-[200px] mb-6">Clique em uma seção no canvas para editar suas propriedades.</p>
        <div className="w-full max-w-[220px] space-y-1.5 text-left">
          {[["Ctrl+K", "Adicionar seção"], ["Ctrl+S", "Salvar alterações"], ["Ctrl+D", "Duplicar seção"], ["Delete", "Remover seção"], ["Esc", "Desselecionar"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-100">
              <span className="text-[10px] text-zinc-500 font-medium">{v}</span>
              <kbd className="text-[9px] font-black bg-white border border-zinc-200 px-1.5 py-0.5 rounded-md text-zinc-600">{k}</kbd>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Container (layout livre): painel dedicado de blocos.
  if (selectedSection.type === "container") {
    return <ContainerProperties section={selectedSection} entry={entry} />;
  }

  // Tela Livre (canvas): painel dedicado de elemento/tela.
  if (selectedSection.type === "canvas") {
    return <CanvasProperties section={selectedSection} entry={entry} />;
  }

  // Agrupar campos por elemento (group), preservando a ordem de primeira aparição.
  const groups: { name: string; fields: PropField[] }[] = [];
  const groupIndex = new Map<string, number>();
  for (const f of entry.fields) {
    const g = f.group ?? "Geral";
    let i = groupIndex.get(g);
    if (i === undefined) { i = groups.length; groupIndex.set(g, i); groups.push({ name: g, fields: [] }); }
    groups[i].fields.push(f);
  }
  const activeGroup = openGroup ? groups.find((g) => g.name === openGroup) ?? null : null;
  const arrayCount = (f: PropField) =>
    Array.isArray(selectedSection.props[f.key]) ? (selectedSection.props[f.key] as unknown[]).length : 0;

  // Filtro por aba: Conteúdo = tudo que não é aparência; Estilo = aparência.
  const matchTab = (f: PropField) => (tab === "style" ? f.category === "appearance" : f.category !== "appearance");
  const visibleGroups = groups
    .map((g) => ({ name: g.name, shown: g.fields.filter(matchTab) }))
    .filter((g) => g.shown.length > 0);
  const detailFields = activeGroup ? activeGroup.fields.filter(matchTab) : [];
  const changeTab = (t: "content" | "style") => { setTab(t); setOpenGroup(null); };

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {activeGroup ? (
            <button onClick={() => setOpenGroup(null)} aria-label="Voltar para a lista de elementos" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Layout className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 text-[13px] truncate">{activeGroup ? activeGroup.name : entry.label}</h3>
            {activeGroup ? (
              <p className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                <button onClick={() => setOpenGroup(null)} className="text-zinc-500 hover:text-zinc-900 transition-colors truncate" title="Voltar para a lista de elementos">
                  {entry.label}
                </button>
                <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
                <span className="text-zinc-700 truncate">{activeGroup.name}</span>
              </p>
            ) : (
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                Escolha um elemento p/ editar
              </p>
            )}
          </div>
          <button onClick={() => selectSection(null)} aria-label="Fechar painel" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Abas Conteúdo / Estilo */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {([["content", "Conteúdo", Type], ["style", "Estilo", Palette]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => changeTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                tab === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {activeGroup ? (
        /* Detalhe: todos os campos do elemento (texto + cores da paleta) */
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {detailFields.map((f) => (
            <div key={f.key} data-field-key={f.key} className={cn("scroll-mt-4 rounded-2xl transition-all", targetKey === f.key && (f.type !== "array" || targetItem == null) && "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white p-2 -m-2")}>
              {f.type === "array" ? (
                <ArrayFieldRenderer
                  field={f}
                  value={(selectedSection.props[f.key] as Record<string, unknown>[]) || []}
                  onChange={(v) => updateSectionProps(selectedSection.id, { [f.key]: v })}
                  openIndex={targetKey === f.key ? targetItem : undefined}
                />
              ) : (
                <FieldRenderer field={f} value={selectedSection.props[f.key]} onChange={(v) => updateSectionProps(selectedSection.id, { [f.key]: v })} />
              )}
            </div>
          ))}
          {detailFields.some((f) => f.type === "color") && (
            <div className="mt-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Deixe um campo de cor vazio para herdar a cor do Tema Global. Preencha só o que quiser personalizar nesta seção.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Lista: um botão por elemento (filtrado pela aba ativa) */
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
          {visibleGroups.map((g) => {
            const Icon = groupIcon(g.name);
            const arr = g.shown.find((f) => f.type === "array");
            return (
              <button
                key={g.name}
                onClick={() => setOpenGroup(g.name)}
                className="w-full flex items-center gap-3 px-3.5 py-3 bg-white border border-zinc-100 rounded-2xl text-left hover:border-zinc-300 hover:bg-zinc-50 transition-all group/el"
              >
                <span className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover/el:text-zinc-900 group-hover/el:bg-white transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-zinc-800 truncate">{g.name}</span>
                  <span className="block text-[10px] text-zinc-400 font-medium truncate">
                    {arr ? `${arrayCount(arr)} ${arrayCount(arr) === 1 ? "item" : "itens"}` : `${g.shown.length} ${g.shown.length === 1 ? "campo" : "campos"}`}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover/el:text-zinc-500 transition-colors shrink-0" />
              </button>
            );
          })}
          {visibleGroups.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs text-zinc-400 font-medium">
                {tab === "style" ? "Esta seção não tem opções de estilo." : "Esta seção não tem campos de conteúdo."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Painel de propriedades do Container: edita o bloco selecionado ou o estilo da seção.
function ContainerProperties({ section, entry }: { section: PageSection; entry: SectionRegistryEntry }) {
  const { selectedNodeId, selectNode, mutateContainerRows, updateSectionProps, selectSection } = useEditorStore();
  const rows = (section.props.rows as ContainerRow[]) || [];
  const block = selectedNodeId ? findBlock(rows, selectedNodeId) : null;
  const breg = block ? blockRegistry[block.type] : null;

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {block ? (
            <button onClick={() => selectNode(null)} aria-label="Voltar" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Layout className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 text-[13px] truncate">{block && breg ? breg.label : entry.label}</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">
              {block ? "Bloco" : "Selecione um bloco no canvas"}
            </p>
          </div>
          <button onClick={() => selectSection(null)} aria-label="Fechar painel" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {block && breg ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {breg.fields.map((f) => (
            <FieldRenderer
              key={f.key}
              field={f}
              value={block.props[f.key]}
              onChange={(v) => mutateContainerRows(section.id, (r) => updateBlock(r, block.id, { [f.key]: v }), `block:${block.id}:${f.key}`)}
            />
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <button onClick={() => mutateContainerRows(section.id, (r) => moveBlock(r, block.id, "up"))} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[11px] font-bold hover:bg-zinc-50 transition-all"><ChevronUp className="w-3.5 h-3.5" /> Subir</button>
            <button onClick={() => mutateContainerRows(section.id, (r) => moveBlock(r, block.id, "down"))} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[11px] font-bold hover:bg-zinc-50 transition-all"><ChevronDown className="w-3.5 h-3.5" /> Descer</button>
            <button onClick={() => { mutateContainerRows(section.id, (r) => removeBlock(r, block.id)); selectNode(null); }} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-red-500 text-[11px] font-bold hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Clique num bloco no canvas para editá-lo. Use <strong>+ Bloco</strong> dentro de uma coluna e <strong>Adicionar linha</strong> para montar o layout.
            </p>
          </div>
          {entry.fields.map((f) => (
            <FieldRenderer key={f.key} field={f} value={section.props[f.key]} onChange={(v) => updateSectionProps(section.id, { [f.key]: v })} />
          ))}
        </div>
      )}
    </div>
  );
}

// Campo numérico compacto (transform da Tela Livre).
function NumField({ label, value, onChange, min, max, step = 1, unit }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string; }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-zinc-500 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
        />
        {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none">{unit}</span>}
      </div>
    </div>
  );
}

// Painel da Tela Livre: edita o elemento selecionado (conteúdo + posição/tamanho) ou a tela.
function CanvasProperties({ section, entry }: { section: PageSection; entry: SectionRegistryEntry }) {
  const { selectedNodeId, selectNode, mutateCanvasElements, updateSectionProps, selectSection, viewport } = useEditorStore();
  const vp = viewport as Viewport;
  const isDesktop = vp === "desktop";
  const deviceLabel = vp === "tablet" ? "Tablet" : "Celular";
  const elements = (section.props.elements as CanvasElement[]) || [];
  const el = findElement(elements, selectedNodeId);
  const reg = el ? canvasElementRegistry[el.type] : null;
  const r = el ? resolveElement(el, vp) : null;
  const cw = Number(section.props.designWidth) || 1200;
  const num = (v: unknown) => (v != null && v !== "" ? Number(v) : undefined);
  const heights = { desktop: Number(section.props.height) || 600, tablet: num(section.props.heightTablet), mobile: num(section.props.heightMobile) };
  const ch = resolveHeight(heights, vp);
  const heightKey: "height" | "heightTablet" | "heightMobile" = vp === "desktop" ? "height" : vp === "tablet" ? "heightTablet" : "heightMobile";

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {el ? (
            <button onClick={() => selectNode(null)} aria-label="Voltar" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Layout className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 text-[13px] truncate">{el && reg ? reg.label : entry.label}</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">{el ? (isDesktop ? "Elemento" : `Elemento · ${deviceLabel}`) : "Selecione um elemento na tela"}</p>
          </div>
          <button onClick={() => selectSection(null)} aria-label="Fechar painel" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {el && reg ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {reg.fields.map((f) => (
            <FieldRenderer
              key={f.key}
              field={f}
              value={el.props[f.key]}
              onChange={(v) => mutateCanvasElements(section.id, (els) => updateElementProps(els, el.id, { [f.key]: v }), `el:${el.id}:${f.key}`)}
            />
          ))}

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Posição & Tamanho{!isDesktop && <span className="text-blue-500"> · {deviceLabel}</span>}</p>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="X" value={r!.x} unit="px" onChange={(v) => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { x: v }), `tf:${el.id}`)} />
              <NumField label="Y" value={r!.y} unit="px" onChange={(v) => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { y: v }), `tf:${el.id}`)} />
              <NumField label="Largura" value={r!.w} unit="px" onChange={(v) => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { w: Math.max(12, v) }), `tf:${el.id}`)} />
              <NumField label="Altura" value={r!.h} unit="px" onChange={(v) => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { h: Math.max(12, v) }), `tf:${el.id}`)} />
              <NumField label="Rotação" value={r!.rotation} unit="°" onChange={(v) => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { rotation: v }), `tf:${el.id}`)} />
            </div>
            <div className="mt-3">
              <FieldRenderer
                field={{ key: "opacity", label: "Opacidade", type: "range", min: 0, max: 100, step: 1, unit: "%" }}
                value={Math.round((el.opacity ?? 1) * 100)}
                onChange={(v) => mutateCanvasElements(section.id, (els) => setTransform(els, el.id, { opacity: Number(v) / 100 }), `tf:${el.id}`)}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Alinhar na tela</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Esq.", t: { x: 0 } },
                { label: "Centro", t: { x: Math.round((cw - r!.w) / 2) } },
                { label: "Dir.", t: { x: cw - r!.w } },
                { label: "Topo", t: { y: 0 } },
                { label: "Meio", t: { y: Math.round((ch - r!.h) / 2) } },
                { label: "Base", t: { y: ch - r!.h } },
              ].map(({ label, t }) => (
                <button key={label} onClick={() => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, t))} className="py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[10px] font-bold hover:bg-zinc-50 transition-all">{label}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <button onClick={() => mutateCanvasElements(section.id, (els) => moveZ(els, el.id, "front"))} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[11px] font-bold hover:bg-zinc-50 transition-all"><ChevronUp className="w-3.5 h-3.5" /> Frente</button>
            <button onClick={() => mutateCanvasElements(section.id, (els) => moveZ(els, el.id, "back"))} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[11px] font-bold hover:bg-zinc-50 transition-all"><ChevronDown className="w-3.5 h-3.5" /> Trás</button>
            {!isDesktop && (
              <button onClick={() => mutateCanvasElements(section.id, (els) => setDeviceTransform(els, el.id, vp, { hidden: !r!.hidden }))} className="flex items-center justify-center px-3 py-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-all" title={r!.hidden ? `Mostrar no ${deviceLabel}` : `Ocultar no ${deviceLabel}`}>
                {r!.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={() => { mutateCanvasElements(section.id, (els) => removeElement(els, el.id)); selectNode(null); }} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-red-500 text-[11px] font-bold hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Use a barra acima da tela para adicionar elementos. Clique num elemento para editá-lo, arraste para mover e use as alças para redimensionar/girar.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Proporção da tela{!isDesktop && <span className="text-blue-500"> · {deviceLabel}</span>}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Banner", h: Math.round(cw / 3) },
                { label: "16:9", h: Math.round((cw * 9) / 16) },
                { label: "4:3", h: Math.round((cw * 3) / 4) },
                { label: "1:1", h: cw },
              ].map((p) => (
                <button key={p.label} onClick={() => updateSectionProps(section.id, { [heightKey]: p.h })} className="py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[10px] font-bold hover:bg-zinc-50 transition-all">{p.label}</button>
              ))}
            </div>
          </div>

          {entry.fields.map((f) => (
            <FieldRenderer key={f.key} field={f} value={section.props[f.key]} onChange={(v) => updateSectionProps(section.id, { [f.key]: v })} />
          ))}

          {elements.length > 0 && (
            <div className="pt-2 border-t border-zinc-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Camadas</p>
              <div className="space-y-1">
                {[...elements].reverse().map((le) => {
                  const LayerIcon = canvasElementRegistry[le.type].icon;
                  const name = le.type === "text" ? (String(le.props.text || "").trim().slice(0, 22) || "Texto") : canvasElementRegistry[le.type].label;
                  return (
                    <div key={le.id} className="flex items-center gap-1.5">
                      <button onClick={() => selectNode(le.id)} className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg border border-zinc-100 text-left hover:bg-zinc-50 transition-all min-w-0">
                        <LayerIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-[11px] font-medium text-zinc-700 truncate">{name}</span>
                      </button>
                      <button onClick={() => mutateCanvasElements(section.id, (els) => moveZ(els, le.id, "forward"))} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-all shrink-0" title="Subir"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => mutateCanvasElements(section.id, (els) => moveZ(els, le.id, "backward"))} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 transition-all shrink-0" title="Descer"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Ícone por nome de elemento (substring, sem novos imports).
function groupIcon(name: string): React.ComponentType<{ className?: string }> {
  const n = name.toLowerCase();
  if (n.includes("botão") || n.includes("cta")) return MousePointerClick;
  if (n.includes("título") || n.includes("titulo") || n.includes("texto") || n.includes("subtítulo")) return Type;
  if (n.includes("badge") || n.includes("marca")) return Tag;
  if (n.includes("seção") || n.includes("secao")) return SlidersHorizontal;
  if (n.includes("links") || n.includes("menu") || n.includes("itens") || n.includes("produtos")) return LayoutGrid;
  if (n.includes("rede") || n.includes("social")) return Share2;
  if (n.includes("imagem") || n.includes("galeria") || n.includes("foto")) return ImageIcon;
  if (n.includes("loja") || n.includes("franquia")) return Store;
  return Square;
}

function Accordion({ title, icon, children, defaultOpen = false, count, forceOpen }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; count?: number; forceOpen?: boolean; }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Abre automaticamente quando o grupo passa a conter o alvo selecionado no canvas
  // (ajuste de estado durante render — padrão React, sem efeito).
  const [prevForce, setPrevForce] = useState(forceOpen);
  if (forceOpen !== prevForce) {
    setPrevForce(forceOpen);
    if (forceOpen) setIsOpen(true);
  }
  return (
    <div className="rounded-xl bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-1 py-2 group/acc">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 group-hover/acc:text-zinc-600 transition-colors">{icon}</span>
          <span className="text-[12px] font-semibold tracking-tight text-zinc-700">{title}</span>
          {count !== undefined && <span className="text-[10px] font-semibold bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-500">{count}</span>}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-zinc-300 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <div className="pt-1 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Inline Color Picker: Compacto, com preview + hex + botão limpar ----
function InlineColorPicker({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (v: unknown) => void; }) {
  const { theme } = useEditorStore();
  const displayHex = value || "";
  const hasValue = displayHex.length > 0;

  const palette = useMemo(() => {
    const rawPalette = [
      { id: "var(--theme-primary)", label: "Primária", color: theme.theme_primary_color },
      { id: "var(--theme-surface-50)", label: "Fundo", color: theme.theme_bg_color },
      { id: "var(--theme-tertiary)", label: "Terciária", color: theme.theme_tertiary_color },
    ];

    let customs: { id: string; hex: string; name?: string }[] = [];
    try {
      if (theme.theme_custom_colors) customs = JSON.parse(theme.theme_custom_colors);
    } catch {
      /* JSON inválido — ignora */
    }

    customs.forEach((c) => {
      if (c.hex && c.id) {
        rawPalette.push({ id: `var(--${c.id})`, label: c.name || "Customizada", color: c.hex });
      }
    });

    // Filtrar cores inválidas e duplicadas pelo código HEX
    const seenHex = new Set<string>();
    return rawPalette.filter(swatch => {
      if (!swatch.color) return false;
      const hex = swatch.color.toUpperCase();
      if (seenHex.has(hex)) return false;
      seenHex.add(hex);
      return true;
    });
  }, [theme]);

  // Resolver o rótulo para exibição (ex: "Primária" em vez de "var(--...)")
  const displayLabel = useMemo(() => {
    if (!displayHex) return placeholder || "Automático";
    const swatch = palette.find(s => s.id === displayHex);
    if (swatch) return swatch.label;
    return displayHex;
  }, [displayHex, palette, placeholder]);

  // Resolver o hex para o <input type="color"> nativo (exige #RRGGBB)
  const pickerHex = useMemo(() => {
    if (!displayHex) return "#CCCCCC";
    let hex = displayHex;
    if (displayHex.startsWith("var(--")) {
      const swatch = palette.find(s => s.id === displayHex);
      if (swatch && swatch.color.startsWith("#")) {
        hex = swatch.color;
      } else {
        return "#CCCCCC";
      }
    }
    // Converter hex de 3 digitos para 6 se necessário
    if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
      return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
    return "#CCCCCC"; // Fallback se for rgba ou invalido
  }, [displayHex, palette]);

  const [editing, setEditing] = useState(false);
  const [hexInput, setHexInput] = useState(displayHex);
  const [hexError, setHexError] = useState(false);

  // Mantém o input em sincronia quando o valor externo muda (ajuste durante render).
  const [prevDisplayHex, setPrevDisplayHex] = useState(displayHex);
  if (displayHex !== prevDisplayHex) {
    setPrevDisplayHex(displayHex);
    setHexInput(displayHex);
  }

  // Aceita: vazio (herda do tema), var(--token), #RGB ou #RRGGBB.
  const isValidColor = (v: string) => {
    const t = v.trim();
    return t === "" || t.startsWith("var(--") || /^#[0-9A-Fa-f]{3}$/.test(t) || /^#[0-9A-Fa-f]{6}$/.test(t);
  };

  const handleHexCommit = () => {
    const clean = hexInput.trim();
    if (!isValidColor(clean)) {
      setHexError(true);
      return; // mantém em edição para correção
    }
    setHexError(false);
    onChange(clean);
    setEditing(false);
  };

  return (
    <div className="group space-y-2">
      <div className="flex items-center gap-3 py-1.5">
        {/* Color Preview / Picker */}
        <div className="relative shrink-0">
          <input
            type="color"
            value={hasValue ? pickerHex : "#CCCCCC"}
            onChange={(e) => { onChange(e.target.value); setHexInput(e.target.value); }}
            aria-label={label}
            title={label}
            className="w-8 h-8 rounded-lg border-2 border-white shadow-sm cursor-pointer p-0 bg-transparent ring-1 ring-zinc-200 hover:ring-zinc-400 transition-all"
          />
          {!hasValue && (
            <div className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none bg-white/80">
              <span className="text-[8px] font-black text-zinc-400">AUTO</span>
            </div>
          )}
        </div>

        {/* Label + Hex */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-zinc-600 leading-none mb-0.5 truncate">{label}</p>
          {editing ? (
            <input
              type="text"
              value={hexInput}
              onChange={(e) => { setHexInput(e.target.value); if (hexError) setHexError(false); }}
              onBlur={handleHexCommit}
              onKeyDown={(e) => e.key === "Enter" && handleHexCommit()}
              autoFocus
              aria-invalid={hexError}
              className={cn(
                "w-full px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md focus:outline-none",
                hexError
                  ? "text-red-600 bg-red-50 border border-red-400 focus:border-red-500"
                  : "text-zinc-700 bg-zinc-50 border border-zinc-200 focus:border-zinc-400"
              )}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-mono font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              {displayLabel}
            </button>
          )}
        </div>

        {/* Clear Button */}
        {hasValue && (
          <button
            onClick={() => onChange("")}
            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Limpar (usar padrão do tema)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Paleta Global - Amostras */}
      <div className="flex flex-wrap gap-1.5 pl-11">
        {palette.map((swatch) => (
          <button
            key={swatch.id}
            onClick={() => onChange(swatch.id)}
            title={swatch.label}
            className="w-5 h-5 rounded-full border border-zinc-200 hover:scale-110 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
            style={{ backgroundColor: swatch.color }}
          />
        ))}
      </div>
    </div>
  );
}


function FieldRenderer({ field, value, onChange }: { field: PropField; value: unknown; onChange: (v: unknown) => void; }) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <input type="text" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all" />
        </div>
      );
    case "textarea":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={3} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all resize-none" />
        </div>
      );
    case "richtext":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <RichTextEditor content={(value as string) || ""} onChange={onChange} />
        </div>
      );
    case "select": {
      const opts = [...(field.options || [])];
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <div className="relative">
            <select value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all appearance-none cursor-pointer pr-8">
              {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Down className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      );
    }
    case "color":
      return <InlineColorPicker label={field.label} placeholder={field.placeholder} value={(value as string) || ""} onChange={onChange} />;
    case "image":
      return <ImageUploader label={field.label} value={(value as string) || ""} onChange={(url) => onChange(url)} />;
    case "url":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <input type="text" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "https://..."} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all" />
        </div>
      );
    case "number":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-500 block">{field.label}</label>
          <div className="relative">
            <input
              type="number"
              value={value === "" || value === undefined || value === null ? "" : Number(value)}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
            />
            {field.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 pointer-events-none">{field.unit}</span>}
          </div>
        </div>
      );
    case "range":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-zinc-500">{field.label}</label>
            <span className="text-[11px] font-mono text-zinc-400">{Number(value) || 0}{field.unit || ""}</span>
          </div>
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={Number(value) || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-zinc-900"
          />
        </div>
      );
    case "array":
      return <ArrayFieldRenderer field={field} value={(value as Record<string, unknown>[]) || []} onChange={onChange} />;
    default:
      return null;
  }
}

function ArrayFieldRenderer({ field, value, onChange, openIndex }: { field: PropField; value: Record<string, unknown>[]; onChange: (v: unknown) => void; openIndex?: number; }) {
  const items = Array.isArray(value) ? value : [];
  // Qual item está expandido (um por vez). Sincroniza com o alvo do clique no canvas
  // via ajuste de estado durante render (padrão React, sem efeito).
  const [open, setOpen] = useState<number | null>(openIndex ?? null);
  const [prevOpenIndex, setPrevOpenIndex] = useState(openIndex);
  if (openIndex !== prevOpenIndex) {
    setPrevOpenIndex(openIndex);
    if (openIndex != null) setOpen(openIndex);
  }

  const addItem = () => {
    const b: Record<string, unknown> = {};
    field.itemFields?.forEach((f) => { b[f.key] = ""; });
    onChange([...items, b]);
    setOpen(items.length); // abre o item recém-criado
  };
  const removeItem = (i: number) => { onChange(items.filter((_, idx) => idx !== i)); setOpen(null); };
  const updateItem = (i: number, k: string, v: unknown) => onChange(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const moveItem = (i: number, dir: "up" | "down") => {
    if (dir === "up" && i === 0) return;
    if (dir === "down" && i === items.length - 1) return;
    const n = [...items]; const si = dir === "up" ? i - 1 : i + 1;
    [n[i], n[si]] = [n[si], n[i]]; onChange(n);
  };

  // Rótulo do cabeçalho: primeiro campo de texto preenchido, ou "Item N".
  const labelOf = (item: Record<string, unknown>, i: number) => {
    const tf = field.itemFields?.find((f) => f.type === "text" || f.type === "url");
    const v = tf ? String(item[tf.key] ?? "").trim() : "";
    return v || `Item ${i + 1}`;
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        const isTarget = openIndex === i;
        return (
          <div
            key={i}
            data-item-key={`${field.key}#${i}`}
            className={cn(
              "scroll-mt-4 bg-zinc-50 border rounded-2xl overflow-hidden transition-all",
              isTarget ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2 ring-offset-white" : "border-zinc-100"
            )}
          >
            <div className="flex items-center gap-1.5 px-3 py-2.5">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex-1 flex items-center gap-2 min-w-0 text-left">
                <span className="text-[9px] font-black text-zinc-400 w-4 shrink-0">#{i + 1}</span>
                <span className="text-[12px] font-bold text-zinc-700 truncate">{labelOf(item, i)}</span>
              </button>
              <button type="button" aria-label="Mover para cima" onClick={() => moveItem(i, "up")} disabled={i === 0} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all"><ChevronUp className="w-3.5 h-3.5" /></button>
              <button type="button" aria-label="Mover para baixo" onClick={() => moveItem(i, "down")} disabled={i === items.length - 1} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all"><ChevronDown className="w-3.5 h-3.5" /></button>
              <button type="button" aria-label="Remover item" onClick={() => removeItem(i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              <button type="button" aria-label={isOpen ? "Recolher item" : "Expandir item"} onClick={() => setOpen(isOpen ? null : i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white transition-all"><Down className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} /></button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                  <div className="px-3 pb-3 pt-1 space-y-4 border-t border-zinc-100">
                    {field.itemFields?.map((sf) => <FieldRenderer key={sf.key} field={sf} value={item[sf.key]} onChange={(v) => updateItem(i, sf.key, v)} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <button type="button" onClick={addItem} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 text-xs font-bold uppercase tracking-wider hover:border-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all">
        <Plus className="w-4 h-4" /> Adicionar Item
      </button>
    </div>
  );
}


