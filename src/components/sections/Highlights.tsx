"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface HighlightItem {
  id: string | number;
  name: string;
  tag: string;
  image: string;
}

interface HighlightsProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
  isEditor?: boolean;
}

const defaultHighlights: HighlightItem[] = [
  { id: 1, name: "Produto Exemplo 1", tag: "Novidade", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+1" },
  { id: 2, name: "Produto Exemplo 2", tag: "Mais Pedido", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+2" },
  { id: 3, name: "Produto Exemplo 3", tag: "Tradicional", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+3" },
  { id: 4, name: "Produto Exemplo 4", tag: "Destaque", image: "https://placehold.co/400x400/eeeeee/999999?text=Produto+4" },
];

export function Highlights({ settings, props: editorProps, isEditor }: HighlightsProps) {
  const styles = getSectionStyles(editorProps || {});
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

  // Cores dinâmicas — tokens semânticos
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const cardBorderColor = (editorProps?.cardBorderColor as string) || "";
  const cardBgColor = (editorProps?.cardBgColor as string) || "";
  const tagBgColor = (editorProps?.tagBgColor as string) || "";
  const tagTextColor = (editorProps?.tagTextColor as string) || "";

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
          setItems(data.map((p: any) => ({
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

  // Resolve a cor de destaque para uso em estilos inline
  const resolvedAccent = accentColor || undefined;
  const resolvedBtn = btnBgColor || undefined;

  return (
    <section id="destaques" ref={ref} className={`relative overflow-hidden ${styles.container}`} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={isEditor ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span 
              className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 block`}
              style={{ color: resolvedAccent || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-tertiary)') }}
            >Destaques</span>
            <h2 
              className={`text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black tracking-tight mb-6`}
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >
              {title}
            </h2>
            <p 
              className={`text-lg leading-relaxed`}
              style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-500)') }}
            >
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
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${styles.isDark ? 'bg-white/10 text-white/40' : 'bg-surface-100 text-text-300'}`}>
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className={`font-display font-bold text-xl mb-2 ${styles.isDark ? 'text-white' : 'text-text-900'}`}>Nenhum destaque ainda</h3>
            <p className={`text-sm ${styles.isDark ? 'text-white/40' : 'text-text-400'}`}>Os produtos em destaque aparecerão aqui em breve.</p>
          </div>
        ) : (
          <>
            <div className="relative group/carousel">
              {/* Seta esquerda */}
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                className={cn(
                  "hidden md:flex absolute -left-4 md:-left-8 lg:-left-14 top-1/2 -translate-y-1/2 z-30",
                  "w-12 h-12 border rounded-full items-center justify-center shadow-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95"
                )}
                style={{
                  backgroundColor: styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                  borderColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)',
                  color: styles.isDark ? '#FFFFFF' : 'var(--color-text-500)',
                  '--hover-bg': resolvedBtn || resolvedAccent || 'var(--color-primary)',
                } as React.CSSProperties}
                onMouseEnter={(e) => { 
                  const hc = resolvedBtn || resolvedAccent || 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = hc;
                  e.currentTarget.style.borderColor = hc;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
                  e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)';
                  e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-500)';
                }}
                aria-label="Anterior"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory pt-4 px-4 -mx-4 scrollbar-hide scroll-smooth"
              >
                {items.map((item: HighlightItem, i: number) => (
                  <HighlightCard 
                    key={item.id}
                    item={item}
                    index={i}
                    isEditor={isEditor}
                    isInView={isInView}
                    styles={styles}
                    cardBgColor={cardBgColor}
                    cardBorderColor={cardBorderColor}
                    tagBgColor={tagBgColor}
                    tagTextColor={tagTextColor}
                    accentColor={resolvedAccent}
                    btnColor={resolvedBtn}
                  />
                ))}
              </div>

              {/* Seta direita */}
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                className={cn(
                  "hidden md:flex absolute -right-4 md:-right-8 lg:-right-14 top-1/2 -translate-y-1/2 z-30",
                  "w-12 h-12 border rounded-full items-center justify-center shadow-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95"
                )}
                style={{
                  backgroundColor: styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                  borderColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)',
                  color: styles.isDark ? '#FFFFFF' : 'var(--color-text-500)',
                }}
                onMouseEnter={(e) => { 
                  const hc = resolvedBtn || resolvedAccent || 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = hc;
                  e.currentTarget.style.borderColor = hc;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
                  e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)';
                  e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-500)';
                }}
                aria-label="Próximo"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
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
                className="rounded-full transition-all duration-300"
                style={activeIndex === i ? {
                  width: '24px',
                  height: '8px',
                  backgroundColor: resolvedBtn || resolvedAccent || 'var(--color-primary)',
                } : {
                  width: '8px',
                  height: '8px',
                  backgroundColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-200)',
                }}
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

// Card extraído para componente separado para gerenciar hovers
function HighlightCard({ item, index, isEditor, isInView, styles, cardBgColor, cardBorderColor, tagBgColor, tagTextColor, accentColor, btnColor }: {
  item: HighlightItem; index: number; isEditor?: boolean; isInView: boolean; styles: any;
  cardBgColor: string; cardBorderColor: string; tagBgColor: string; tagTextColor: string; accentColor?: string; btnColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const hoverColor = btnColor || accentColor || 'var(--color-primary)';

  return (
    <motion.div 
      key={item.id}
      initial={isEditor ? false : { opacity: 0, y: 50, rotateX: -10 }}
      animate={isEditor || isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -10 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className={cn(
        "group relative flex-none w-[260px] md:w-[280px] snap-start rounded-[32px] overflow-hidden shadow-sm transition-all duration-500 cursor-pointer isolate",
        styles.isDark 
          ? 'bg-white/5' 
          : 'bg-white'
      )}
      style={{
        backgroundColor: cardBgColor || undefined,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: cardBorderColor || (styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-text-100)'),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-surface-200/80 rounded-full opacity-0 blur-xl group-hover:blur-3xl group-hover:scale-[15] group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none -z-10" />
      
      <div className={cn(
        "relative h-[240px] w-full overflow-hidden z-10 rounded-t-[32px]"
      )}>
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover z-20 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
        />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
            style={{
              backgroundColor: tagBgColor || (styles.isDark ? 'rgba(255,255,255,0.1)' : (accentColor ? accentColor + '1A' : 'var(--color-tertiary, #D4AF37)') + '1A'),
              color: tagTextColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : (accentColor || 'var(--color-tertiary)')),
            }}
          >{item.tag}</span>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: hovered ? hoverColor : (styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-surface-100)'),
              color: hovered ? '#FFFFFF' : (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)'),
              transform: hovered && !styles.isDark ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
        <h3 
          className="font-display font-bold text-xl leading-tight transition-colors duration-300"
          style={{
            color: hovered ? hoverColor : (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)'),
          }}
        >{item.name}</h3>
      </div>
    </motion.div>
  );
}
