"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `editor/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error("Upload error:", error);
        alert("Erro ao fazer upload da imagem.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-500">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-text-100 bg-surface-50">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-text-900/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
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
    </div>
  );
}
