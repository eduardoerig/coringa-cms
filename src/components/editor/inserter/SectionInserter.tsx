"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, LayoutGrid, Sparkles, Layers, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { sectionTypes, sectionRegistry, type SectionRegistryEntry, type PropField } from "../sections/registry";
import { SectionCard } from "./SectionCard";
import { SectionThumb } from "./SectionThumb";
import { pageTemplates, type PageTemplate } from "./templates";
import { blockRegistry } from "../blocks/blockRegistry";
import { regenerateRowIds, genId, type ContainerRow } from "../blocks/containerModel";
import { deleteSavedBlock, fetchSavedBlocks, type SavedBlock } from "@/utils/savedBlocks";

// Categoria de cada tipo de seção (fonte única para os filtros da galeria).
const SECTION_CATEGORY: Record<string, string> = {
  header: "Estrutura",
  hero: "Estrutura",
  divider: "Estrutura",
  footer: "Estrutura",
  container: "Estrutura",
  highlights: "Conteúdo",
  menu: "Conteúdo",
  gallery: "Conteúdo",
  about: "Conteúdo",
  text_block: "Conteúdo",
  franchise: "Conversão",
  cta_banner: "Conversão",
};
const CATEGORY_ORDER = ["Estrutura", "Conteúdo", "Conversão"] as const;

// Ordem de prioridade na lista de seções (estes vêm primeiro).
const SECTION_PRIORITY = ["container", "text_block", "divider"];
function sectionRank(type: string): number {
  const i = SECTION_PRIORITY.indexOf(type);
  return i === -1 ? SECTION_PRIORITY.length : i;
}

type InserterTab = "sections" | "templates" | "my_blocks";

/** Campo de variante de layout da seção, se houver mais de uma opção. */
function getVariantField(entry: SectionRegistryEntry): PropField | undefined {
  return entry.fields.find((f) => f.key === "layout_variant" && f.options && f.options.length > 1);
}

function TemplateCard({ tpl, onInsert }: { tpl: PageTemplate; onInsert: (t: PageTemplate) => void }) {
  return (
    <button
      type="button"
      onClick={() => onInsert(tpl)}
      className="group relative flex flex-col text-left rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all hover:border-zinc-900 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative w-full h-32 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-50">
        <span className="text-4xl">{tpl.glyph}</span>
        <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 text-white">
          {tpl.sections.length} {tpl.sections.length === 1 ? "bloco" : "blocos"}
        </span>
        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/30 transition-colors flex items-center justify-center">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-900 text-[11px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
            <Plus className="w-3.5 h-3.5" /> Inserir
          </span>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="text-[13px] font-bold text-zinc-900 leading-tight">{tpl.name}</div>
        <div className="text-[11px] text-zinc-400 font-medium leading-snug mt-0.5 line-clamp-2">{tpl.description}</div>
      </div>
    </button>
  );
}

// ---- Miniatura esquemática de cada variante de layout ----
const WIRE_BOX = "rounded-md bg-zinc-300";

function WireLines({ center = false }: { center?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5 flex-1 justify-center", center && "items-center")}>
      <div className={cn("h-2 rounded bg-zinc-300", center ? "w-2/3" : "w-3/4")} />
      <div className="h-2 rounded bg-zinc-200 w-1/2" />
      <div className="h-2 rounded bg-zinc-200 w-2/3" />
    </div>
  );
}

function VariantThumb({ value }: { value: string }) {
  const wb = <div className={cn("flex-1", WIRE_BOX)} />;
  switch (value) {
    case "image_left":
      return <div className="flex items-stretch gap-2 w-full h-full"><div className={cn("w-1/3", WIRE_BOX)} /><WireLines /></div>;
    case "image_right":
      return <div className="flex items-stretch gap-2 w-full h-full"><WireLines /><div className={cn("w-1/3", WIRE_BOX)} /></div>;
    case "stacked":
    case "centered_big":
      return <div className="flex flex-col items-center gap-2 w-full h-full"><div className={cn("w-2/3 flex-1", WIRE_BOX)} /><WireLines center /></div>;
    case "full_bg":
      return (
        <div className={cn("w-full h-full flex items-center justify-center", WIRE_BOX)}>
          <div className="w-1/2"><div className="h-2 rounded bg-white/80 w-full mb-1" /><div className="h-2 rounded bg-white/60 w-2/3 mx-auto" /></div>
        </div>
      );
    case "floating":
      return (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
          <div className="flex items-end gap-1.5"><div className={cn("w-4 h-7", WIRE_BOX)} /><div className={cn("w-5 h-9", WIRE_BOX)} /><div className={cn("w-4 h-7", WIRE_BOX)} /></div>
          <div className="h-2 rounded bg-zinc-300 w-1/2" />
        </div>
      );
    case "grid":
      return (
        <div className="flex flex-col gap-1.5 w-full h-full">
          <div className="flex gap-1.5 flex-1">{wb}{wb}</div>
          <div className="flex gap-1.5 flex-1">{wb}{wb}</div>
        </div>
      );
    case "spacious":
      return <div className="flex gap-1.5 w-full h-full">{wb}{wb}{wb}</div>;
    case "compact":
      return <div className="flex gap-1 w-full h-full">{wb}{wb}{wb}{wb}{wb}</div>;
    case "wide":
      return <div className="flex gap-1.5 w-full h-full">{wb}{wb}</div>;
    case "carousel":
      return (
        <div className="flex items-center gap-1.5 w-full h-full">
          <div className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
          <div className="flex gap-1.5 flex-1 h-2/3">{wb}{wb}{wb}</div>
          <div className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
        </div>
      );
    case "split":
      return <div className="flex items-center justify-between gap-3 w-full h-full"><div className="flex-1"><WireLines /></div><div className="w-12 h-6 rounded-full bg-zinc-300 shrink-0" /></div>;
    case "card":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded-xl bg-zinc-200 flex items-center justify-center"><div className="w-1/2"><div className="h-2 rounded bg-zinc-300 w-full mb-1" /><div className="h-2 rounded bg-zinc-300 w-2/3 mx-auto" /></div></div>
        </div>
      );
    case "band":
      return (
        <div className={cn("w-full h-full flex items-center justify-center", WIRE_BOX)}>
          <div className="w-1/2"><div className="h-2 rounded bg-white/80 w-full mb-1" /><div className="h-2 rounded bg-white/60 w-2/3 mx-auto" /></div>
        </div>
      );
    case "centered":
      return <div className="flex flex-col items-center justify-center gap-2 w-full h-full"><WireLines center /><div className="w-12 h-5 rounded-full bg-zinc-300" /></div>;
    default:
      return <WireLines />;
  }
}

function VariantStep({
  entry,
  onPick,
}: {
  entry: SectionRegistryEntry;
  onPick: (value: string) => void;
}) {
  const options = getVariantField(entry)?.options ?? [];
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className="group flex flex-col text-left rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all hover:border-zinc-900 hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="h-28 p-3 bg-gradient-to-br from-zinc-100 to-zinc-50 flex">
              <VariantThumb value={opt.value} />
            </div>
            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-zinc-900 leading-tight">{opt.label}</span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <Plus className="w-3 h-3" /> Usar
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionInserter() {
  const inserterOpen = useEditorStore((s) => s.inserterOpen);
  const pendingInsertIndex = useEditorStore((s) => s.pendingInsertIndex);
  const closeInserter = useEditorStore((s) => s.closeInserter);
  const sections = useEditorStore((s) => s.sections);
  const addSection = useEditorStore((s) => s.addSection);
  const addSectionAtIndex = useEditorStore((s) => s.addSectionAtIndex);
  const addTemplate = useEditorStore((s) => s.addTemplate);
  const savedBlocks = useEditorStore((s) => s.savedBlocks);
  const setSavedBlocks = useEditorStore((s) => s.setSavedBlocks);

  const [tab, setTab] = useState<InserterTab>("sections");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("Todas");
  const [variantPick, setVariantPick] = useState<SectionRegistryEntry | null>(null);

  // Fecha o inseridor e reseta os filtros/passo para a próxima abertura.
  const close = useCallback(() => {
    setQuery("");
    setActiveCat("Todas");
    setVariantPick(null);
    closeInserter();
  }, [closeInserter]);

  // Esc: volta do passo de variante (se estiver nele) ou fecha o inseridor.
  useEffect(() => {
    if (!inserterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (variantPick) setVariantPick(null);
        else close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inserterOpen, variantPick, close]);

  const canAdd = (entry: SectionRegistryEntry) => {
    if (!entry.maxInstances) return true;
    return sections.filter((s) => s.type === entry.type).length < entry.maxInstances;
  };

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sectionTypes
      .filter((s) => {
        const cat = SECTION_CATEGORY[s.type] ?? "Conteúdo";
        if (activeCat !== "Todas" && cat !== activeCat) return false;
        if (!q) return true;
        return s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      })
      .sort((a, b) => sectionRank(a.type) - sectionRank(b.type));
  }, [query, activeCat]);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pageTemplates.filter((t) => {
      if (activeCat !== "Todas" && t.category !== activeCat) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
  }, [query, activeCat]);

  const doInsert = (type: string, override?: Record<string, unknown>) => {
    if (pendingInsertIndex == null) addSection(type, undefined, override);
    else addSectionAtIndex(type, pendingInsertIndex, override);
    close();
  };

  const handleInsertSection = (type: string) => {
    const entry = sectionTypes.find((e) => e.type === type);
    // Tem variantes de layout? Mostra o passo de escolha antes de inserir.
    if (entry && getVariantField(entry)) {
      setVariantPick(entry);
      return;
    }
    doInsert(type);
  };

  const handleInsertTemplate = (tpl: PageTemplate) => {
    addTemplate(tpl.sections, pendingInsertIndex);
    close();
  };

  const filteredSaved = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return savedBlocks;
    return savedBlocks.filter((b) => b.name.toLowerCase().includes(q));
  }, [query, savedBlocks]);

  const insertSaved = (saved: SavedBlock) => {
    if (saved.kind === "section") {
      let props = saved.props;
      if (saved.type === "container") {
        props = { ...props, rows: regenerateRowIds((props.rows as ContainerRow[]) ?? []) };
      }
      if (pendingInsertIndex == null) addSection(saved.type, undefined, props);
      else addSectionAtIndex(saved.type, pendingInsertIndex, props);
    } else {
      // bloco atômico → embrulha num Container de 1 coluna
      const rows: ContainerRow[] = [{
        id: genId("row"),
        columns: [{ id: genId("col"), width: "1/1", blocks: [{ id: genId("blk"), type: saved.type, props: JSON.parse(JSON.stringify(saved.props)) }] }],
      }];
      if (pendingInsertIndex == null) addSection("container", undefined, { rows });
      else addSectionAtIndex("container", pendingInsertIndex, { rows });
    }
    close();
  };

  const handleDeleteSaved = async (id: string) => {
    await deleteSavedBlock(id);
    setSavedBlocks(await fetchSavedBlocks());
  };

  const positionLabel =
    pendingInsertIndex == null
      ? "ao final da página"
      : pendingInsertIndex === 0
        ? "no topo da página"
        : `na posição ${pendingInsertIndex + 1}`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {inserterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={close} />

          {/* Painel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                {variantPick ? (
                  <button
                    onClick={() => setVariantPick(null)}
                    aria-label="Voltar"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="font-display font-black text-zinc-900 text-base tracking-tight leading-none">
                    {variantPick ? `Escolha o layout — ${variantPick.label}` : "Adicionar à página"}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-bold mt-1">
                    {variantPick ? "Selecione um modelo de layout para inserir" : `Inserindo ${positionLabel}`}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Fechar"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {variantPick ? (
              <VariantStep entry={variantPick} onPick={(value) => doInsert(variantPick.type, { layout_variant: value })} />
            ) : (
              <>
                {/* Tabs + busca */}
                <div className="px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-zinc-100">
                  <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
                    {([
                      ["sections", "Seções", LayoutGrid],
                      ["templates", "Templates", Sparkles],
                      ["my_blocks", "Meus blocos", Layers],
                    ] as const).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all",
                          tab === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder={tab === "sections" ? "Buscar seções..." : tab === "templates" ? "Buscar templates..." : "Buscar meus blocos..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all placeholder:text-zinc-300"
                      />
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      {["Todas", ...CATEGORY_ORDER].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCat(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                            activeCat === cat ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
                  {tab === "sections" ? (
                    filteredSections.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredSections.map((entry) => (
                          <SectionCard
                            key={entry.type}
                            entry={entry}
                            category={SECTION_CATEGORY[entry.type] ?? "Conteúdo"}
                            disabled={!canAdd(entry)}
                            onInsert={handleInsertSection}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState query={query} />
                    )
                  ) : tab === "templates" ? (
                    filteredTemplates.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredTemplates.map((tpl) => (
                          <TemplateCard key={tpl.id} tpl={tpl} onInsert={handleInsertTemplate} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState query={query} />
                    )
                  ) : filteredSaved.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredSaved.map((sb) => (
                        <SavedBlockCard key={sb.id} saved={sb} onInsert={insertSaved} onDelete={handleDeleteSaved} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState query={query} hint="Salve uma seção ou um bloco (botão de marcador no editor) para reutilizá-lo aqui." />
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function SavedBlockCard({ saved, onInsert, onDelete }: { saved: SavedBlock; onInsert: (s: SavedBlock) => void; onDelete: (id: string) => void }) {
  const isSection = saved.kind === "section";
  const BlockIcon = blockRegistry[saved.type]?.icon ?? Layers;
  const subtitle = isSection ? (sectionRegistry[saved.type]?.label ?? saved.type) : (blockRegistry[saved.type]?.label ?? saved.type);
  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all hover:border-zinc-900 hover:shadow-xl hover:-translate-y-0.5">
      <button type="button" onClick={() => onInsert(saved)} className="text-left">
        <div className="relative w-full h-32 p-5 flex bg-gradient-to-br from-zinc-100 to-zinc-50">
          {isSection ? (
            <SectionThumb type={saved.type} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><BlockIcon className="w-9 h-9 text-zinc-300" /></div>
          )}
          <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-zinc-50 text-zinc-600 border-zinc-100">
            {isSection ? "Seção" : "Bloco"}
          </span>
        </div>
        <div className="px-3 py-3">
          <div className="text-[13px] font-bold text-zinc-900 truncate">{saved.name}</div>
          <div className="text-[11px] text-zinc-400 font-medium truncate">{subtitle}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onDelete(saved.id)}
        title="Excluir bloco"
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function EmptyState({ query, hint }: { query: string; hint?: string }) {
  return (
    <div className="py-20 text-center px-8">
      <Layers className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
      <p className="text-sm text-zinc-400 font-medium">
        {query ? (
          <>Nenhum resultado para <strong>&ldquo;{query}&rdquo;</strong></>
        ) : (
          hint ?? "Nada por aqui ainda."
        )}
      </p>
    </div>
  );
}
