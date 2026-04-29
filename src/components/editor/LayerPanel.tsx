"use client";

import { useEditorStore } from "@/stores/editorStore";
import { sectionRegistry } from "./sections/registry";
import { cn } from "@/lib/utils";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy,
  Layers,
  Search,
  Plus
} from "lucide-react";
import { motion, Reorder } from "framer-motion";

export function LayerPanel() {
  const { 
    sections, 
    reorderSections,
    selectedSectionId, 
    selectSection, 
    removeSection, 
    duplicateSection,
    toggleVisibility 
  } = useEditorStore();

  return (
    <div className="w-full border-r border-text-100 bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-5 border-b border-text-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-black text-zinc-900 text-sm tracking-tight">Estrutura</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Camadas</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-zinc-400 bg-white px-2.5 py-1 rounded-full border border-zinc-100 shadow-sm">
          {sections.length} BLOCOS
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-surface-50 flex items-center justify-center mb-4 border border-dashed border-text-200">
              <Layers className="w-8 h-8 text-text-200" />
            </div>
            <h4 className="text-sm font-bold text-text-900 mb-1">Nenhuma camada</h4>
            <p className="text-xs text-text-400 leading-relaxed">
              Adicione seções da biblioteca para começar a construir seu site.
            </p>
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={sections} 
            onReorder={reorderSections}
            className="space-y-1.5"
          >
            {sections.map((section, index) => {
              const entry = sectionRegistry[section.type];
              const Icon = entry?.icon || Layers;
              const isSelected = selectedSectionId === section.id;
              const title = (section.props?.title as string) || entry?.label || "Seção";

              return (
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="relative group"
                >
                  <div
                    onClick={() => selectSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl transition-all border cursor-pointer relative",
                      isSelected 
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/10 scale-[1.02]" 
                        : "bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200",
                      !section.visible && "opacity-50 grayscale-[0.5]"
                    )}
                  >
                    {/* Reorder Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-200 group-hover:text-zinc-400 transition-colors">
                      <GripVertical className={cn("w-4 h-4", isSelected && "text-white/40")} />
                    </div>

                    {/* Icon */}
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      isSelected 
                        ? "bg-white/20 text-white" 
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:shadow-sm"
                    )}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-[13px] font-bold truncate transition-colors",
                        isSelected ? "text-white" : "text-zinc-900"
                      )}>
                        {title}
                      </div>
                      <div className={cn(
                        "text-[10px] font-medium tracking-wide uppercase",
                        isSelected ? "text-white/60" : "text-zinc-400"
                      )}>
                        {entry?.label || "Seção"}
                      </div>
                    </div>

                      <div className={cn(
                        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0",
                        isSelected && "opacity-100"
                      )}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(section.id);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isSelected 
                              ? "hover:bg-white/20 text-white" 
                              : !section.visible ? "bg-zinc-900/10 text-zinc-900" : "text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                          )}
                          title={section.visible ? "Ocultar" : "Mostrar"}
                        >
                          {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
  
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSection(section.id);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isSelected ? "hover:bg-white/20 text-white" : "text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                          )}
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Deseja realmente remover esta camada?")) {
                              removeSection(section.id);
                            }
                          }}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isSelected ? "hover:bg-red-500 text-white" : "text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
                          )}
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* Navegação / Preview Section */}
      <div className="p-4 border-t border-text-100 bg-surface-50/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-black text-text-400 uppercase tracking-widest">Navegação</h4>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        
        <div className="bg-white border border-text-100 rounded-xl p-2 shadow-inner min-h-[120px] flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
          {sections.map((s, i) => {
             const entry = sectionRegistry[s.type];
             return (
               <div 
                key={s.id}
                onClick={() => selectSection(s.id)}
                className={cn(
                  "h-7 rounded-lg flex items-center px-2 gap-2 text-[10px] font-bold cursor-pointer transition-all border border-transparent",
                  selectedSectionId === s.id 
                    ? "bg-primary text-white shadow-sm shadow-primary/20" 
                    : "bg-surface-50 text-text-400 hover:bg-white hover:border-text-100 hover:text-text-700"
                )}
               >
                 <span className="opacity-40 font-black">{i + 1}</span>
                 <span className="truncate flex-1">{(s.props?.title as string) || entry?.label || "Seção"}</span>
               </div>
             )
          })}
          {sections.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-[10px] text-text-300 italic p-4 text-center">
              Aguardando estrutura...
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-text-100 bg-surface-50/20 text-center">
        <p className="text-[9px] text-text-400 font-medium">
          Editor v2.0 • Camarim Estética
        </p>
      </div>
    </div>
  );
}
