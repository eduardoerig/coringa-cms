"use client";

import { sectionTypes, type SectionRegistryEntry } from "./sections/registry";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { Palette, Plus, Search, Layout, Star, Sparkles, Image as ImageIcon, MessageSquare, Info, MousePointer2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SectionLibrary() {
  const { sections, addSection, selectSection, selectedSectionId } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");

  const canAdd = (entry: SectionRegistryEntry) => {
    if (!entry.maxInstances) return true;
    const count = sections.filter((s) => s.type === entry.type).length;
    return count < entry.maxInstances;
  };

  const filteredSections = useMemo(() => {
    return sectionTypes.filter(s => 
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="w-full border-r border-text-100 bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-5 border-b border-text-100 bg-surface-50/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-black text-text-900 text-sm tracking-tight">Biblioteca</h3>
            <p className="text-[10px] text-text-400 font-bold uppercase tracking-widest">Adicionar Blocos</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-400" />
          <input 
            type="text"
            placeholder="Buscar blocos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-text-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {/* Quick Access / Global Theme */}
        <div className="space-y-2">
          <h4 className="px-2 text-[10px] font-black text-text-300 uppercase tracking-widest">Configurações</h4>
          <button
            onClick={() => selectSection("global_theme")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all border group relative overflow-hidden",
              selectedSectionId === "global_theme"
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                : "bg-white border-transparent hover:bg-surface-50 hover:border-text-100"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                selectedSectionId === "global_theme"
                  ? "bg-white/20 text-white"
                  : "bg-surface-100 text-text-400 group-hover:bg-white group-hover:shadow-sm"
              )}
            >
              <Palette className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className={cn("text-[13px] font-bold truncate", selectedSectionId === "global_theme" ? "text-white" : "text-text-900")}>
                Tema Global
              </div>
              <div className={cn("text-[10px] font-medium", selectedSectionId === "global_theme" ? "text-white/80" : "text-text-400")}>
                Cores e Tipografia
              </div>
            </div>
          </button>
        </div>

        {/* Section List */}
        <div className="space-y-2 pt-2 border-t border-text-100/50">
          <h4 className="px-2 text-[10px] font-black text-text-300 uppercase tracking-widest">Blocos de Conteúdo</h4>
          
          <div className="grid grid-cols-1 gap-1.5">
            {filteredSections.map((entry) => {
              const disabled = !canAdd(entry);
              const Icon = entry.icon;

              return (
                <button
                  key={entry.type}
                  onClick={() => !disabled && addSection(entry.type)}
                  disabled={disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all border group relative",
                    disabled
                      ? "opacity-40 grayscale cursor-not-allowed border-transparent"
                      : "bg-white border-transparent hover:bg-surface-50 hover:border-text-100 active:scale-[0.98]"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      disabled
                        ? "bg-text-100 text-text-300"
                        : "bg-surface-100 text-text-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-text-900 truncate">
                      {entry.label}
                    </div>
                    <div className="text-[10px] text-text-400 font-medium truncate leading-tight mt-0.5">
                      {entry.description}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-surface-50 text-text-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" />
                  </div>
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="py-10 text-center px-4">
                <p className="text-sm text-text-400 font-medium italic">Nenhum bloco encontrado para sua busca.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-4 bg-white border-t border-text-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-400">
            <Info className="w-3 h-3" />
            <p className="text-[9px] font-black uppercase tracking-widest">Ajuda</p>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-400">Editor Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
