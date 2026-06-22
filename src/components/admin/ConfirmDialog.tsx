"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import type { ConfirmState } from "@/hooks/useConfirm";

interface Props {
  state: ConfirmState | null;
  onRespond: (value: boolean) => void;
  /** Paleta do diálogo. `dark` = dashboard admin (padrão); `light` = editor. */
  tone?: "dark" | "light";
}

export function ConfirmDialog({ state, onRespond, tone = "dark" }: Props) {
  // Renderiza num portal no <body> para que o `fixed` se ancore na viewport,
  // e não em algum ancestral com `transform` (ex.: o zoom do canvas do editor).
  if (typeof document === "undefined") return null;

  const isLight = tone === "light";
  const card = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#12121C] border border-[#252540]";
  const titleColor = isLight ? "text-zinc-900" : "text-[#F1F5F9]";
  const messageColor = isLight ? "text-zinc-500" : "text-[#94A3B8]";
  const cancelBtn = isLight
    ? "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
    : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1C1C2E]";
  const defaultConfirmBtn = isLight
    ? "text-white bg-zinc-900 hover:bg-zinc-800"
    : "text-white bg-[#6366F1] hover:bg-[#4F46E5]";

  return createPortal(
    <AnimatePresence>
      {state?.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => onRespond(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
            className={`${card} rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5`}
          >
            <div className="flex items-start gap-3">
              {state.options.variant === "danger" && (
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              )}
              <div>
                <h3 className={`font-bold ${titleColor} text-base leading-snug`}>
                  {state.options.title}
                </h3>
                {state.options.message && (
                  <p className={`${messageColor} text-sm mt-1.5 leading-relaxed`}>
                    {state.options.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onRespond(false)}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${cancelBtn}`}
              >
                {state.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                onClick={() => onRespond(true)}
                className={
                  state.options.variant === "danger"
                    ? "px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all active:scale-95"
                    : `px-4 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${defaultConfirmBtn}`
                }
              >
                {state.options.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
