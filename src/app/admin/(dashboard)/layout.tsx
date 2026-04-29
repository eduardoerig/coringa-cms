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
  
  // Dashboard Theme
  const primaryColor = settings.dashboard_primary_color || "#2563EB";
  const surfaceBg = settings.dashboard_bg_color || "#FAFAFA";
  const palette = generatePalette(primaryColor);

  const themeStyles = {
    '--theme-primary': palette.primary,
    '--theme-primary-dark': palette.dark,
    '--theme-primary-light': palette.light,
    '--theme-primary-soft': palette.soft,
    '--theme-primary-bg': palette.bg,
    '--theme-surface-50': surfaceBg,
  } as React.CSSProperties;

  return (
    <div 
      className="flex min-h-screen bg-surface-50 font-sans text-text-900"
      style={themeStyles}
    >
      <Sidebar />
      <main className="flex-1 p-4 pt-20 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
