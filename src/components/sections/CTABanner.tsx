"use client";

import { motion } from "framer-motion";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface CTABannerProps {
  props: Record<string, any>;
}

export function CTABanner({ props: editorProps }: CTABannerProps) {
  const styles = getSectionStyles(editorProps || {});
  const {
    title = "Faça seu pedido agora!",
    description,
    buttonText = "Saiba mais",
    buttonLink = "#",
  } = editorProps;

  return (
    <section className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "text-3xl md:text-4xl font-display font-black mb-4",
            styles.isDark ? "text-white" : "text-text-900"
          )}
        >
          {title}
        </motion.h2>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-lg mb-8 max-w-2xl mx-auto",
              styles.isDark ? "text-white/80" : "text-text-500"
            )}
          >
            {description}
          </motion.p>
        )}

        <motion.a
          href={buttonLink}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={cn(
            "inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300",
            styles.isDark 
              ? "bg-white text-text-900 hover:bg-white/90" 
              : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
          )}
        >
          {buttonText}
        </motion.a>
      </div>
    </section>
  );
}

export default CTABanner;
