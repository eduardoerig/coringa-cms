"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { PremiumMenuTemplate } from "@/components/ui/PremiumMenuTemplate";
import { MenuCardSkeleton } from "@/components/ui/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { Eyebrow } from "./primitives/Eyebrow";
import { SectionHeading } from "./primitives/SectionHeading";
import { Lede } from "./primitives/Lede";
import { SoftButton } from "./primitives/SoftButton";

interface MenuItem { id: string; category: string; title: string; desc: string; img: string; }
interface CategoryItem { id: string; label: string; }
interface MenuSectionProps { settings?: Record<string, string>; props?: Record<string, any>; }

const defaultMenuItems: MenuItem[] = [
  { id: "1", category: "shake-mix", title: "Produto Principal", desc: "Descrição atraente do produto principal", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+1" },
  { id: "2", category: "casquinha", title: "Produto Clássico", desc: "Clássico que todos adoram", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+2" },
  { id: "3", category: "sundae", title: "Sobremesa Especial", desc: "Uma delícia refrescante", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+3" },
  { id: "4", category: "top-mix", title: "Produto Exclusivo", desc: "Sabor inconfundível", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+4" },
  { id: "5", category: "shake-mix", title: "Lançamento", desc: "A novidade do momento", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+5" },
];

const defaultCategories: CategoryItem[] = [
  { id: "all", label: "Todos" },
  { id: "shake-mix", label: "Categoria 1" },
  { id: "casquinha", label: "Categoria 2" },
  { id: "sundae", label: "Categoria 3" },
  { id: "top-mix", label: "Categoria 4" },
];

export function MenuSection({ props: editorProps }: MenuSectionProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [items, setItems] = useState<MenuItem[]>(defaultMenuItems);
  const [cats, setCats] = useState<CategoryItem[]>(defaultCategories);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const styles = getSectionStyles(editorProps || {});

  const eyebrow = (editorProps?.eyebrow as string) ?? "Cardápio";
  const title = (editorProps?.title as string) || "Explore nosso Cardápio";
  const subtitle = (editorProps?.subtitle as string) || "Mais de 100 opções preparadas com carinho para você.";
  const pdfButtonText = (editorProps?.pdfButtonText as string) || "Baixar cardápio";

  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const eyebrowColor = (editorProps?.eyebrowColor as string) || "";
  const pdfBtnBgColor = (editorProps?.pdfBtnBgColor as string) || "";
  const pdfBtnTextColor = (editorProps?.pdfBtnTextColor as string) || "";
  const pdfBtnBorderColor = (editorProps?.pdfBtnBorderColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const filterActiveBgColor = (editorProps?.filterActiveBgColor as string) || "";
  const filterActiveTextColor = (editorProps?.filterActiveTextColor as string) || "";
  const cardBgColor = (editorProps?.cardBgColor as string) || "";

  const accent = accentColor || "var(--color-primary)";

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: categoriesData } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
        if (categoriesData && categoriesData.length > 0) {
          setCats([{ id: "all", label: "Todos" }, ...categoriesData.map((c) => ({ id: c.slug as string, label: c.label as string }))]);
        }
        const { data: productsData } = await supabase.from("products").select("*, categories(slug)");
        if (productsData && productsData.length > 0) {
          setItems(productsData.map((p) => ({
            id: p.id as string,
            category: (p.categories as { slug: string } | null)?.slug || "geral",
            title: p.title as string,
            desc: (p.description as string) || "",
            img: (p.image_url as string) || "https://placehold.co/400x400/eeeeee/999999?text=Produto",
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const filteredItems = activeFilter === "all" ? items : items.filter((item) => item.category === activeFilter);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const { domToPng } = await import("modern-screenshot");
      const { default: jsPDF } = await import("jspdf");
      const imgData = await domToPng(pdfRef.current, { scale: 2, backgroundColor: "#FAF5F0" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (1131 * pdfWidth) / 800;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("cardapio.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <section id="cardapio" className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          {eyebrow && <div className="mb-5"><Eyebrow color={eyebrowColor || accentColor} isDark={styles.isDark} dataField="eyebrow">{eyebrow}</Eyebrow></div>}
          <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className="mb-5 mx-auto">{title}</SectionHeading>
          <Lede color={subtitleColor} isDark={styles.isDark} dataField="subtitle" className="mx-auto">{subtitle}</Lede>
        </motion.div>

        {/* Filtros */}
        <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:justify-center gap-2 mb-10 snap-x snap-mandatory scrollbar-hide">
          {cats.map((cat) => {
            const isActive = activeFilter === cat.id;
            const activeBg = filterActiveBgColor || btnBgColor || accent;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className="whitespace-nowrap flex-shrink-0 snap-start text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200"
                style={isActive ? {
                  backgroundColor: activeBg, color: filterActiveTextColor || "#FFFFFF",
                  boxShadow: `0 10px 24px -10px ${activeBg}`,
                } : {
                  backgroundColor: styles.isDark ? "rgba(255,255,255,0.06)" : "var(--color-surface-100)",
                  color: styles.isDark ? "#FFFFFF" : "var(--color-text-500)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grade */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <MenuCardSkeleton key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <h3 className={cn("font-display font-semibold text-lg mb-1", styles.isDark ? "text-white" : "text-text-900")}>Nenhum produto encontrado</h3>
            <p className={cn("text-sm", styles.isDark ? "text-white/70" : "text-text-400")}>Tente alterar o filtro de categoria.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} isDark={styles.isDark} cardBgColor={cardBgColor} accent={accent} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-14 text-center relative z-10">
          <span data-field="pdfButtonText" className="inline-block">
            <SoftButton onClick={handleDownloadPDF} variant="secondary" isDark={styles.isDark} bgColor={pdfBtnBgColor} textColor={pdfBtnTextColor} borderColor={pdfBtnBorderColor} className="px-8 py-3.5">
              {isGeneratingPDF ? "Gerando…" : pdfButtonText}
            </SoftButton>
          </span>
        </div>
      </div>

      <div className="absolute top-0 opacity-0 pointer-events-none -z-50" style={{ left: "-9999px" }}>
        <PremiumMenuTemplate ref={pdfRef} items={items} />
      </div>
    </section>
  );
}

function MenuCard({ item, isDark, cardBgColor, accent }: { item: MenuItem; isDark: boolean; cardBgColor: string; accent: string; }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn("group overflow-hidden flex flex-col transition-all duration-300", SOFT.card, SOFT.shadow)}
      style={{
        backgroundColor: cardBgColor || (isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF"),
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "var(--color-text-100)"}`,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 20px 40px -16px rgba(0,0,0,0.2)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-[140px] md:h-[180px] w-full overflow-hidden">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-[10px] font-semibold tracking-wide" style={{ color: accent }}>{item.category.replace("-", " ")}</span>
        <h3 className={cn("font-display font-semibold mt-1 mb-1 text-sm md:text-base leading-snug line-clamp-2", isDark ? "text-white" : "text-text-900")}>{item.title}</h3>
        <p className={cn("text-xs leading-relaxed line-clamp-2 mt-auto pt-1", isDark ? "text-white/60" : "text-text-400")}>{item.desc}</p>
      </div>
    </motion.div>
  );
}
