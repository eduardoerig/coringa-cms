"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "@/hooks/useToast";

const config: Record<Toast["type"], { cls: string; icon: React.ReactNode }> = {
  success: {
    cls: "bg-[#12121C] border-green-500/25 text-[#F1F5F9]",
    icon: <Check className="w-4 h-4 text-green-400 shrink-0" />,
  },
  error: {
    cls: "bg-[#12121C] border-red-500/25 text-[#F1F5F9]",
    icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  },
  warning: {
    cls: "bg-[#12121C] border-amber-500/25 text-[#F1F5F9]",
    icon: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  },
};

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-8 right-8 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const { cls, icon } = config[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold pointer-events-auto min-w-[220px]",
                cls
              )}
            >
              {icon}
              <span className="text-[13px]">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
