"use client";

import { useEditorStore, type PageSection } from "@/stores/editorStore";
import { sectionRegistry, sectionComponentMap } from "./sections/registry";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SectionInCanvasProps {
  section: PageSection;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function SectionInCanvas({
  section,
  index,
  isSelected,
  onSelect,
}: SectionInCanvasProps) {
  const { removeSection, toggleVisibility, duplicateSection, moveSection, sections, theme } = useEditorStore();
  const entry = sectionRegistry[section.type];
  const Component = sectionComponentMap[section.type];

  if (!entry || !Component) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "group relative transition-all duration-500 ease-out",
        isSelected
          ? "ring-4 ring-primary ring-offset-0 z-20"
          : "hover:ring-2 hover:ring-primary/30",
        !section.visible && "opacity-40 grayscale-[0.5]"
      )}
    >
      {/* Selection Label & Actions */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -45 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-0 z-[110] flex items-center gap-1"
          >
            <div className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-t-xl shadow-lg border border-white/20 border-b-0 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{entry.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toolbar (Right Side) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 10 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-0 z-[110] flex flex-col gap-1 p-1 bg-text-900 text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
          >
            {/* Move Controls */}
            <div className="flex flex-col items-center gap-1 pb-1 border-b border-white/10 mb-1">
              <button
                onClick={(e) => { e.stopPropagation(); if (index > 0) moveSection(index, index - 1); }}
                disabled={index === 0}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors"
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if (index < sections.length - 1) moveSection(index, index + 1); }}
                disabled={index === sections.length - 1}
                className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-20 transition-colors"
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Visibility */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
              title={section.visible ? "Ocultar" : "Mostrar"}
            >
              {section.visible ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
              title="Duplicar"
            >
              <Copy className="w-4.5 h-4.5" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Deseja remover esta seção?")) {
                  removeSection(section.id);
                }
              }}
              className="p-2.5 rounded-xl hover:bg-red-500 transition-colors mt-1"
              title="Remover"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Actual Component */}
      <div className={cn(
        "relative transition-transform duration-500",
        isSelected && "scale-[0.99] rounded-xl overflow-hidden shadow-2xl"
      )}>
        <Component props={section.props} settings={theme} isEditor={true} />

        {/* Overlay for non-selected sections to capture clicks */}
        {!isSelected && (
          <div className="absolute inset-0 z-50 cursor-pointer hover:bg-primary/5 transition-colors" />
        )}
      </div>

      {/* Hover Info */}
      {!isSelected && (
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white/90 backdrop-blur-sm border border-text-100 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 z-[60]">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-text-900 uppercase tracking-widest">{entry.label}</span>
        </div>
      )}
    </div>
  );
}
