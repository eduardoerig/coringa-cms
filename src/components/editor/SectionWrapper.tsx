"use client";

import { useEditorStore, type PageSection } from "@/stores/editorStore";
import { sectionRegistry } from "./sections/registry";
import { GripVertical, Eye, EyeOff, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  section: PageSection;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function SectionWrapper({
  section,
  index,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onDragEnd,
}: SectionWrapperProps) {
  const { removeSection, toggleVisibility, duplicateSection, moveSection, sections } = useEditorStore();
  const entry = sectionRegistry[section.type];

  if (!entry) return null;

  const Icon = entry.icon;
  const title = (section.props.title as string) || entry.label;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", section.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "group relative bg-white border rounded-2xl transition-all cursor-pointer",
        isSelected
          ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
          : "border-text-100 hover:border-text-200 hover:shadow-md",
        isDragging && "opacity-40 scale-[0.98]",
        !section.visible && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle (Desktop) */}
        <div className="hidden md:block cursor-grab active:cursor-grabbing text-text-300 hover:text-text-500 transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Mobile Move Controls */}
        <div className="md:hidden flex flex-col gap-1 mr-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (index > 0) moveSection(index, index - 1);
            }}
            disabled={index === 0}
            className="p-1 bg-surface-50 rounded text-text-400 disabled:opacity-30"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (index < sections.length - 1) moveSection(index, index + 1);
            }}
            disabled={index === sections.length - 1}
            className="p-1 bg-surface-50 rounded text-text-400 disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Icon & info */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            isSelected ? "bg-primary/10 text-primary" : "bg-surface-50 text-text-400"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-900 leading-snug">{title}</span>
          </div>
          {!section.visible && (
            <span className="text-[10px] text-amber-600 font-medium">Oculto no site</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(section.id);
            }}
            className="p-1.5 rounded-lg text-text-400 hover:bg-text-100 hover:text-text-900 transition-colors"
            title={section.visible ? "Ocultar seção" : "Mostrar seção"}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateSection(section.id);
            }}
            className="p-1.5 rounded-lg text-text-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Duplicar seção"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeSection(section.id);
            }}
            className="p-1.5 rounded-lg text-text-400 hover:bg-red-50 hover:text-red-600 transition-colors z-10"
            title="Remover seção"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Order badge */}
        <span className="text-[10px] text-text-300 font-mono w-5 text-center flex-shrink-0">
          {index + 1}
        </span>
      </div>
    </div>
  );
}
