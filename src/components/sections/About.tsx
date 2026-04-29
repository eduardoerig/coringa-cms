"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { getSectionStyles } from "@/utils/sectionStyles";

interface AboutProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
}

export function About({ settings, props: editorProps }: AboutProps) {
  const styles = getSectionStyles(editorProps || {});
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const title = (editorProps?.title as string) || "Nossa História";
  const text = (editorProps?.content as string) || "Nascemos com o sonho de oferecer o melhor para nossos clientes. Com dedicação e paixão, construímos uma trajetória de sucesso e tradição no mercado.";
  const buttonText = (editorProps?.buttonText as string) || "Conheça a história completa";
  const buttonLink = (editorProps?.buttonLink as string) || "#";
  const imageSrc = (editorProps?.image as string) || "https://placehold.co/800x800/eeeeee/999999?text=Nossa+Historia";
  const isHtml = text.includes("<");

  return (
    <section id="sobre" ref={ref} className={`relative overflow-hidden ${styles.container}`} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 block ${styles.isDark ? 'text-white/60' : 'text-tertiary'}`}>A Nossa História</span>
            <h2 className={`text-3xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black tracking-tight mb-8 ${styles.isDark ? 'text-white' : 'text-text-900'}`}>
              {title}
            </h2>
            
            <div className={`space-y-6 text-lg leading-relaxed mb-10 ${styles.isDark ? 'text-white/80' : 'text-text-500'}`}>
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: text }} />
              ) : (
                text.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              )}
            </div>

            <div className="flex gap-4">
              <a href={buttonLink} target="_blank" rel="noreferrer" className={`group rounded-full font-bold px-8 py-4 flex items-center gap-2 transition-all duration-300 ${styles.isDark ? 'bg-white text-text-900 hover:bg-white/90 shadow-xl' : 'bg-primary-bg text-primary hover:bg-primary-hover hover:text-white'}`}>
                <span>{buttonText}</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className={`absolute inset-0 rounded-[30px] rotate-3 scale-105 z-0 ${styles.isDark ? 'bg-white/5' : 'bg-surface-100'}`} />
            <div className={`relative z-10 w-full overflow-hidden rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] ${styles.isDark ? 'border-white/10' : 'border-white'}`}>
              <Image 
                src={imageSrc} 
                alt="Nossa História"
                width={800} 
                height={800} 
                className="w-full object-cover object-center max-h-[500px]" 
              />
            </div>
            {/* Decal */}
            <div className={`absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl z-20 flex items-center gap-3 md:gap-4 ${styles.isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white'}`}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">10</div>
              <div>
                <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none ${styles.isDark ? 'text-white/40' : 'text-text-400'}`}>Anos</div>
                <div className={`font-display font-bold text-base md:text-lg ${styles.isDark ? 'text-white' : 'text-text-900'}`}>De Excelência</div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
