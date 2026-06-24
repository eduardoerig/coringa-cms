"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Arquivo não é uma imagem.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const ext = file.name.split(".").pop();
      const fileName = `editor/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error("Upload error:", error);
        // Mostra a causa real (permissão, URL errada, rede) em vez de mensagem genérica.
        setUploadError(`Falha no upload: ${error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Falha no upload: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Permite reenviar o mesmo arquivo logo em seguida (onChange não dispara p/ valor igual).
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // Só limpa o estado ao sair do container de fato — ignora o dragleave que
  // dispara quando o cursor apenas entra num elemento filho (evita o flicker).
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-500">
          {label}
        </label>
      )}

      {value ? (
        <div
          className="relative group rounded-xl overflow-hidden border border-text-100 bg-surface-50"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
          />

          {/* Overlay de ações: trocar (abre seletor) ou remover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/45 transition-all">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-text-900 rounded-lg text-xs font-bold shadow-sm hover:bg-surface-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Remover
            </button>
          </div>

          {/* Spinner enquanto substitui */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 border-2 border-dashed border-primary rounded-xl pointer-events-none">
              <span className="text-xs font-bold text-primary">Solte para trocar</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-text-200 bg-surface-50/50 hover:border-primary/50 hover:bg-surface-50"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-text-300" />
              <span className="text-xs text-text-400">
                Clique ou arraste uma imagem
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadError && (
        <p className="text-xs font-medium text-red-600 bg-red-500/10 rounded-lg px-2.5 py-1.5 break-words">
          {uploadError}
        </p>
      )}
    </div>
  );
}
