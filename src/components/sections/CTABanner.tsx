"use client";

import { motion } from "framer-motion";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./primitives/SectionHeading";
import { Lede } from "./primitives/Lede";
import { SoftButton } from "./primitives/SoftButton";

interface CTABannerProps {
  props: Record<string, any>;
  isEditor?: boolean;
}

export function CTABanner({ props: editorProps, isEditor }: CTABannerProps) {
  const styles = getSectionStyles(editorProps || {});
  const {
    title = "Faça seu pedido agora!",
    description,
    buttonText = "Saiba mais",
    buttonLink = "#",
  } = editorProps;

  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const btnBgColor = (editorProps?.btnBgColor as string) || "";
  const btnTextColor = (editorProps?.btnTextColor as string) || "";

  const tint = accentColor || "var(--color-primary)";
  const variant = (editorProps?.layout_variant as string) || "card";
  const isSplit = variant === "split";
  const isBand = variant === "band";

  return (
    <section className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className={cn("mx-auto", isBand ? "max-w-none px-0" : isSplit ? "max-w-6xl px-6" : "max-w-5xl px-6")}>
        <motion.div
          initial={isEditor ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "relative overflow-hidden",
            isBand
              ? "w-full px-6 py-16 md:py-24 text-center"
              : cn("px-8 py-14 md:px-16 md:py-20", SOFT.card, SOFT.shadow, SOFT.ring, !isSplit && "text-center")
          )}
          style={{ backgroundColor: styles.isDark ? "rgba(255,255,255,0.05)" : `color-mix(in srgb, ${tint} ${isBand ? "12" : "8"}%, var(--color-surface-50))` }}
        >
          {/* blob suave de fundo (não na faixa cheia) */}
          {!isBand && (
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: `color-mix(in srgb, ${tint} 18%, transparent)` }}
            />
          )}

          <div className={cn("relative", isBand && "max-w-4xl mx-auto", isSplit && "md:flex md:items-center md:justify-between md:text-left gap-10")}>
            <div className={cn(isSplit && "md:flex-1")}>
              <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className={cn("mb-4", !isSplit && "mx-auto max-w-2xl")}>
                {title}
              </SectionHeading>

              {description && (
                <Lede color={subtitleColor} isDark={styles.isDark} dataField="description" className={cn(isSplit ? "mb-0" : "mb-9 max-w-2xl mx-auto")}>
                  {description}
                </Lede>
              )}
            </div>

            <div data-field="buttonText" className={cn("inline-block", isSplit && "mt-6 md:mt-0 shrink-0")}>
              <SoftButton href={buttonLink} bgColor={btnBgColor} textColor={btnTextColor} isDark={styles.isDark} className="px-9 py-4 text-base">
                {buttonText}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </SoftButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTABanner;
