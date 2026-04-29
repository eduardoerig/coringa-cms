import { Sidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";
import { getSettings } from "@/utils/settings";
import { generatePalette } from "@/utils/colors";

export const metadata = {
  title: "Admin - Painel",
  description: "Dashboard de Gerenciamento",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  
  // Dashboard Theme (Forced Neutral)
  const primaryColor = "#18181B"; // Zinc-900
  const surfaceBg = "#FFFFFF";
  const palette = generatePalette(primaryColor);

  const themeStyles = {
    '--theme-primary': palette.primary,
    '--theme-primary-dark': "#000000",
    '--theme-primary-light': "#3F3F46",
    '--theme-primary-soft': "#F4F4F5",
    '--theme-primary-bg': "#FAFAFA",
    '--theme-surface-50': surfaceBg,
  } as React.CSSProperties;

  return (
    <div 
      className="flex min-h-screen bg-surface-50 font-sans text-text-900"
      style={themeStyles}
    >
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden relative h-screen">
        {children}
      </main>
    </div>
  );
}
