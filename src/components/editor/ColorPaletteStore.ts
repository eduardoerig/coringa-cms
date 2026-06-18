/**
 * ColorPaletteStore — Paleta Global de Cores do Editor
 *
 * Fornece um conjunto de cores acessíveis a todos os componentes do editor.
 * As cores são salvas no tema global (theme_custom_colors) e lidas de forma
 * reativa pelo useEditorStore, garantindo consistência entre todos os painéis.
 */

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  group?: "brand" | "neutral" | "custom";
}

/** Cores fixas de marca — nunca removíveis */
export const FIXED_BRAND_COLORS: BrandColor[] = [
  { id: "fixed_white", name: "Branco", hex: "#FFFFFF", group: "neutral" },
  { id: "fixed_primary", name: "Cor Primária", hex: "__primary__", group: "brand" },
  { id: "fixed_tertiary", name: "Cor de Destaque", hex: "__tertiary__", group: "brand" },
  { id: "fixed_bg", name: "Fundo Geral", hex: "__bg__", group: "brand" },
];

/** Parseia a paleta customizada do JSON salvo no tema */
export function parseCustomColors(raw: string): BrandColor[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Monta a lista completa de cores para exibir no color picker:
 * 1. Cores de marca fixas (resolvidas com os valores reais do tema)
 * 2. Cores customizadas criadas pelo usuário
 */
export function buildFullPalette(
  theme: Record<string, string>,
  customColors: BrandColor[]
): BrandColor[] {
  const resolved = FIXED_BRAND_COLORS.map((c) => {
    if (c.hex === "__primary__") return { ...c, hex: theme.theme_primary_color || "#000000" };
    if (c.hex === "__tertiary__") return { ...c, hex: theme.theme_tertiary_color || "#333333" };
    if (c.hex === "__bg__") return { ...c, hex: theme.theme_bg_color || "#FFFFFF" };
    return c;
  });
  return [...resolved, ...customColors];
}
