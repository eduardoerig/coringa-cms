"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useFranchiseModal } from "@/context/FranchiseContext";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface FranchiseProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
}

export function Franchise({ settings, props: editorProps }: FranchiseProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openModal } = useFranchiseModal();

  const title = (editorProps?.title as string) || "Seja um Franqueado";
  const description = (editorProps?.description as string) || "Faça parte da maior rede de sorveterias do Brasil e transforme o mercado de sobremesas na sua região.";
  const buttonText = (editorProps?.buttonText as string) || "Quero Abrir uma Unidade";
  const imageSrc = (editorProps?.image as string) || "/imagens_originais/img_mapa-unidades.png.webp";
  const stats = (editorProps?.stats as Array<{value: string; label: string}>) || [
    { value: "700+", label: "Unidades" },
    { value: "40+", label: "Anos de Sucesso" },
  ];
  const isHtml = description.includes("<");

  const styles = getSectionStyles(editorProps || {});

  return (
    <section id="franquia" className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={cn(
          "rounded-[40px] shadow-2xl overflow-hidden border",
          styles.isDark ? "bg-black/20 border-white/10" : "bg-white border-primary/10"
        )}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Content */}
            <motion.div 
              ref={ref}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
              className="p-10 md:p-16 lg:p-20 flex flex-col justify-center"
            >
              <span className="text-tertiary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Expansão</span>
              <h2 className={cn(
                "text-3xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black tracking-tight mb-8",
                styles.isDark ? "text-white" : "text-text-900"
              )}>
                {title}
              </h2>
              
              <div className={cn(
                "space-y-6 text-lg leading-relaxed mb-12",
                styles.isDark ? "text-white/80" : "text-text-500"
              )}>
                {isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                  description.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className={cn(
                      "text-4xl md:text-5xl font-display font-black mb-2",
                      styles.isDark ? "text-white" : "text-text-900"
                    )}>{stat.value}</div>
                    <div className={cn(
                      "text-sm font-bold uppercase tracking-wider",
                      styles.isDark ? "text-tertiary" : "text-text-400"
                    )}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={openModal}
                className={cn(
                  "group w-full sm:w-auto font-bold px-10 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3",
                  styles.isDark 
                    ? "bg-white text-text-900 hover:bg-white/90 shadow-xl" 
                    : "bg-primary text-white shadow-primary hover:bg-primary-hover"
                )}
              >
                <span>{buttonText}</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2 }}
              className="relative min-h-[280px] lg:min-h-full flex items-center justify-center p-8 lg:p-12"
            >
              <div className="relative w-full h-full min-h-[240px] lg:min-h-[360px] rounded-2xl overflow-hidden">
                <Image 
                  src={imageSrc} 
                  alt="Mapa de unidades" 
                  fill
                  className="object-contain object-center" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
