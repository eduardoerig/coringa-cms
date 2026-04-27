"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryProps {
  props: {
    title?: string;
    images?: GalleryImage[];
  };
}

export function Gallery({ props }: GalleryProps) {
  const { title, images = [] } = props;

  if (images.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-black text-text-900 text-center mb-12"
          >
            {title}
          </motion.h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-surface-50"
            >
              <Image
                src={img.url}
                alt={img.caption || `Imagem ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
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
