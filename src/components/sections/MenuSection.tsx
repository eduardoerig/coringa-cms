"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { PremiumMenuTemplate } from "@/components/ui/PremiumMenuTemplate";
import { MenuCardSkeleton } from "@/components/ui/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { getSectionStyles } from "@/utils/sectionStyles";

interface MenuItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  img: string;
}

interface CategoryItem {
  id: string;
  label: string;
}

interface MenuSectionProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
}

const defaultMenuItems: MenuItem[] = [
  { id: "1", category: "shake-mix", title: "Produto Principal", desc: "Descrição atraente do produto principal", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+1" },
  { id: "2", category: "casquinha", title: "Produto Clássico", desc: "Clássico que todos adoram", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+2" },
  { id: "3", category: "sundae", title: "Sobremesa Especial", desc: "Uma delícia refrescante", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+3" },
  { id: "4", category: "top-mix", title: "Produto Exclusivo", desc: "Sabor inconfundível", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+4" },
  { id: "5", category: "shake-mix", title: "Lançamento", desc: "A novidade do momento", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+5" }
];

const defaultCategories: CategoryItem[] = [
  { id: "all", label: "Todos" },
  { id: "shake-mix", label: "Categoria 1" },
  { id: "casquinha", label: "Categoria 2" },
  { id: "sundae", label: "Categoria 3" },
  { id: "top-mix", label: "Categoria 4" }
];

export function MenuSection({ settings, props: editorProps }: MenuSectionProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState<MenuItem[]>(defaultMenuItems);
  const [cats, setCats] = useState<CategoryItem[]>(defaultCategories);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const styles = getSectionStyles(editorProps || {});

  const title = (editorProps?.title as string) || "Explore nosso Cardápio";
  const subtitle = (editorProps?.subtitle as string) || "Mais de 100 opções preparadas com carinho para você.";

  // Cores dinâmicas — tokens semânticos
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const filterActiveBgColor = (editorProps?.filterActiveBgColor as string) || "";
  const filterActiveTextColor = (editorProps?.filterActiveTextColor as string) || "";

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Categorias
        const { data: categoriesData } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
        if (categoriesData && categoriesData.length > 0) {
          setCats([
            { id: "all", label: "Todos" },
            ...categoriesData.map(c => ({ id: c.slug as string, label: c.label as string }))
          ]);
        }

        // Fetch Produtos
        const { data: productsData } = await supabase.from('products').select('*, categories(slug)');
        if (productsData && productsData.length > 0) {
          setItems(productsData.map(p => ({
            id: p.id as string,
            category: (p.categories as { slug: string } | null)?.slug || 'geral',
            title: p.title as string,
            desc: (p.description as string) || '',
            img: (p.image_url as string) || 'https://placehold.co/400x400/eeeeee/999999?text=Produto'
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const filteredItems = activeFilter === "all" 
    ? items 
    : items.filter(item => item.category === activeFilter);

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!pdfRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      const { domToPng } = await import("modern-screenshot");
      const { default: jsPDF } = await import("jspdf");

      const imgData = await domToPng(pdfRef.current, {
        scale: 2,
        backgroundColor: "#FAF5F0",
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (1131 * pdfWidth) / 800;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("cardapio-premium.pdf");
      
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      alert("Houve um erro ao gerar o cardápio interativo. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Cores resolvidas
  const resolvedAccent = accentColor || undefined;
  const resolvedBtn = btnBgColor || filterActiveBgColor || undefined;

  return (
    <section id="cardapio" className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span 
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4 block"
              style={{ color: resolvedAccent || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-tertiary)') }}
            >Cardápio</span>
            <h2 
              className="text-4xl md:text-5xl lg:text-[56px] leading-[1.1] font-display font-black tracking-tight mb-6"
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >
              {title}
            </h2>
            <p 
              className="text-lg leading-relaxed"
              style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-500)') }}
            >
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-2 mb-8 md:mb-10 snap-x snap-mandatory scrollbar-hide">
          {cats.map((cat) => {
            const isActive = activeFilter === cat.id;
            const activeBg = filterActiveBgColor || resolvedBtn || 'var(--color-primary)';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={cn(
                  "whitespace-nowrap flex-shrink-0 snap-start text-xs md:text-sm font-medium px-5 py-2 rounded-full border transition-all duration-200",
                )}
                style={isActive ? {
                  backgroundColor: activeBg,
                  borderColor: activeBg,
                  color: filterActiveTextColor || '#FFFFFF',
                  transform: 'scale(1.05)',
                  boxShadow: `0 10px 15px -3px ${activeBg}33`,
                } : {
                  backgroundColor: styles.isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  borderColor: styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-text-100)',
                  color: styles.isDark ? '#FFFFFF' : 'var(--color-text-500)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const hc = resolvedAccent || 'var(--color-primary)';
                    e.currentTarget.style.borderColor = hc;
                    e.currentTarget.style.color = hc;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-text-100)';
                    e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-500)';
                  }
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid animada */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className={cn(
              "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
              styles.isDark ? "bg-white/10" : "bg-surface-100"
            )}>
              <svg className={cn("w-10 h-10", styles.isDark ? "text-white/40" : "text-text-300")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className={cn("font-display font-bold text-xl mb-2", styles.isDark ? 'text-white' : 'text-text-900')}>Nenhum produto encontrado</h3>
            <p className={cn("text-sm", styles.isDark ? 'text-white/70' : 'text-text-400')}>Tente alterar o filtro de categoria.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} styles={styles} editorProps={editorProps} accentColor={resolvedAccent} btnColor={resolvedBtn} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-14 text-center relative z-10">
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPDF}
            className="inline-block font-bold px-8 py-4 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            style={{
              backgroundColor: styles.isDark ? '#FFFFFF' : '#FFFFFF',
              color: styles.isDark ? 'var(--color-text-900)' : 'var(--color-text-900)',
              borderWidth: styles.isDark ? '0' : '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-text-100)',
              boxShadow: styles.isDark ? '0 25px 50px -12px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => { 
              const hc = resolvedBtn || resolvedAccent || 'var(--color-primary)';
              if (!styles.isDark) {
                e.currentTarget.style.borderColor = hc;
                e.currentTarget.style.color = hc;
              }
            }}
            onMouseLeave={(e) => { 
              if (!styles.isDark) {
                e.currentTarget.style.borderColor = 'var(--color-text-100)';
                e.currentTarget.style.color = 'var(--color-text-900)';
              }
            }}
          >
            {isGeneratingPDF ? "Montando Revista..." : "Baixar Cardápio Premium"}
          </button>
        </div>
      </div>

      <div className="absolute top-0 opacity-0 pointer-events-none -z-50" style={{ left: '-9999px' }}>
        <PremiumMenuTemplate ref={pdfRef} items={items} />
      </div>
    </section>
  );
}

// Card do menu extraído para gerenciar hovers
function MenuCard({ item, styles, editorProps, accentColor, btnColor }: { 
  item: MenuItem; styles: any; editorProps?: Record<string, any>; accentColor?: string; btnColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group rounded-2xl md:rounded-3xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col",
      )}
      style={{
        backgroundColor: (editorProps?.cardBgColor as string) || (styles.isDark ? '#1a1a1a' : '#FFFFFF'),
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: styles.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 30px rgba(26,16,8,0.06)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div 
        className="h-[120px] md:h-[180px] flex items-center justify-center p-3 md:p-6 transition-colors duration-300"
        style={{ backgroundColor: styles.isDark ? 'rgba(255,255,255,0.05)' : (hovered ? 'var(--color-primary-bg)' : 'var(--color-surface-50)') }}
      >
        <Image src={item.img} alt={item.title} width={150} height={150} className="max-h-20 md:max-h-32 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <span 
          className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest"
          style={{ color: accentColor || 'var(--color-tertiary)' }}
        >{item.category.replace("-", " ")}</span>
        <h3 className={cn("font-display font-bold mt-1 mb-1 text-sm md:text-base leading-tight md:leading-snug line-clamp-2", styles.isDark ? "text-white" : "text-text-900")}>{item.title}</h3>
        <p className={cn("text-[10px] md:text-xs leading-relaxed line-clamp-2 md:line-clamp-none mt-auto pt-1", styles.isDark ? "text-white/60" : "text-text-400")}>{item.desc}</p>
      </div>
    </motion.div>
  );
}
