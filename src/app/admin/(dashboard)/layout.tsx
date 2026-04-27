import { Sidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";

export const metadata = {
  title: "Admin - Painel",
  description: "Dashboard de Gerenciamento",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-50 font-sans text-text-900">
      <Sidebar />
      <main className="flex-1 p-4 pt-20 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
