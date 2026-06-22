"use client";

import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, Layers, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";

export type StudioTab = "library" | "layers" | "palette";

const NAV_ITEMS: { tab: StudioTab; icon: typeof PlusCircle; label: string; title: string }[] = [
  { tab: "library", icon: PlusCircle, label: "Adicionar", title: "Biblioteca de Seções" },
  { tab: "layers", icon: Layers, label: "Camadas", title: "Estrutura de Camadas" },
  { tab: "palette", icon: Palette, label: "Paleta", title: "Paleta Global" },
];

interface StudioSidebarProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  hidden?: boolean;
}

export function StudioSidebar({ activeTab, setActiveTab, collapsed, setCollapsed, hidden }: StudioSidebarProps) {
  const { selectedSectionId, selectSection } = useEditorStore();

  return (
    <div className={cn("w-16 border-r border-text-100 bg-white flex flex-col items-center py-8 gap-6 z-50 shadow-[1px_0_0_rgba(0,0,0,0.05)]", hidden && "hidden")}>
      {NAV_ITEMS.map(({ tab, icon: Icon, label, title }) => {
        const isActive = activeTab === tab && !collapsed;
        return (
          <div key={tab} className="flex flex-col items-center gap-1 group">
            <button
              onClick={() => {
                setActiveTab(tab);
                setCollapsed(false);
                if (selectedSectionId === "global_theme") selectSection(null);
              }}
              aria-label={title}
              aria-pressed={isActive}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                isActive
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
              )}
              title={title}
            >
              <Icon className={cn("w-[14px] h-[14px] transition-transform", isActive ? "scale-105" : "group-hover:scale-105")} />
              {isActive && (
                <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
              )}
            </button>
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-tight transition-colors duration-300",
              isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
            )}>
              {label}
            </span>
          </div>
        );
      })}

      <div className="mt-auto flex flex-col gap-6 mb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir painel" : "Recolher painel"}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 transition-all border border-zinc-100"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          <ArrowLeft className={cn("w-3 h-3 transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}
