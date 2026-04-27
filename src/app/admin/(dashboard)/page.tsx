"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { IceCream, Tags, Users, TrendingUp, ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface RecentProduct {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    leads: 0
  });
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes, leadsRes, latestProducts, latestLeads] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('id, title, image_url, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        products: productsRes.count || 0,
        categories: categoriesRes.count || 0,
        leads: leadsRes.count || 0
      });

      if (latestProducts.data) setRecentProducts(latestProducts.data);
      if (latestLeads.data) setRecentLeads(latestLeads.data);
    }

    fetchData();
  }, [supabase]);

  const statCards = [
    { title: "Total de Produtos", value: stats.products, icon: IceCream, color: "bg-orange-100 text-orange-600", href: "/admin/products" },
    { title: "Categorias", value: stats.categories, icon: Tags, color: "bg-blue-100 text-blue-600", href: "/admin/categories" },
    { title: "Leads de Franquia", value: stats.leads, icon: Users, color: "bg-green-100 text-green-600", href: "/admin/leads" },
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-black text-text-900 tracking-tight">Visão Geral</h1>
          <p className="text-text-500 mt-2">Bem-vindo ao painel de controle do site.</p>
        </div>
        <a 
          href="/" 
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 text-sm text-text-500 hover:text-primary transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Ver site
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              href={stat.href}
              className="bg-white p-6 rounded-2xl border border-text-100 shadow-sm flex items-center gap-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group block"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-text-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-display font-bold text-text-900 mt-1">{stat.value}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Produtos */}
        <div className="bg-white rounded-2xl border border-text-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-text-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <IceCream className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-display font-bold text-text-900">Últimos Produtos</h2>
            </div>
            <Link href="/admin/products" className="text-xs text-primary font-bold hover:underline">Ver todos →</Link>
          </div>

          {recentProducts.length > 0 ? (
            <ul className="divide-y divide-text-100">
              {recentProducts.map(product => (
                <li key={product.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                  <span className="text-sm font-medium text-text-900 truncate max-w-[200px]">{product.title}</span>
                  <span className="text-xs text-text-400 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {timeAgo(product.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-text-400 text-sm">
              Nenhum produto cadastrado.
            </div>
          )}
        </div>

        {/* Últimos Leads */}
        <div className="bg-white rounded-2xl border border-text-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-text-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-display font-bold text-text-900">Últimos Leads</h2>
            </div>
            <Link href="/admin/leads" className="text-xs text-primary font-bold hover:underline">Ver todos →</Link>
          </div>

          {recentLeads.length > 0 ? (
            <ul className="divide-y divide-text-100">
              {recentLeads.map(lead => (
                <li key={lead.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-text-900 block truncate">{lead.name}</span>
                    <span className="text-xs text-text-400 block truncate">{lead.email}</span>
                  </div>
                  <span className="text-xs text-text-400 flex items-center gap-1.5 whitespace-nowrap ml-4">
                    <Clock className="w-3 h-3" />
                    {timeAgo(lead.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-text-400 text-sm">
              Nenhum lead recebido.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
