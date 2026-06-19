/**
 * Utilitário para gerar classes de background e padding baseadas nos campos comuns
 */
export function getSectionStyles(props: Record<string, any>) {
  const rawBgType = props?.section_bg_type || "white";
  // Normalize legacy named value to hex for consistency
  const bgType = rawBgType === "white" ? "#FFFFFF" : rawBgType;
  const padding = props?.section_padding || "medium";

  // Check if it's a custom hex color, css variable or rgb (starts with #, var, rgb)
  const isCustomColor = typeof bgType === 'string' && (bgType.startsWith('#') || bgType.startsWith('var(--') || bgType.startsWith('rgb'));

  const bgClasses = {
    white: "bg-white",
    rose_light: "bg-[#FFF8F6]", // Off-white rosado (Camarim)
    rose_dark: "bg-[#C8687B]",  // Rosé Camarim
    dark: "bg-[#18181B]",       // Escuro
  }[bgType as string] || (isCustomColor ? "" : "bg-white");

  // Determine if it's dark to set text color
  let isDark = bgType === "rose_dark" || bgType === "dark";
  
  if (typeof bgType === 'string' && bgType.startsWith('#')) {
    // Basic contrast detection
    const hex = bgType.replace('#', '');
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      isDark = brightness < 128;
    }
  }

  const textClasses = isDark 
    ? "text-white" 
    : "text-text-900";

  const paddingClasses = {
    none: "py-0",
    small: "py-10 md:py-16",
    medium: "py-20 md:py-32",
    large: "py-32 md:py-48",
  }[padding as string] || "py-20 md:py-32";

  return {
    container: `${bgClasses} ${textClasses} ${paddingClasses} transition-colors duration-500`,
    isDark,
    bgType,
    style: isCustomColor ? { backgroundColor: bgType as string } : {}
  };
}
