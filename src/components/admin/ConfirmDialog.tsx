"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { ConfirmState } from "@/hooks/useConfirm";

interface Props {
  state: ConfirmState | null;
  onRespond: (value: boolean) => void;
}

export function ConfirmDialog({ state, onRespond }: Props) {
  return (
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
            className="bg-[#12121C] border border-[#252540] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5"
          >
            <div className="flex items-start gap-3">
              {state.options.variant === "danger" && (
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-[#F1F5F9] text-base leading-snug">
                  {state.options.title}
                </h3>
                {state.options.message && (
                  <p className="text-[#94A3B8] text-sm mt-1.5 leading-relaxed">
                    {state.options.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onRespond(false)}
                className="px-4 py-2 text-sm font-bold text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1C1C2E] rounded-xl transition-colors"
              >
                {state.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                onClick={() => onRespond(true)}
                className={
                  state.options.variant === "danger"
                    ? "px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all active:scale-95"
                    : "px-4 py-2 text-sm font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-xl transition-all active:scale-95"
                }
              >
                {state.options.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
