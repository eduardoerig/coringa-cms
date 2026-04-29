"use client";

import { useEditorStore } from "@/stores/editorStore";
import { SectionWrapper } from "./SectionWrapper";
import { useCallback, useRef, useState } from "react";
import { Plus, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";

import { generatePalette } from "@/utils/colors";

export function EditorCanvas() {
  const { sections, moveSection, selectSection, selectedSectionId, theme } = useEditorStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragIndex !== null && index !== dragIndex) {
        setDropIndex(index);
      }
    },
    [dragIndex]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      dragCounter.current++;
      if (dragIndex !== null && index !== dragIndex) {
        setDropIndex(index);
      }
    },
    [dragIndex]
  );

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDropIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      dragCounter.current = 0;
      if (dragIndex !== null && dragIndex !== toIndex) {
        moveSection(dragIndex, toIndex);
      }
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, moveSection]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
    dragCounter.current = 0;
  }, []);

  const primaryColor = theme.theme_primary_color || "#2563EB";
  const surfaceBg = theme.theme_bg_color || "#FAFAFA";
  const palette = generatePalette(primaryColor);

  const textHeading = theme.theme_heading_color || "#18181B";
  const textBody = theme.theme_text_color || "#3F3F46";
  const tertiaryColor = theme.theme_tertiary_color || "#F59E0B";
  const primaryHover = theme.theme_button_hover || palette.dark;
  
  const fontSans = theme.theme_font_sans || "inter";
  const fontDisplay = theme.theme_font_display || "space-grotesk";

  const themeStyles = `
    :root {
      --theme-primary: ${palette.primary};
      --theme-primary-dark: ${palette.dark};
      --theme-primary-light: ${palette.light};
      --theme-primary-soft: ${palette.soft};
      --theme-primary-bg: ${palette.bg};
      --theme-primary-hover: ${primaryHover};
      --theme-surface-50: ${surfaceBg};
      --theme-text-heading: ${textHeading};
      --theme-text-body: ${textBody};
      --theme-tertiary: ${tertiaryColor};
      --font-sans: var(--font-${fontSans});
      --font-display: var(--font-${fontDisplay});
    }
  `;

  return (
    <div className="flex-1 min-h-[400px] md:min-h-0 bg-surface-50/50 overflow-y-auto p-4 md:p-6">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className="max-w-2xl mx-auto space-y-3">
        {sections.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-center py-32 flex flex-col items-center"
          >
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
              <div className="relative w-full h-full bg-surface-100 border border-text-100 shadow-sm rounded-2xl flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                <LayoutTemplate className="w-8 h-8 text-text-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
              </div>
            </div>
            <h3 className="font-display font-bold text-text-900 text-xl mb-2">
              Esta página está vazia
            </h3>
            <p className="text-text-500 text-sm max-w-xs mx-auto">
              Adicione blocos arrastando-os da biblioteca lateral ou clicando neles para começar a construir.
            </p>
          </motion.div>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Drop indicator */}
              {dropIndex === index && dragIndex !== null && dragIndex > index && (
                <div className="h-1 bg-primary rounded-full mb-2 mx-4 transition-all" />
              )}

              <SectionWrapper
                section={section}
                index={index}
                isSelected={selectedSectionId === section.id}
                isDragging={dragIndex === index}
                onSelect={() => selectSection(section.id)}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
              />

              {/* Drop indicator after */}
              {dropIndex === index && dragIndex !== null && dragIndex < index && (
                <div className="h-1 bg-primary rounded-full mt-2 mx-4 transition-all" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
