import { Sidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";

export const metadata = {
  title: "Admin - Painel",
  description: "Dashboard de Gerenciamento",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-50 text-text-900">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden relative h-screen">
        {children}
      </main>
    </div>
  );
}
