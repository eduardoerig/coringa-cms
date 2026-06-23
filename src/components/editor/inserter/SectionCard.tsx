"use client";

import { cn } from "@/lib/utils";
import { Plus, Lock } from "lucide-react";
import type { SectionRegistryEntry } from "../sections/registry";
import { SectionThumb } from "./SectionThumb";

const CATEGORY_COLOR: Record<string, string> = {
  Estrutura: "bg-blue-50 text-blue-600 border-blue-100",
  Conteúdo: "bg-violet-50 text-violet-600 border-violet-100",
  Conversão: "bg-amber-50 text-amber-700 border-amber-100",
};

export function SectionCard({
  entry,
  category,
  disabled,
  onInsert,
}: {
  entry: SectionRegistryEntry;
  category: string;
  disabled: boolean;
  onInsert: (type: string) => void;
}) {
  const Icon = entry.icon;

  return (
    <button
      type="button"
      onClick={() => !disabled && onInsert(entry.type)}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col text-left rounded-2xl border overflow-hidden transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed border-zinc-100 bg-zinc-50"
          : "bg-white border-zinc-200 hover:border-zinc-900 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      )}
    >
      {/* Prévia esquemática (wireframe fiel ao layout) */}
      <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50">
        <div className="absolute inset-0 p-5 flex transition-transform duration-300 group-hover:scale-[1.03]">
          <SectionThumb type={entry.type} />
        </div>

        <span
          className={cn(
            "absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm",
            CATEGORY_COLOR[category] ?? "bg-zinc-50 text-zinc-600 border-zinc-100"
          )}
        >
          {category}
        </span>

        {!disabled && (
          <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/30 transition-colors flex items-center justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-zinc-900 text-[11px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
              <Plus className="w-3.5 h-3.5" /> Inserir
            </span>
          </div>
        )}

        {disabled && (
          <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
            <span className="flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-wider bg-zinc-900/70 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Já na página
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5 px-3 py-3">
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
            disabled ? "bg-zinc-100 text-zinc-300" : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-zinc-900 leading-tight">{entry.label}</div>
          <div className="text-[11px] text-zinc-400 font-medium leading-snug mt-0.5 line-clamp-2">
            {entry.description}
          </div>
        </div>
      </div>
    </button>
  );
}
