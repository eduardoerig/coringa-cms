"use client";
import { useEditorStore, type PageSection } from "@/stores/editorStore";
import { sectionRegistry, sectionComponentMap } from "./sections/registry";
import { GripVertical, Eye, EyeOff, Trash2, Copy, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Props { section: PageSection; index: number; isSelected: boolean; onSelect: () => void; }

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-6 w-[280px] text-center border border-zinc-100">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-500" /></div>
        <h3 className="font-black text-zinc-900 text-sm mb-1">Remover seção?</h3>
        <p className="text-xs text-zinc-400 mb-5">Esta ação não pode ser desfeita.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-black uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-all">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition-all">Remover</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SectionInCanvas({ section, index, isSelected, onSelect }: Props) {
  const { removeSection, toggleVisibility, duplicateSection, moveSection, sections, theme } = useEditorStore();
  const [showDelete, setShowDelete] = useState(false);
  const entry = sectionRegistry[section.type];
  const Component = sectionComponentMap[section.type];
  if (!entry || !Component) return null;

  return (
    <>
      <AnimatePresence>{showDelete && <DeleteConfirm onConfirm={() => { removeSection(section.id); setShowDelete(false); }} onCancel={() => setShowDelete(false)} />}</AnimatePresence>
      <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={cn("group relative transition-all duration-300", isSelected ? "ring-[3px] ring-zinc-900 ring-offset-0 z-20" : "hover:ring-2 hover:ring-zinc-400/40", !section.visible && "opacity-40 grayscale-[0.5]")}>
        {/* Top label */}
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: -38 }} exit={{ opacity: 0, y: 8 }} className="absolute top-0 left-0 z-[110]">
              <div className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-t-xl shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{entry.label}</span>
                <span className="text-[9px] text-zinc-500 font-bold">#{index + 1}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden section badge */}
        {!section.visible && (
          <div className="absolute top-3 left-3 z-[60] bg-zinc-900/85 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
            <EyeOff className="w-3 h-3" /> Oculto no site
          </div>
        )}

        {/* Floating toolbar — inside section, top-right */}
        <AnimatePresence>
          {isSelected && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute top-3 right-3 z-[110] flex flex-row gap-1 p-1.5 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-white/10">
              <button onClick={(e) => { e.stopPropagation(); if (index > 0) moveSection(index, index - 1); }} disabled={index === 0} className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors" title="Mover para cima"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); if (index < sections.length - 1) moveSection(index, index + 1); }} disabled={index === sections.length - 1} className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors" title="Mover para baixo"><ChevronDown className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-0.5 self-center" />
              <button onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title={section.visible ? "Ocultar" : "Mostrar"}>
                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title="Duplicar"><Copy className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-0.5 self-center" />
              <button onClick={(e) => { e.stopPropagation(); setShowDelete(true); }} className="p-2 rounded-xl hover:bg-red-500 transition-colors" title="Remover"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Component */}
        <div className={cn("relative transition-all duration-300", isSelected && "rounded-sm overflow-hidden")}>
          <div className="pointer-events-none editor-preview">
            <Component props={section.props} settings={theme} isEditor={true} />
          </div>
          {!isSelected && <div className="absolute inset-0 z-50 cursor-pointer" />}
        </div>

        {/* Hover badge */}
        {!isSelected && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 bg-white/95 backdrop-blur-sm border border-zinc-200 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 z-[60]">
            <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{entry.label}</span>
            <span className="text-[9px] text-zinc-400">#{index + 1}</span>
          </div>
        )}
      </div>
    </>
  );
}
