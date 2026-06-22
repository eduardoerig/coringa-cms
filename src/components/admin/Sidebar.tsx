"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Users, Settings, LogOut, ExternalLink, Menu, X, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Visão Geral", icon: LayoutDashboard, path: "/admin" },
  { name: "Editor de Página", icon: Paintbrush, path: "/admin/editor" },
  { name: "Produtos", icon: Package, path: "/admin/products" },
  { name: "Categorias", icon: Tags, path: "/admin/categories" },
  { name: "Leads", icon: Users, path: "/admin/leads" },
  { name: "Configurações", icon: Settings, path: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fechar sidebar ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Impedir scroll do body quando sidebar mobile está aberta
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const sidebarContent = (
    <>
      <div className="h-20 flex items-center px-8 border-b border-surface-200 justify-between">
        <span className="text-xl font-display font-black text-primary tracking-tight">Coringa <span className="text-text-900">Admin</span></span>
        {/* Botão fechar apenas no mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 rounded-lg text-text-400 hover:bg-surface-200 hover:text-text-900 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = item.path === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-500 hover:bg-surface-200 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-text-400 group-hover:text-primary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-200 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-500 hover:bg-surface-200 hover:text-text-900 transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-5 h-5" />
          Ver Site
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-500 hover:bg-surface-200 hover:text-text-900 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2.5 bg-surface-100 border border-surface-200 rounded-xl shadow-sm text-text-900 hover:bg-surface-200 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-surface-100 border-r border-surface-200 min-h-screen flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside 
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-72 bg-surface-100 z-[80] flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
