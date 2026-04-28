"use client";

import { useEditorStore } from "@/stores/editorStore";
import { sectionRegistry, type PropField } from "./sections/registry";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { X, Plus, Trash2, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertiesPanel() {
  const { sections, selectedSectionId, selectSection, updateSectionProps, theme, updateTheme } = useEditorStore();

  if (selectedSectionId === "global_theme") {
    return (
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-text-100 bg-white flex flex-col md:h-full flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-text-100 sticky top-0 bg-white z-10">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Palette className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-text-900 text-sm truncate">
              Tema Global
            </h3>
            <p className="text-[10px] text-text-400 truncate">Configurações de cores da página</p>
          </div>
          <button
            onClick={() => selectSection(null)}
            className="p-1.5 rounded-lg text-text-400 hover:bg-text-100 hover:text-text-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <FieldRenderer
            field={{ key: "theme_primary_color", label: "Cor Primária", type: "color" }}
            value={theme.theme_primary_color || "#2563EB"}
            onChange={(val) => updateTheme("theme_primary_color", val as string)}
          />
          <FieldRenderer
            field={{ key: "theme_bg_color", label: "Cor de Fundo", type: "color" }}
            value={theme.theme_bg_color || "#FAFAFA"}
            onChange={(val) => updateTheme("theme_bg_color", val as string)}
          />
        </div>
      </div>
    );
  }

  const section = sections.find((s) => s.id === selectedSectionId);

  if (!section) {
    return (
      <div className="w-80 border-l border-text-100 bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-surface-50 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-text-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <p className="text-text-400 text-sm">Selecione uma seção para editar</p>
        </div>
      </div>
    );
  }

  const entry = sectionRegistry[section.type];
  if (!entry) return null;

  const Icon = entry.icon;

  const handleChange = (key: string, value: unknown) => {
    updateSectionProps(section.id, { [key]: value });
  };

  return (
    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-text-100 bg-white flex flex-col md:h-full flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-text-100 sticky top-0 bg-white z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-text-900 text-sm truncate">
            {entry.label}
          </h3>
          <p className="text-[10px] text-text-400 truncate">{entry.description}</p>
        </div>
        <button
          onClick={() => selectSection(null)}
          className="p-1.5 rounded-lg text-text-400 hover:bg-text-100 hover:text-text-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div key={section.id} className="flex-1 overflow-y-auto p-4 space-y-5">
        {entry.fields.map((field) => (
          <FieldRenderer
            key={field.key}
            field={field}
            value={section.props[field.key]}
            onChange={(val) => handleChange(field.key, val)}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Field Renderer ----

interface FieldRendererProps {
  field: PropField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const label = (
    <label className="text-xs font-bold uppercase tracking-wider text-text-500 block mb-1.5">
      {field.label}
    </label>
  );

  switch (field.type) {
    case "text":
      return (
        <div>
          {label}
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2.5 rounded-xl border border-text-200 bg-white text-sm text-text-900 placeholder:text-text-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          {label}
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-text-200 bg-white text-sm text-text-900 placeholder:text-text-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
          />
        </div>
      );

    case "url":
      return (
        <div>
          {label}
          <input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "https://..."}
            className="w-full px-3 py-2.5 rounded-xl border border-text-200 bg-white text-sm text-text-900 placeholder:text-text-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      );

    case "color":
      return (
        <div>
          {label}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(value as string) || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-10 rounded-lg border border-text-200 cursor-pointer"
            />
            <input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-text-200 bg-white text-sm text-text-900 font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </div>
        </div>
      );

    case "select":
      return (
        <div>
          {label}
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-text-200 bg-white text-sm text-text-900 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "richtext":
      return (
        <div>
          {label}
          <RichTextEditor
            content={(value as string) || ""}
            onChange={(html) => onChange(html)}
            placeholder={field.placeholder}
          />
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
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-text-500 block mb-2">
        {field.label}
      </label>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative bg-surface-50/50 border border-text-100 rounded-xl p-3 space-y-2.5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-text-300">#{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-lg text-text-400 hover:bg-text-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-1 rounded-lg text-text-400 hover:bg-text-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-text-200 mx-1" />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 rounded-lg text-text-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed",
            "border-text-200 text-text-400 text-xs font-medium",
            "hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
          )}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}
