"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }, 1200); 
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(safetyTimeout);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-3xl"
        >
          {/* Spinner CSS puro */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary drop-shadow-lg"
          />
          
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="mt-6 text-primary font-bold tracking-widest text-sm uppercase"
          >
            Carregando...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
