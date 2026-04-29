/**
 * Gera uma paleta de cores derivadas a partir de uma cor hexadecimal primária.
 */
export function generatePalette(hex: string) {
  try {
    // Validar se o hex é válido (mínimo de 7 caracteres incluindo #)
    if (!hex || hex.length < 7 || !hex.startsWith('#')) {
      throw new Error("Invalid hex color");
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error("Invalid hex color components");
    }

    const dark = `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`;
    const light = `rgb(${Math.min(255, Math.round(r * 1.15))}, ${Math.min(255, Math.round(g * 1.15))}, ${Math.min(255, Math.round(b * 1.15))})`;
    const soft = `rgba(${r}, ${g}, ${b}, 0.12)`;
    const bg = `rgba(${r}, ${g}, ${b}, 0.06)`;

    return { primary: hex, dark, light, soft, bg };
  } catch (e) {
    // Fallback para o azul padrão se o hex for inválido
    return {
      primary: "#2563EB",
      dark: "rgb(26, 69, 164)",
      light: "rgb(43, 113, 255)",
      soft: "rgba(37, 99, 235, 0.12)",
      bg: "rgba(37, 99, 235, 0.06)"
    };
  }
}
