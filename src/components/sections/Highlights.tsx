"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./primitives/Eyebrow";
import { SectionHeading } from "./primitives/SectionHeading";
import { Lede } from "./primitives/Lede";

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

export function Highlights({ props: editorProps, isEditor }: HighlightsProps) {
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
    const cardWidth = 280 + 24;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, items.length - 1));
  };

  const eyebrow = (editorProps?.eyebrow as string) ?? "Destaques";
  const title = (editorProps?.title as string) || "Nossos Queridinhos";
  const subtitle = (editorProps?.subtitle as string) || "Descubra os produtos que fazem o maior sucesso entre nossos clientes.";

  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const eyebrowColor = (editorProps?.eyebrowColor as string) || "";
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
          .from("products").select("*").eq("is_featured", true).order("created_at", { ascending: false });
        if (error) throw error;
        if (isMounted && data && data.length > 0) {
          setItems(data.map((p: any) => ({
            id: p.id,
            name: p.title,
            tag: p.tag || "Destaque",
            image: p.image_url || "https://placehold.co/400x400/eeeeee/999999?text=Sem+Imagem",
          })));
        }
      } catch (err) {
        console.error("Erro ao buscar destaques:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHighlights();
    return () => { isMounted = false; };
  }, [supabase]);

  const accent = accentColor || "var(--color-primary)";
  const dotActive = btnBgColor || accent;
  const variant = (editorProps?.layout_variant as string) || "carousel";
  const isGridVariant = variant === "grid";

  return (
    <section id="destaques" ref={ref} className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={isEditor ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          {eyebrow && <div className="mb-5"><Eyebrow color={eyebrowColor || accentColor} isDark={styles.isDark} dataField="eyebrow">{eyebrow}</Eyebrow></div>}
          <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className="mb-5 mx-auto">{title}</SectionHeading>
          <Lede color={subtitleColor} isDark={styles.isDark} dataField="subtitle" className="mx-auto">{subtitle}</Lede>
        </motion.div>

        {loading ? (
          <div className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 -mx-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (<div key={i} className="flex-none w-[260px] md:w-[280px]"><CardSkeleton /></div>))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className={cn("w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center", styles.isDark ? "bg-white/10 text-white/40" : "bg-surface-100 text-text-300")}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <h3 className={cn("font-display font-semibold text-lg mb-1", styles.isDark ? "text-white" : "text-text-900")}>Nenhum destaque ainda</h3>
            <p className={cn("text-sm", styles.isDark ? "text-white/40" : "text-text-400")}>Os produtos em destaque aparecerão aqui.</p>
          </div>
        ) : isGridVariant ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <HighlightCard
                key={item.id} item={item} index={i} isEditor={isEditor} isInView={isInView} isDark={styles.isDark}
                cardBgColor={cardBgColor} cardBorderColor={cardBorderColor} tagBgColor={tagBgColor} tagTextColor={tagTextColor} accent={accent} btnColor={btnBgColor || accent} fullWidth
              />
            ))}
          </div>
        ) : (
          <>
            <div className="relative">
              <CarouselArrow side="left" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} isDark={styles.isDark} accent={accent} />
              <div ref={scrollRef} onScroll={handleScroll} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory pt-4 px-4 -mx-4 scrollbar-hide scroll-smooth">
                {items.map((item, i) => (
                  <HighlightCard
                    key={item.id} item={item} index={i} isEditor={isEditor} isInView={isInView} isDark={styles.isDark}
                    cardBgColor={cardBgColor} cardBorderColor={cardBorderColor} tagBgColor={tagBgColor} tagTextColor={tagTextColor} accent={accent} btnColor={btnBgColor || accent}
                  />
                ))}
              </div>
              <CarouselArrow side="right" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} isDark={styles.isDark} accent={accent} />
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { const el = scrollRef.current; if (el) el.scrollTo({ left: i * (280 + 24), behavior: "smooth" }); }}
                  className="rounded-full transition-all duration-300"
                  style={activeIndex === i
                    ? { width: "24px", height: "8px", backgroundColor: dotActive }
                    : { width: "8px", height: "8px", backgroundColor: styles.isDark ? "rgba(255,255,255,0.2)" : "var(--color-text-200)" }}
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

function CarouselArrow({ side, onClick, isDark, accent }: { side: "left" | "right"; onClick: () => void; isDark: boolean; accent: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Anterior" : "Próximo"}
      className={cn(
        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
        side === "left" ? "-left-4 lg:-left-12" : "-right-4 lg:-right-12",
        SOFT.shadow
      )}
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#FFFFFF",
        color: isDark ? "#FFFFFF" : "var(--color-text-500)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#FFFFFF"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.1)" : "#FFFFFF"; e.currentTarget.style.color = isDark ? "#FFFFFF" : "var(--color-text-500)"; }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={side === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} /></svg>
    </button>
  );
}

function HighlightCard({ item, index, isEditor, isInView, isDark, cardBgColor, cardBorderColor, tagBgColor, tagTextColor, accent, btnColor, fullWidth }: {
  item: HighlightItem; index: number; isEditor?: boolean; isInView: boolean; isDark: boolean;
  cardBgColor: string; cardBorderColor: string; tagBgColor: string; tagTextColor: string; accent: string; btnColor: string; fullWidth?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={isEditor ? false : { opacity: 0, y: 30 }}
      animate={isEditor || isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className={cn("group relative overflow-hidden transition-all duration-300", fullWidth ? "w-full" : "flex-none w-[260px] md:w-[280px] snap-start", SOFT.card, SOFT.shadow)}
      style={{
        backgroundColor: cardBgColor || (isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF"),
        border: `1px solid ${cardBorderColor || (isDark ? "rgba(255,255,255,0.08)" : "var(--color-text-100)")}`,
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 22px 44px -16px rgba(0,0,0,0.22)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-[230px] w-full overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: tagBgColor || `color-mix(in srgb, ${accent} 12%, transparent)`,
              color: tagTextColor || (isDark ? "rgba(255,255,255,0.8)" : accent),
            }}
          >{item.tag}</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: hovered ? btnColor : (isDark ? "rgba(255,255,255,0.1)" : "var(--color-surface-100)"),
              color: hovered ? "#FFFFFF" : (isDark ? "rgba(255,255,255,0.6)" : "var(--color-text-400)"),
            }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </div>
        <h3 className="font-display font-semibold text-lg leading-tight" style={{ color: isDark ? "#FFFFFF" : "var(--color-text-900)" }}>{item.name}</h3>
      </div>
    </motion.div>
  );
}
