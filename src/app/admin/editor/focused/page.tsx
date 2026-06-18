"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Save, Globe, Loader2, Check, LayoutPanelLeft, PlusCircle, Layers, Palette, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLibrary } from "@/components/editor/SectionLibrary";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { ColorPalettePanel } from "@/components/editor/ColorPalettePanel";
import { useEditorStore } from "@/stores/editorStore";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { FranchiseProvider } from "@/context/FranchiseContext";

type Tab = "library" | "layers" | "palette";

type Toast = { id: number; message: string; type: "success" | "error" };


export default function FocusedEditorPage() {
  const { sections, setSections, isDirty, isSaving, setSaving, theme, setTheme, selectSection, selectedSectionId } = useEditorStore();
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [isPublished, setIsPublished] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const supabase = createClient();

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    async function load() {
      const { data: layoutData } = await supabase
        .from("page_layouts")
        .select("*")
        .eq("id", "home")
        .single();

      if (layoutData) {
        setSections(layoutData.sections || []);
        setIsPublished(layoutData.is_published ?? false);
      }

      const { data: themeData } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("group", "aparencia");
      
      if (themeData) {
        const themeMap: Record<string, string> = {};
        themeData.forEach(item => {
          themeMap[item.key] = item.value;
        });
        setTheme(themeMap);
      }

      setLoading(false);
    }
    load();
  }, [supabase, setSections, setTheme]);

  const handleSave = useCallback(
    async (publish?: boolean) => {
      setSaving(true);
      try {
        const payload: Record<string, unknown> = {
          sections,
          updated_at: new Date().toISOString(),
        };

        if (publish !== undefined) {
          payload.is_published = publish;
          setIsPublished(publish);
        }

        const { error } = await supabase
          .from("page_layouts")
          .upsert({ id: "home", name: "Página Principal", ...payload });

        if (error) {
          console.error("Erro ao salvar layout:", error);
          addToast("Erro ao salvar. Verifique o console.", "error");
          return;
        }

        const { theme } = useEditorStore.getState();
        if (Object.keys(theme).length > 0) {
          const themeUpdates = Object.entries(theme).map(([key, value]) => {
            let label = "Configuração de Tema";
            let type = "color";
            if (key === "dashboard_primary_color") label = "Cor Primária Admin";
            if (key === "dashboard_bg_color") label = "Cor de Fundo Admin";
            if (key === "theme_primary_color") label = "Cor Primária";
            if (key === "theme_bg_color") label = "Cor de Fundo";

            return supabase
              .from("site_settings")
              .upsert({ 
                key, 
                value, 
                group: "aparencia",
                label,
                type,
                updated_at: new Date().toISOString() 
              });
          });
          
          await Promise.all(themeUpdates);
        }

        useEditorStore.getState().setDirty(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    },
    [sections, supabase, setSaving]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA" || activeElement?.getAttribute("contenteditable") === "true") return;

        const { selectedSectionId, removeSection } = useEditorStore.getState();
        if (selectedSectionId) {
          e.preventDefault();
          if (window.confirm("Deseja realmente remover esta seção?")) {
            removeSection(selectedSectionId);
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-zinc-200 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Carregando Studio</span>
        </div>
      </div>
    );
  }

  const adminThemeStyles = {
    '--theme-primary': "#18181B",
    '--theme-primary-dark': "#000000",
    '--theme-primary-light': "#3F3F46",
    '--theme-primary-soft': "#F4F4F5",
    '--theme-primary-bg': "#FAFAFA",
    '--theme-surface-50': "#FFFFFF",
  } as React.CSSProperties;

  return (
    <FranchiseProvider>
      <div 
        className="flex flex-col h-screen bg-white overflow-hidden selection:bg-zinc-900 selection:text-white"
        style={adminThemeStyles}
      >
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: 40, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.9 }}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold pointer-events-auto",
                  t.type === "success" ? "bg-white border-green-100 text-zinc-900" : "bg-red-50 border-red-100 text-red-700")}>
                {t.type === "success" ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-[12px]">{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Top Header */}
        <div className="h-14 border-b border-zinc-100 bg-white flex items-center justify-between px-5 flex-shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/editor"
              onClick={(e) => { if (isDirty && !window.confirm("Há alterações não salvas. Deseja sair mesmo assim?")) e.preventDefault(); }}
              className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Sair do Editor</span>
            </Link>
            <div className="h-6 w-px bg-text-100" />
            <div className="flex flex-col">
              <h1 className="text-xs font-black text-text-900 uppercase tracking-widest leading-none">Ambiente Focado</h1>
              <p className="text-[10px] text-text-400 font-bold mt-1">Editando: Home Page</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showSaved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest mr-4"
              >
                <Check className="w-4 h-4" />
                Alterações Salvas
              </motion.div>
            )}

            <button 
              onClick={() => handleSave()}
              disabled={isSaving || !isDirty}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                isDirty 
                  ? "bg-text-900 text-white shadow-xl shadow-text-900/20 hover:bg-primary hover:shadow-primary/30" 
                  : "bg-surface-100 text-text-300 cursor-not-allowed"
              )}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
            
            <button 
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                isPublished 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
              )}
            >
              <Globe className="w-4 h-4" />
              {isPublished ? "Publicado" : "Publicar Site"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Studio Sidebar Nav */}
          <div className="w-16 border-r border-text-100 bg-white flex flex-col items-center py-8 gap-6 z-50 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
            {/* Biblioteca */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("library");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "library" && !leftSidebarCollapsed 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105" 
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Biblioteca de Seções"
              >
                <PlusCircle className={cn("w-[14px] h-[14px] transition-transform", activeTab === "library" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "library" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "library" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Adicionar
              </span>
            </div>

            {/* Camadas */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("layers");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "layers" && !leftSidebarCollapsed 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105" 
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Estrutura de Camadas"
              >
                <Layers className={cn("w-[14px] h-[14px] transition-transform", activeTab === "layers" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "layers" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "layers" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Camadas
              </span>
            </div>

            {/* Paleta */}
            <div className="flex flex-col items-center gap-1 group">
              <button
                onClick={() => {
                  setActiveTab("palette");
                  setLeftSidebarCollapsed(false);
                  if (selectedSectionId === "global_theme") selectSection(null);
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                  activeTab === "palette" && !leftSidebarCollapsed 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105" 
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
                title="Paleta Global"
              >
                <Palette className={cn("w-[14px] h-[14px] transition-transform", activeTab === "palette" && !leftSidebarCollapsed ? "scale-105" : "group-hover:scale-105")} />
                {activeTab === "palette" && !leftSidebarCollapsed && (
                  <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                )}
              </button>
              <span className={cn(
                "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                activeTab === "palette" && !leftSidebarCollapsed ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
              )}>
                Paleta
              </span>
            </div>
            
            <div className="mt-auto flex flex-col gap-6 mb-4">
              {/* Estilo */}
              <div className="flex flex-col items-center gap-1 group">
                <button
                  onClick={() => {
                    selectSection("global_theme");
                    setLeftSidebarCollapsed(true);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                    selectedSectionId === "global_theme" 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105" 
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                  title="Cores e Estilo"
                >
                  <Palette className={cn("w-[14px] h-[14px] transition-transform", selectedSectionId === "global_theme" ? "scale-105" : "group-hover:scale-105")} />
                  {selectedSectionId === "global_theme" && (
                    <motion.div layoutId="nav-pill" className="absolute -left-5 w-1 h-5 bg-zinc-900 rounded-r-full shadow-[4px_0_15px_rgba(0,0,0,0.1)]" />
                  )}
                </button>
                <span className={cn(
                  "text-[7px] font-normal uppercase tracking-tight transition-colors duration-300",
                  selectedSectionId === "global_theme" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"
                )}>
                  Estilo
                </span>
              </div>

               <button
                onClick={() => {
                  setLeftSidebarCollapsed(!leftSidebarCollapsed);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 transition-all border border-zinc-100"
                title={leftSidebarCollapsed ? "Expandir" : "Recolher"}
              >
                <ArrowLeft className={cn("w-3 h-3 transition-transform duration-500", leftSidebarCollapsed && "rotate-180")} />
              </button>
            </div>
          </div>

          {/* Focused Side Panel Content */}
          <motion.div 
            initial={false}
            animate={{ width: leftSidebarCollapsed ? 0 : 360 }}
            className="flex-shrink-0 z-40 shadow-[20px_0_40px_rgba(0,0,0,0.02)] overflow-hidden flex bg-white relative"
          >
            <div className="w-[360px] h-full overflow-y-auto custom-scrollbar">
              {activeTab === "library" && <SectionLibrary />}
              {activeTab === "layers" && <LayerPanel />}
              {activeTab === "palette" && <ColorPalettePanel />}
            </div>
          </motion.div>

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-hidden bg-[#F1F3F5] flex flex-col relative">
            <EditorCanvas onOpenLibrary={() => { setActiveTab("library"); setLeftSidebarCollapsed(false); }} />
            
            {/* Right Panel Toggle Button - Floating */}
            <button
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              className={cn(
                "absolute right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white border border-text-100 shadow-2xl rounded-2xl flex items-center justify-center text-text-400 hover:text-text-900 hover:scale-110 transition-all active:scale-95",
                rightSidebarCollapsed && "translate-x-2"
              )}
            >
              <LayoutPanelLeft className={cn("w-5 h-5 transition-transform", !rightSidebarCollapsed && "rotate-180")} />
            </button>
          </div>

          {/* Right Properties Panel */}
          <motion.div
            initial={false}
            animate={{ width: rightSidebarCollapsed ? 0 : 420 }}
            className="flex-shrink-0 overflow-hidden border-l border-text-100 bg-white z-40 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]"
          >
            <div className="w-[420px] h-full overflow-y-auto custom-scrollbar">
              <PropertiesPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </FranchiseProvider>
  );
}
