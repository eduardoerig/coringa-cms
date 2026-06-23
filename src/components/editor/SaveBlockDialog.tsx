"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, X, Loader2 } from "lucide-react";

interface SaveBlockDialogProps {
  open: boolean;
  defaultName?: string;
  onSave: (name: string) => Promise<void> | void;
  onClose: () => void;
}

export function SaveBlockDialog({ open, defaultName = "", onSave, onClose }: SaveBlockDialogProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[420] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
          {/* Form num subcomponente: monta a cada abertura, então o estado inicia limpo (sem useEffect). */}
          <SaveBlockForm defaultName={defaultName} onSave={onSave} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function SaveBlockForm({
  defaultName,
  onSave,
  onClose,
}: {
  defaultName: string;
  onSave: (name: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const clean = name.trim();
    if (!clean || saving) return;
    setSaving(true);
    await onSave(clean);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ duration: 0.18 }}
      className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-zinc-200 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-black text-zinc-900 text-base leading-none">Salvar como bloco</h3>
          <p className="text-[11px] text-zinc-400 font-bold mt-1">Reutilize em qualquer página</p>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <label className="text-[11px] font-bold text-zinc-500 block mb-1.5">Nome do bloco</label>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder="Ex.: Seção de depoimentos"
        className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
      />

      <div className="flex items-center gap-2 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-zinc-600 hover:bg-zinc-100 transition-all">Cancelar</button>
        <button
          onClick={submit}
          disabled={!name.trim() || saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider bg-zinc-900 text-white hover:bg-primary disabled:opacity-40 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
          Salvar
        </button>
      </div>
    </motion.div>
  );
}
