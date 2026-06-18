"use client";

import { motion } from "framer-motion";
import { Layout, Sparkles, ArrowRight, Settings, Globe } from "lucide-react";
import Link from "next/link";

export default function EditorEntryPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-surface-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/30 border border-text-100 overflow-hidden relative group">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32 transition-colors group-hover:bg-primary/10" />

          <div className="relative p-12 flex flex-col items-center text-center">
            {/* Icon stack */}
            <div className="relative mb-10">
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center relative z-10">
                <Layout className="w-10 h-10 text-primary" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-12 h-12 bg-[#1C1C2E] rounded-2xl shadow-lg border border-[#252540] flex items-center justify-center z-20"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>

            <h1 className="text-5xl font-display font-black text-text-900 mb-6 tracking-tight leading-[1.1]">
              Coringa <span className="text-primary">Studio</span>
            </h1>

            <p className="text-xl text-text-500 max-w-md leading-relaxed mb-12 font-medium">
              Transforme sua visão em realidade com o nosso ambiente de design focado e intuitivo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Link
                href="/admin/editor/focused"
                className="flex-1 w-full group/btn relative flex items-center justify-center gap-4 bg-primary text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-[#4F46E5] hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                <Layout className="w-5 h-5" />
                <span>Iniciar Editor</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 pt-12 border-t border-[#1C1C2E] w-full flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-xs font-bold text-text-400">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Sincronização Ativa
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-text-400">
                <Settings className="w-3 h-3" />
                Configurações de Tema
              </div>
              <Link href="/" target="_blank" className="flex items-center gap-2 text-xs font-bold text-text-400 hover:text-primary transition-colors">
                <Globe className="w-3 h-3" />
                Ver Site
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
