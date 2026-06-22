"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getSectionStyles, SOFT } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./primitives/SectionHeading";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryProps {
  props: Record<string, any>;
}

export function Gallery({ props: editorProps }: GalleryProps) {
  const styles = getSectionStyles(editorProps || {});
  const { title, images = [] } = editorProps;
  const titleColor = (editorProps?.titleColor as string) || "";

  if (images.length === 0) return null;

  return (
    <section className={cn("relative overflow-hidden", styles.container)} style={styles.style}>
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <SectionHeading color={titleColor} isDark={styles.isDark} dataField="title" className="mx-auto">
              {title}
            </SectionHeading>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {images.map((img: GalleryImage, i: number) => (
            <motion.div
              key={i}
              data-field="images"
              data-item-index={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
              className={cn("group relative overflow-hidden aspect-square bg-surface-100 transition-shadow duration-300", SOFT.card, SOFT.shadow, SOFT.shadowHover, SOFT.ring)}
            >
              <Image
                src={img.url}
                alt={img.caption || `Imagem ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4 pt-10">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
