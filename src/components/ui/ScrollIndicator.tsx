"use client";

import { motion } from "framer-motion";

interface DividerProps {
  props?: {
    style?: "scroll_arrow" | "line" | "space" | "wave";
  };
}

export function ScrollIndicator({ props }: DividerProps) {
  const style = props?.style || "scroll_arrow";

  if (style === "line") {
    return (
      <div className="py-16 bg-surface-50 flex items-center justify-center">
        <div className="w-24 h-1 bg-text-200 rounded-full" />
      </div>
    );
  }

  if (style === "space") {
    return <div className="h-24 bg-surface-50" />;
  }

  if (style === "wave") {
    return (
      <div className="w-full bg-surface-50 overflow-hidden leading-none rotate-180 -mt-1 relative z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px]">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="flex flex-col items-center gap-2 py-8 bg-surface-50"
    >
      <span className="text-text-300 text-[10px] font-bold uppercase tracking-[0.2em]">Role para baixo</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        <svg className="w-5 h-5 text-text-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}
