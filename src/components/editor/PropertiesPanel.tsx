"use client";

import { useEditorStore } from "@/stores/editorStore";
import { sectionRegistry, type PropField } from "./sections/registry";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { X, Plus, Trash2, ChevronUp, ChevronDown, Palette, Settings2, Sparkles, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "content" | "design";

export function PropertiesPanel() {
  const { sections, selectedSectionId, selectSection, updateSectionProps, theme, updateTheme } = useEditorStore();
  const [activeTab, setActiveTab] = useState<TabType>("content");

  const selectedSection = useMemo(() => 
    sections.find((s) => s.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  const entry = selectedSection ? sectionRegistry[selectedSection.type] : null;

  // Render Theme Global if selected
  if (selectedSectionId === "global_theme") {
    return (
      <div className="w-full border-l border-text-100 bg-white flex flex-col h-full flex-shrink-0 z-20 shadow-xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-6 pt-6 bg-surface-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Palette className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black text-text-900 text-[15px] truncate tracking-tight">
                Tema Global
              </h3>
              <p className="text-[10px] text-text-400 font-bold uppercase tracking-widest">Identidade Visual</p>
            </div>
            <button
              onClick={() => selectSection(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-text-400 hover:bg-surface-100 transition-colors border border-text-100 bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <Accordion title="Paleta de Cores" icon={<Palette className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-6 pt-2">
              <FieldRenderer
                field={{ key: "theme_primary_color", label: "Cor Primária (Rosé)", type: "color" }}
                value={theme.theme_primary_color || "#C8687B"}
                onChange={(val) => updateTheme("theme_primary_color", val as string)}
              />
              <FieldRenderer
                field={{ key: "theme_tertiary_color", label: "Cor de Destaque (Dourado)", type: "color" }}
                value={theme.theme_tertiary_color || "#D4AF37"}
                onChange={(val) => updateTheme("theme_tertiary_color", val as string)}
              />
              <FieldRenderer
                field={{ key: "theme_bg_color", label: "Fundo Geral", type: "color" }}
                value={theme.theme_bg_color || "#FFF8F6"}
                onChange={(val) => updateTheme("theme_bg_color", val as string)}
              />
            </div>
          </Accordion>

          <Accordion title="Tipografia" icon={<Settings2 className="w-4 h-4" />}>
            <div className="space-y-6 pt-2">
              <FieldRenderer
                field={{
                  key: "theme_font_sans",
                  label: "Fonte Base (Corpo)",
                  type: "select",
                  options: [
                    { value: "inter", label: "Inter" },
                    { value: "roboto", label: "Roboto" },
                    { value: "poppins", label: "Poppins" },
                  ]
                }}
                value={theme.theme_font_sans || "inter"}
                onChange={(val) => updateTheme("theme_font_sans", val as string)}
              />
              <FieldRenderer
                field={{
                  key: "theme_font_display",
                  label: "Fonte Títulos",
                  type: "select",
                  options: [
                    { value: "space-grotesk", label: "Space Grotesk" },
                    { value: "inter", label: "Inter" },
                    { value: "outfit", label: "Outfit" },
                  ]
                }}
                value={theme.theme_font_display || "space-grotesk"}
                onChange={(val) => updateTheme("theme_font_display", val as string)}
              />
            </div>
          </Accordion>

          <CustomColorManager />

          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mt-4">
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
               <Sparkles className="w-3 h-3" />
               Studio Pro
            </p>
            <p className="text-[11px] text-text-500 leading-relaxed italic">
              As cores globais afetam todos os componentes do site. Use com sabedoria para manter a harmonia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no section selected
  if (!selectedSection || !entry) {
    return (
      <div className="w-full border-l border-text-100 bg-white flex flex-col h-full flex-shrink-0 z-20 overflow-hidden items-center justify-center p-8 text-center text-text-400">
        <div className="w-20 h-20 rounded-[2.5rem] bg-surface-50 flex items-center justify-center mb-6 border-2 border-dashed border-text-100">
          <Settings2 className="w-10 h-10 opacity-10" />
        </div>
        <p className="text-[13px] font-black text-text-900 mb-2 uppercase tracking-tight">Nada selecionado</p>
        <p className="text-xs leading-relaxed text-text-400 max-w-[240px]">
          Selecione uma seção no canvas ou na lista de camadas para editar suas propriedades.
        </p>
      </div>
    );
  }

  // Group fields for better organization
  const appearanceFieldsKeys = ["section_bg_type", "section_padding", "cardBgColor", "backgroundColor", "fillColor"];
  const arrayFields = entry.fields.filter(f => f.type === "array");
  const appearanceFields = entry.fields.filter(f => appearanceFieldsKeys.includes(f.key));
  const mainContentFields = entry.fields.filter(f => 
    !appearanceFieldsKeys.includes(f.key) && f.type !== "array"
  );

  return (
    <div className="w-full border-l border-text-100 bg-white flex flex-col h-full flex-shrink-0 z-20 shadow-xl overflow-hidden select-none">
      {/* Header */}
      <div className="px-6 pt-6 bg-surface-50/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Layout className="w-5.5 h-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-black text-text-900 text-[15px] truncate tracking-tight">
              {entry.label}
            </h3>
            <p className="text-[10px] text-text-400 font-bold uppercase tracking-widest">Edição de Bloco</p>
          </div>
          <button
            onClick={() => selectSection(null)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-400 hover:bg-surface-100 transition-colors border border-text-100 bg-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {/* Main Content Group */}
        {mainContentFields.length > 0 && (
          <Accordion title="Conteúdo" icon={<Sparkles className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-6 pt-2">
              {mainContentFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={selectedSection.props[field.key]}
                  onChange={(val) => updateSectionProps(selectedSection.id, { [field.key]: val })}
                />
              ))}
            </div>
          </Accordion>
        )}

        {/* Array Fields (Items) */}
        {arrayFields.map((field) => (
          <Accordion 
            key={field.key} 
            title={field.label} 
            icon={<Plus className="w-4 h-4" />}
            count={Array.isArray(selectedSection.props[field.key]) ? (selectedSection.props[field.key] as any[]).length : 0}
          >
            <div className="pt-2">
              <FieldRenderer
                field={field}
                value={selectedSection.props[field.key]}
                onChange={(val) => updateSectionProps(selectedSection.id, { [field.key]: val })}
              />
            </div>
          </Accordion>
        ))}

        {/* Appearance Group */}
        {appearanceFields.length > 0 && (
          <Accordion title="Aparência e Estilo" icon={<Palette className="w-4 h-4" />}>
            <div className="space-y-6 pt-2">
              {appearanceFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={selectedSection.props[field.key]}
                  onChange={(val) => updateSectionProps(selectedSection.id, { [field.key]: val })}
                />
              ))}
              
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl mt-4">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Sparkles className="w-3 h-3" />
                   Dica de Design
                </p>
                <p className="text-[11px] text-text-500 leading-relaxed italic">
                  Use fundos contrastantes entre as seções para criar um ritmo visual agradável na página.
                </p>
              </div>
            </div>
          </Accordion>
        )}
      </div>
    </div>
  );
}

// ---- Sub-components ----

function Accordion({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  count
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-text-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-50/50 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
            isOpen ? "bg-primary text-white" : "bg-white text-text-400 border border-text-100 shadow-sm"
          )}>
            {icon}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-text-900">{title}</span>
          {count !== undefined && (
            <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-text-100 text-text-400">
              {count}
            </span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-text-300 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 bg-white border-t border-text-100/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Sub-renderers ----

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: PropField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { theme } = useEditorStore();
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-2.5 bg-surface-50 border border-text-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-4 py-2.5 bg-surface-50 border border-text-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>
      );

    case "richtext":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <RichTextEditor
            content={(value as string) || ""}
            onChange={onChange}
          />
        </div>
      );

    case "select":
      // Injetar cores customizadas se for o campo de background
      const options = [...(field.options || [])];
      if (field.key === "section_bg_type") {
        try {
          const customColors = JSON.parse(theme.theme_custom_colors || '[]');
          customColors.forEach((c: any) => {
            options.push({ value: c.hex, label: `Custom: ${c.name}` });
          });
        } catch (e) {}
      }

      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-50 border border-text-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "color":
      const { theme } = useEditorStore();
      
      // Lista fixa das cores da marca + Neutros para garantir que nunca "sumam"
      const rawPresets = [
        { label: "Branco", value: "#FFFFFF" },
        { label: "Rosé Suave", value: "#FFF8F6" },
        { label: "Rosé Camarim", value: "#C8687B" },
        { label: "Escuro", value: "#18181B" },
        { label: "Dourado", value: "#D4AF37" },
        { label: "Cinza", value: "#71717A" },
      ];

      // Deduplicar por valor de cor para evitar clones visuais
      const uniquePresets = rawPresets.reduce((acc, curr) => {
        if (!acc.find(p => p.value.toLowerCase() === curr.value.toLowerCase())) {
          acc.push(curr);
        }
        return acc;
      }, [] as typeof rawPresets);

      return (
        <div className="space-y-3">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <div className="bg-surface-50 p-3 rounded-2xl border border-text-100 space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-mono font-bold text-text-400 bg-white px-2.5 py-1 rounded-lg border border-text-100/50">
                {String(value || "").toUpperCase()}
              </span>
              <div className="relative group/color">
                <input
                  type="color"
                  value={(value as string) || "#000000"}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer p-0 bg-transparent ring-1 ring-text-100 group-hover/color:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-text-100/50">
              {uniquePresets.map((preset) => (
                <button
                  key={`${field.key}-${preset.value}`}
                  type="button"
                  onClick={() => onChange(preset.value)}
                  className={cn(
                    "w-6 h-6 rounded-lg border border-text-100/50 transition-all hover:scale-110 active:scale-95 shadow-sm relative",
                    value === preset.value && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                >
                  {value === preset.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mix-blend-difference" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case "image":
      return (
        <ImageUploader
          label={field.label}
          value={(value as string) || ""}
          onChange={(url) => onChange(url)}
        />
      );

    case "url":
      return (
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
            {field.label}
          </label>
          <div className="relative">
             <input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || "https://..."}
              className="w-full px-4 py-2.5 bg-surface-50 border border-text-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      );

    case "array":
      return (
        <ArrayFieldRenderer
          field={field}
          value={(value as Record<string, unknown>[]) || []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

// ---- Array Field ----

function ArrayFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: PropField;
  value: Record<string, unknown>[];
  onChange: (value: unknown) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const blank: Record<string, unknown> = {};
    field.itemFields?.forEach((f) => {
      blank[f.key] = "";
    });
    onChange([...items, blank]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, val: unknown) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [key]: val } : item
    );
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-text-900 uppercase tracking-widest block pl-1">
        {field.label}
      </label>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative bg-surface-50/50 border border-text-100 rounded-2xl p-4 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-text-300 uppercase">Item #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-400 hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-400 hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-text-200 mx-1" />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-300 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {field.itemFields?.map((subField) => (
              <FieldRenderer
                key={subField.key}
                field={subField}
                value={item[subField.key]}
                onChange={(val) => updateItem(index, subField.key, val)}
              />
            ))}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed",
            "border-text-200 text-text-400 text-xs font-bold uppercase tracking-wider",
            "hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
          )}
        >
          <Plus className="w-4 h-4" />
          Adicionar Item
        </button>
      </div>
    </div>
  );
}
// ---- Custom Color Manager ----

function CustomColorManager() {
  const { theme, updateTheme } = useEditorStore();
  
  const colors = useMemo(() => {
    try {
      return JSON.parse(theme.theme_custom_colors || '[]');
    } catch (e) {
      return [];
    }
  }, [theme.theme_custom_colors]);

  const addColor = () => {
    const newColors = [...colors, { id: Date.now().toString(), name: "Nova Cor", hex: "#000000" }];
    updateTheme("theme_custom_colors", JSON.stringify(newColors));
  };

  const removeColor = (id: string) => {
    const newColors = colors.filter((c: any) => c.id !== id);
    updateTheme("theme_custom_colors", JSON.stringify(newColors));
  };

  const updateColor = (id: string, key: string, val: string) => {
    const newColors = colors.map((c: any) => c.id === id ? { ...c, [key]: val } : c);
    updateTheme("theme_custom_colors", JSON.stringify(newColors));
  };

  return (
    <Accordion title="Paleta Personalizada" icon={<Sparkles className="w-4 h-4" />}>
      <div className="space-y-4 pt-2">
        <p className="text-[10px] text-text-400 font-medium leading-relaxed italic">
          Crie cores que poderão ser usadas como fundo em qualquer seção da página.
        </p>

        <div className="space-y-3">
          {colors.map((color: any) => (
            <div key={color.id} className="p-3 bg-surface-50 rounded-xl border border-text-100 space-y-3 shadow-sm group">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor(color.id, "hex", e.target.value)}
                  className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm cursor-pointer p-0 bg-transparent ring-1 ring-text-100 shrink-0"
                />
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => updateColor(color.id, "name", e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-text-900 p-0"
                  placeholder="Nome da cor"
                />
                <button
                  onClick={() => removeColor(color.id)}
                  className="w-7 h-7 flex items-center justify-center text-text-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addColor}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-text-100 text-text-400 text-[11px] font-bold uppercase tracking-wider hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Cor
          </button>
        </div>
      </div>
    </Accordion>
  );
}
