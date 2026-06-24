"use client";
import { useState, useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { sectionRegistry } from "./sections/registry";
import { cn } from "@/lib/utils";
import { GripVertical, Eye, EyeOff, Trash2, Copy, Layers, Search, X } from "lucide-react";
import { Reorder } from "framer-motion";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { PageSection } from "@/stores/editorStore";

export function LayerPanel() {
  const { sections, reorderSections, selectedSectionId, selectSection, removeSection, duplicateSection, toggleVisibility } = useEditorStore();
  const { confirm, confirmState, respondConfirm } = useConfirm();
  const [query, setQuery] = useState("");

  const handleRemove = async (id: string) => {
    const ok = await confirm({
      title: "Remover camada?",
      message: "Esta seção será removida do layout. Você pode desfazer com Ctrl+Z.",
      variant: "danger",
      confirmLabel: "Remover",
    });
    if (ok) removeSection(id);
  };

  // Rola a lista até a camada selecionada quando a seleção muda (ex.: clique no canvas).
  useEffect(() => {
    if (!selectedSectionId) return;
    const el = document.querySelector(`[data-layer-id="${selectedSectionId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedSectionId]);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;
  const labelOf = (s: PageSection) => (s.props?.title as string) || sectionRegistry[s.type]?.label || "Seção";
  const filtered = isSearching
    ? sections.filter((s) => labelOf(s).toLowerCase().includes(q) || (sectionRegistry[s.type]?.label || "").toLowerCase().includes(q))
    : sections;

  // Conteúdo interno de uma linha de camada (reutilizado na lista normal e na busca).
  const renderRow = (section: PageSection, index: number) => {
    const entry = sectionRegistry[section.type];
    const Icon = entry?.icon || Layers;
    const isSelected = selectedSectionId === section.id;
    const title = labelOf(section);
    return (
      <div data-layer-id={section.id} onClick={() => selectSection(section.id)} className={cn("flex items-center gap-2.5 p-3 rounded-2xl transition-all border cursor-pointer relative overflow-hidden", isSelected ? "bg-zinc-900 text-white border-zinc-900 shadow-xl" : "bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200", !section.visible && "opacity-50")}>
        {!isSearching && <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-300 group-hover:text-zinc-400 transition-colors"><GripVertical className={cn("w-4 h-4", isSelected && "text-white/40")} /></div>}
        <span className={cn("text-[9px] font-black w-4 text-right shrink-0", isSelected ? "text-white/40" : "text-zinc-300")}>#{index + 1}</span>
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all", isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200")}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-[12px] font-bold truncate", isSelected ? "text-white" : "text-zinc-900")}>{title}</div>
          <div className={cn("text-[9px] font-medium tracking-wide uppercase", isSelected ? "text-white/60" : "text-zinc-400")}>{entry?.label}</div>
        </div>
        <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0", isSelected && "opacity-100")}>
          <button onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", isSelected ? "hover:bg-white/20 text-white" : "text-zinc-400 hover:bg-white hover:shadow-sm")} title={section.visible ? "Ocultar" : "Mostrar"}>
            {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", isSelected ? "hover:bg-white/20 text-white" : "text-zinc-400 hover:bg-white hover:shadow-sm")} title="Duplicar"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleRemove(section.id); }} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", isSelected ? "hover:bg-red-500 text-white" : "text-zinc-400 hover:bg-red-50 hover:text-red-500")} title="Remover"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
      <div className="px-5 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm"><Layers className="w-4 h-4 text-white" /></div>
          <div>
            <h3 className="font-display font-black text-zinc-900 text-sm tracking-tight">Estrutura</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Camadas</p>
          </div>
        </div>
        <span className="text-[9px] font-black text-zinc-400 bg-white px-2.5 py-1 rounded-full border border-zinc-100 shadow-sm">{sections.length} BLOCOS</span>
      </div>

      {/* Busca de camadas */}
      {sections.length > 0 && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar camada…"
              className="w-full pl-9 pr-8 py-2 text-[12px] bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:border-zinc-300 focus:bg-white transition-all"
            />
            {isSearching && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 transition-all" title="Limpar busca">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 border-2 border-dashed border-zinc-200"><Layers className="w-7 h-7 text-zinc-200" /></div>
            <h4 className="text-sm font-bold text-zinc-900 mb-1">Nenhuma camada</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">Adicione seções da biblioteca para começar.</p>
          </div>
        ) : isSearching ? (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-3 border border-zinc-100"><Search className="w-5 h-5 text-zinc-300" /></div>
              <p className="text-xs text-zinc-400 leading-relaxed">Nenhuma camada encontrada para <strong className="text-zinc-600">“{query}”</strong>.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((section) => (
                <div key={section.id} className="relative group">
                  {renderRow(section, sections.indexOf(section))}
                </div>
              ))}
            </div>
          )
        ) : (
          <Reorder.Group axis="y" values={sections} onReorder={reorderSections} className="space-y-1.5">
            {sections.map((section, index) => (
              <Reorder.Item key={section.id} value={section} className="relative group">
                {renderRow(section, index)}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <ConfirmDialog state={confirmState} onRespond={respondConfirm} tone="light" />
    </div>
  );
}
