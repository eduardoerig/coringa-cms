"use client";

import { sectionTypes, type SectionRegistryEntry } from "./sections/registry";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

export function SectionLibrary() {
  const { sections, addSection, selectSection, selectedSectionId } = useEditorStore();

  const canAdd = (entry: SectionRegistryEntry) => {
    if (!entry.maxInstances) return true;
    const count = sections.filter((s) => s.type === entry.type).length;
    return count < entry.maxInstances;
  };

  return (
    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-text-100 bg-white flex flex-col md:h-full flex-shrink-0">
      <div className="px-4 py-3 md:py-4 border-b border-text-100 hidden md:block">
        <h3 className="font-display font-bold text-text-900 text-sm">Seções</h3>
        <p className="text-[11px] text-text-400 mt-0.5">Clique para adicionar</p>
      </div>

      <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto md:overflow-x-hidden py-2 px-3 md:px-2 gap-2 md:gap-0 md:space-y-1 scrollbar-hide">
        {/* Global Theme Button */}
        <button
          onClick={() => selectSection("global_theme")}
          className={cn(
            "flex-none w-[160px] md:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group border md:border-transparent cursor-pointer",
            selectedSectionId === "global_theme"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-text-100 hover:bg-primary/5 hover:border-primary/20 hover:text-primary"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
              selectedSectionId === "global_theme"
                ? "bg-primary/20 text-primary"
                : "bg-surface-50 text-text-400 group-hover:bg-primary/10 group-hover:text-primary"
            )}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className={cn("text-sm font-medium truncate", selectedSectionId === "global_theme" ? "text-primary" : "text-text-900")}>
              Tema Global
            </div>
            <div className={cn("text-[10px] truncate", selectedSectionId === "global_theme" ? "text-primary/70" : "text-text-400")}>
              Cores da página
            </div>
          </div>
        </button>

        <div className="hidden md:block w-full h-px bg-text-100 my-2" />


        {sectionTypes.map((entry) => {
          const disabled = !canAdd(entry);
          const Icon = entry.icon;

          return (
            <button
              key={entry.type}
              onClick={() => !disabled && addSection(entry.type)}
              disabled={disabled}
              className={cn(
                "flex-none w-[160px] md:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group border md:border-transparent border-text-100",
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-primary/5 hover:border-primary/20 hover:text-primary cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  disabled
                    ? "bg-text-100 text-text-300"
                    : "bg-surface-50 text-text-400 group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-900 truncate">
                  {entry.label}
                </div>
                <div className="text-[10px] text-text-400 truncate">
                  {entry.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
