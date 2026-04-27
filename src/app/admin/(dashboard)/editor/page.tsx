"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Save, Globe, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { SectionLibrary } from "@/components/editor/SectionLibrary";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { useEditorStore } from "@/stores/editorStore";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function EditorPage() {
  const { sections, setSections, isDirty, isSaving, setSaving } = useEditorStore();
  const [isPublished, setIsPublished] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load layout
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("page_layouts")
        .select("*")
        .eq("id", "home")
        .single();

      if (data) {
        setSections(data.sections || []);
        setIsPublished(data.is_published ?? false);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save
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
          console.error("Erro ao salvar:", error);
          alert("Erro ao salvar. Verifique o console.");
        } else {
          useEditorStore.getState().setDirty(false);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      } finally {
        setSaving(false);
      }
    },
    [sections, supabase, setSaving]
  );

  // Keyboard shortcuts (Ctrl+S and Delete/Backspace)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Salvar: Ctrl + S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      
      // Deletar: Delete ou Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        // Ignora se estiver digitando em um input, textarea ou contenteditable (Tiptap)
        const activeElement = document.activeElement;
        if (
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA" ||
          activeElement?.getAttribute("contenteditable") === "true"
        ) {
          return;
        }

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
      <div className="flex items-center justify-center h-screen bg-surface-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] lg:h-screen bg-white md:overflow-hidden rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-text-100 md:border-none md:m-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 px-4 py-3 border-b border-text-100 bg-white z-10 sticky top-0">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-text-500 hover:text-text-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>

        <div className="flex-1 flex items-center flex-wrap gap-2 md:gap-3 min-w-[200px]">
          <h1 className="font-display font-black text-primary text-lg md:text-xl">Editor da Página</h1>
          {isDirty && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              Não salvo
            </span>
          )}
          {showSaved && (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
              <Check className="w-3 h-3" /> Salvo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-text-400 hover:text-text-900 p-2 rounded-xl hover:bg-surface-50 transition-colors hidden sm:flex"
            title="Ver site"
          >
            <Globe className="w-5 h-5" />
          </a>

          <button
            onClick={() => handleSave()}
            disabled={isSaving || !isDirty}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all",
              isDirty
                ? "bg-text-900 text-white hover:bg-ink-800 shadow-sm"
                : "bg-text-100 text-text-400 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isPublished
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-white hover:bg-primary-dark shadow-primary"
            )}
          >
            {isPublished ? "Publicado ✓" : "Publicar"}
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
        <SectionLibrary />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
