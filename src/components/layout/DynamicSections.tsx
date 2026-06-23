"use client";

import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { MenuSection } from "@/components/sections/MenuSection";
import { About } from "@/components/sections/About";
import { Franchise } from "@/components/sections/Franchise";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { Gallery } from "@/components/sections/Gallery";
import { CTABanner } from "@/components/sections/CTABanner";
import { TextBlock } from "@/components/sections/TextBlock";
import { Navbar } from "@/components/layout/Navbar";
import { FooterBlock } from "@/components/sections/FooterBlock";
import { Container } from "@/components/sections/Container";

interface PageSection {
  id: string;
  type: string;
  visible: boolean;
  props: Record<string, unknown>;
}

interface DynamicSectionsProps {
  sections: PageSection[] | null;
  settings: Record<string, string>;
}

/** Mapeia type → componente */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.ComponentType<any>> = {
  header: Navbar,
  hero: Hero,
  highlights: Highlights,
  menu: MenuSection,
  about: About,
  franchise: Franchise,
  divider: ScrollIndicator,
  gallery: Gallery,
  cta_banner: CTABanner,
  text_block: TextBlock,
  footer: FooterBlock,
  container: Container,
};

export function DynamicSections({ sections, settings }: DynamicSectionsProps) {
  // Fallback: se não há layout publicado, renderizar layout hardcoded
  if (!sections || sections.length === 0) {
    return (
      <>
        <Navbar settings={settings} />
        <Hero settings={settings} />
        <ScrollIndicator />
        <Highlights settings={settings} />
        <MenuSection settings={settings} />
        <About settings={settings} />
        <Franchise settings={settings} />
      </>
    );
  }

  return (
    <>
      {sections
        .filter((s) => s.visible)
        .map((section) => {
          const Component = componentMap[section.type];
          if (!Component) return null;

          return (
            <Component
              key={section.id}
              settings={settings}
              props={section.props}
            />
          );
        })}
    </>
  );
}
