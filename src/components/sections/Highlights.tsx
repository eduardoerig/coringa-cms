"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { CardSkeleton } from "@/components/ui/Skeletons";

interface HighlightItem {
  id: string | number;
  name: string;
  tag: string;
  image: string;
}

interface HighlightsProps {
  settings?: Record<string, string>;
  props?: Record<string, unknown>;
}

const defaultHighlights: HighlightItem[] = [
  { id: 1, name: "Produto Exemplo 1", tag: "Novidade", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+1" },
  { id: 2, name: "Produto Exemplo 2", tag: "Mais Pedido", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+2" },
  { id: 3, name: "Produto Exemplo 3", tag: "Tradicional", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+3" },
  { id: 4, name: "Produto Exemplo 4", tag: "Destaque", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+4" },
];

export function Highlights({ settings, props: editorProps }: HighlightsProps) {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [items, setItems] = useState<HighlightItem[]>(defaultHighlights);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 280 + 24; // card width + gap
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, items.length - 1));
  };

  const title = (editorProps?.title as string) || "Nossos Queridinhos";
  const subtitle = (editorProps?.subtitle as string) || "Descubra os produtos que fazem o maior sucesso entre nossos clientes.";

  useEffect(() => {
    let isMounted = true;
    
    async function fetchHighlights() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          setItems(data.map(p => ({
            id: p.id,
            name: p.title,
            tag: p.tag || 'Destaque',
            image: p.image_url || 'https://placehold.co/400x400/eeeeee/999999?text=Sem+Imagem'
          })));
        }
      } catch (err) {
        console.error("Erro ao buscar destaques:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchHighlights();
    
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const isDark = editorProps?.darkTheme === "true";
  const bgStyle = editorProps?.backgroundColor ? { backgroundColor: editorProps.backgroundColor as string } : {};

  return (
    <section id="destaques" ref={ref} className="py-24 relative overflow-hidden bg-surface-50" style={bgStyle}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-tertiary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Destaques</span>
            <h2 className={`text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-text-900'}`}>
              {title}
            </h2>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-white/80' : 'text-text-500'}`}>
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Skeleton loading */}
        {loading ? (
          <div className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 -mx-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-none w-[260px] md:w-[280px]">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-text-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-text-900 font-display font-bold text-xl mb-2">Nenhum destaque ainda</h3>
            <p className="text-text-400 text-sm">Os produtos em destaque aparecerão aqui em breve.</p>
          </div>
        ) : (
          <>
            <div className="relative">
            {/* Seta esquerda */}
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-text-100 rounded-full items-center justify-center shadow-lg text-text-500 hover:text-primary hover:border-primary/30 transition-all"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory pt-4 px-4 -mx-4 scrollbar-hide"
            >
              {items.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -10 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="group relative flex-none w-[260px] md:w-[280px] snap-start border border-text-100/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer isolate"
                  style={{ backgroundColor: (editorProps?.cardBgColor as string) || "#FFFFFF" }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-surface-200/80 rounded-full opacity-0 blur-xl group-hover:blur-3xl group-hover:scale-[15] group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none -z-10" />
                  
                  <div className="relative h-[240px] flex items-center justify-center bg-surface-50 overflow-visible z-10 transition-colors duration-500 group-hover:bg-transparent">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      width={250} 
                      height={250} 
                      className="max-h-[190px] w-auto drop-shadow-sm z-20 group-hover:scale-[1.15] group-hover:-translate-y-3 group-hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                    />
                  </div>

                  <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-tertiary text-[10px] font-bold uppercase tracking-widest">{item.tag}</span>
                      <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-text-300 group-hover:bg-primary-hover group-hover:text-white transition-colors duration-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-text-900 text-xl leading-tight">{item.name}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Seta direita */}
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-text-100 rounded-full items-center justify-center shadow-lg text-text-500 hover:text-primary hover:border-primary/30 transition-all"
              aria-label="Próximo"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            </div>

            {/* Dots indicadores */}
            <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const cardWidth = 280 + 24; // card + gap
                  el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                }}
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === i
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-text-200 hover:bg-text-300"
                }`}
                aria-label={`Ir para destaque ${i + 1}`}
              />
            ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}

