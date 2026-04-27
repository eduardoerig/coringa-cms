"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AboutProps {
  settings?: Record<string, string>;
  props?: Record<string, unknown>;
}

export function About({ settings, props: editorProps }: AboutProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const title = (editorProps?.title as string) || "Nossa História";
  const text = (editorProps?.content as string) || "Nascemos com o sonho de oferecer o melhor para nossos clientes. Com dedicação e paixão, construímos uma trajetória de sucesso e tradição no mercado.";
  const buttonText = (editorProps?.buttonText as string) || "Conheça a história completa";
  const buttonLink = (editorProps?.buttonLink as string) || "#";
  const imageSrc = (editorProps?.image as string) || "https://placehold.co/800x800/eeeeee/999999?text=Nossa+Historia";
  const isHtml = text.includes("<");

  return (
    <section id="sobre" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <motion.div 
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">A Nossa História</span>
            <h2 className="text-3xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black text-text-900 tracking-tight mb-8">
              {title}
            </h2>
            
            <div className="space-y-6 text-text-500 text-lg leading-relaxed mb-10">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: text }} />
              ) : (
                text.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              )}
            </div>

            <div className="flex gap-4">
              <a href={buttonLink} target="_blank" rel="noreferrer" className="group rounded-full bg-primary-bg text-primary font-bold px-8 py-4 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors duration-300">
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
            <div className="absolute inset-0 bg-surface-100 rounded-[30px] rotate-3 scale-105 z-0" />
            <div className="relative z-10 w-full overflow-hidden rounded-[40px] shadow-2xl flex flex-col items-center border-[8px] border-white">
              <Image 
                src={imageSrc} 
                alt="Nossa História"
                width={800} 
                height={800} 
                className="w-full object-cover object-center max-h-[500px]" 
              />
            </div>
            {/* Decal */}
            <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl z-20 flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">80</div>
              <div>
                <div className="text-[10px] md:text-xs text-text-400 font-bold uppercase tracking-widest leading-none">Década</div>
                <div className="font-display font-bold text-text-900 text-base md:text-lg">De Origem</div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
