"use client";

import { sectionTypes, type SectionRegistryEntry } from "./sections/registry";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { Palette, Plus, Search, Layout, Info, ChevronRight, Layers, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---- Thumbnails gerados (caminhos locais → servidos via next/image não é possível fora de public)
// Usamos as imagens de preview do registry ou fallback SVG
const SECTION_CATEGORY: Record<string, string> = {
  header: "Estrutura",
  hero: "Estrutura",
  highlights: "Conteúdo",
  menu: "Conteúdo",
  gallery: "Conteúdo",
  about: "Conteúdo",
  franchise: "Conversão",
  cta_banner: "Conversão",
  text_block: "Conteúdo",
  divider: "Estrutura",
};

const CATEGORY_ORDER = ["Estrutura", "Conteúdo", "Conversão"];

const CATEGORY_COLOR: Record<string, string> = {
  Estrutura: "bg-blue-50 text-blue-600 border-blue-100",
  Conteúdo: "bg-violet-50 text-violet-600 border-violet-100",
  Conversão: "bg-amber-50 text-amber-700 border-amber-100",
};

export function SectionLibrary() {
  const { sections, addSection, selectSection, selectedSectionId } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const canAdd = (entry: SectionRegistryEntry) => {
    if (!entry.maxInstances) return true;
    const count = sections.filter((s) => s.type === entry.type).length;
    return count < entry.maxInstances;
  };

  const filteredSections = useMemo(() => {
    return sectionTypes.filter(
      (s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Agrupar por categoria
  const grouped = useMemo(() => {
    const map: Record<string, SectionRegistryEntry[]> = {};
    for (const cat of CATEGORY_ORDER) map[cat] = [];
    for (const entry of filteredSections) {
      const cat = SECTION_CATEGORY[entry.type] || "Conteúdo";
      if (!map[cat]) map[cat] = [];
      map[cat].push(entry);
    }
    return map;
  }, [filteredSections]);

  const handleAdd = (entry: SectionRegistryEntry) => {
    if (!canAdd(entry)) return;
    addSection(entry.type);
    setAddedId(entry.type);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-5 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-black text-zinc-900 text-sm tracking-tight">
              Biblioteca
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Blocos de Conteúdo
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar blocos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all placeholder:text-zinc-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Configurações Globais */}
        <div className="px-3 pt-4 pb-2">
          <p className="px-1 text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-2">
            Global
          </p>
          <button
            onClick={() => selectSection("global_theme")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all border group relative overflow-hidden",
              selectedSectionId === "global_theme"
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
                : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                selectedSectionId === "global_theme"
                  ? "bg-white/20 text-white"
                  : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
              )}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[13px] font-bold truncate",
                  selectedSectionId === "global_theme" ? "text-white" : "text-zinc-900"
                )}
              >
                Tema e Paleta de Cores
              </div>
              <div
                className={cn(
                  "text-[10px] font-medium",
                  selectedSectionId === "global_theme" ? "text-white/70" : "text-zinc-400"
                )}
              >
                Cores globais, tipografia
              </div>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 ml-auto shrink-0 transition-colors",
                selectedSectionId === "global_theme" ? "text-white/60" : "text-zinc-300"
              )}
            />
          </button>
        </div>

        {/* Seções por categoria */}
        {CATEGORY_ORDER.map((cat) => {
          const entries = grouped[cat];
          if (!entries || entries.length === 0) return null;
          return (
            <div key={cat} className="px-3 pt-4 pb-2">
              <p className="px-1 text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-2">
                {cat}
              </p>
              <div className="space-y-1.5">
                {entries.map((entry) => {
                  const disabled = !canAdd(entry);
                  const Icon = entry.icon;
                  const isJustAdded = addedId === entry.type;

                  return (
                    <motion.button
                      key={entry.type}
                      onClick={() => handleAdd(entry)}
                      disabled={disabled}
                      whileHover={disabled ? {} : { scale: 1.01 }}
                      whileTap={disabled ? {} : { scale: 0.98 }}
                      className={cn(
                        "w-full rounded-2xl text-left transition-all border overflow-hidden group relative",
                        disabled
                          ? "opacity-40 grayscale cursor-not-allowed border-transparent bg-zinc-50"
                          : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md active:shadow-sm cursor-pointer"
                      )}
                    >
                      {/* Thumbnail */}
                      {entry.previewImage && (
                        <div className="w-full h-24 overflow-hidden bg-zinc-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.previewImage}
                            alt={entry.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          {/* Category badge */}
                          <span
                            className={cn(
                              "absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              CATEGORY_COLOR[cat]
                            )}
                          >
                            {cat}
                          </span>
                          {/* Add button */}
                          {!disabled && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                              <Plus className="w-3.5 h-3.5 text-zinc-900" />
                            </div>
                          )}
                          {/* Already added overlay */}
                          {disabled && (
                            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                              <span className="text-[9px] font-black text-white uppercase tracking-wider bg-zinc-900/60 px-2 py-1 rounded-full">
                                Já adicionado
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No thumbnail fallback */}
                      {!entry.previewImage && (
                        <div className="w-full h-16 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-zinc-300" />
                        </div>
                      )}

                      {/* Info row */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                            disabled
                              ? "bg-zinc-100 text-zinc-300"
                              : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white"
                          )}
                        >
                          {isJustAdded ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-bold text-zinc-900 truncate">
                            {entry.label}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium truncate leading-tight">
                            {entry.description}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isJustAdded && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="py-16 text-center px-6">
            <Layers className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 font-medium">
              Nenhum bloco encontrado para <strong>&ldquo;{searchQuery}&rdquo;</strong>
            </p>
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-white border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Info className="w-3 h-3" />
            <p className="text-[9px] font-black uppercase tracking-widest">
              {sections.length} bloco{sections.length !== 1 ? "s" : ""} na página
            </p>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Ativo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
