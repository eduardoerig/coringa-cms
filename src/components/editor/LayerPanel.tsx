"use client";
import { useEditorStore } from "@/stores/editorStore";
import { sectionRegistry } from "./sections/registry";
import { cn } from "@/lib/utils";
import { GripVertical, Eye, EyeOff, Trash2, Copy, Layers } from "lucide-react";
import { Reorder } from "framer-motion";
import { useConfirm } from "@/hooks/useConfirm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function LayerPanel() {
  const { sections, reorderSections, selectedSectionId, selectSection, removeSection, duplicateSection, toggleVisibility } = useEditorStore();
  const { confirm, confirmState, respondConfirm } = useConfirm();

  const handleRemove = async (id: string) => {
    const ok = await confirm({
      title: "Remover camada?",
      message: "Esta seção será removida do layout. Você pode desfazer com Ctrl+Z.",
      variant: "danger",
      confirmLabel: "Remover",
    });
    if (ok) removeSection(id);
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 border-2 border-dashed border-zinc-200"><Layers className="w-7 h-7 text-zinc-200" /></div>
            <h4 className="text-sm font-bold text-zinc-900 mb-1">Nenhuma camada</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">Adicione seções da biblioteca para começar.</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={sections} onReorder={reorderSections} className="space-y-1.5">
            {sections.map((section, index) => {
              const entry = sectionRegistry[section.type];
              const Icon = entry?.icon || Layers;
              const isSelected = selectedSectionId === section.id;
              const title = (section.props?.title as string) || entry?.label || "Seção";

              return (
                <Reorder.Item key={section.id} value={section} className="relative group">
                  <div onClick={() => selectSection(section.id)} className={cn("flex items-center gap-2.5 p-3 rounded-2xl transition-all border cursor-pointer relative overflow-hidden", isSelected ? "bg-zinc-900 text-white border-zinc-900 shadow-xl" : "bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200", !section.visible && "opacity-50")}>
                    <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-300 group-hover:text-zinc-400 transition-colors"><GripVertical className={cn("w-4 h-4", isSelected && "text-white/40")} /></div>
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
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {sections.length > 0 && (
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/30">
          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-2">Navegação Rápida</p>
          <div className="bg-white border border-zinc-100 rounded-xl p-2 space-y-1 max-h-[160px] overflow-y-auto custom-scrollbar">
            {sections.map((s, i) => {
              const entry = sectionRegistry[s.type];
              return (
                <button key={s.id} onClick={() => selectSection(s.id)} className={cn("w-full h-7 rounded-lg flex items-center px-2 gap-2 text-[10px] font-bold cursor-pointer transition-all border border-transparent", selectedSectionId === s.id ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500 hover:bg-white hover:border-zinc-200 hover:text-zinc-800")}>
                  <span className="opacity-40 font-black w-3 text-right">{i + 1}</span>
                  <span className="truncate flex-1">{(s.props?.title as string) || entry?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog state={confirmState} onRespond={respondConfirm} tone="light" />
    </div>
  );
}
