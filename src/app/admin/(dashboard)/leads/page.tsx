"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Mail, Phone, Calendar, Download, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/ToastContainer";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "novo",       label: "Novo",       color: "bg-blue-500/15 text-blue-300",   dot: "bg-blue-400" },
  { value: "contatado",  label: "Contatado",  color: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
  { value: "convertido", label: "Convertido", color: "bg-green-500/15 text-green-300", dot: "bg-green-400" },
  { value: "descartado", label: "Descartado", color: "bg-[#252540] text-[#64748B]",   dot: "bg-[#475569]" },
];

function getStatusStyle(status: string) {
  return statusOptions.find(s => s.value === status)?.color || "bg-blue-100 text-blue-800";
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Erro ao buscar leads:', error);
        addToast(`Erro ao carregar leads: ${error.message}`, "error");
      }
      if (data) setLeads(data);
      setLoading(false);
    })();
  }, [supabase]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        lead.message?.toLowerCase().includes(search) ||
        lead.status.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "todos" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleStatusChange = useCallback(async (leadId: string, newStatus: string) => {
    setOpenDropdownId(null);
    
    // Atualiza otimisticamente
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      addToast("Erro ao atualizar status. Recarregando...", "error");
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) setLeads(data);
    }
  }, [supabase]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Nome", "Email", "Telefone", "Mensagem", "Status", "Data"];
    const rows = filteredLeads.map(l => [
      l.name,
      l.email,
      l.phone || "",
      (l.message || "").replace(/"/g, '""'),
      l.status,
      new Date(l.created_at).toLocaleDateString('pt-BR'),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLeads]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openDropdownId]);

  return (
    <div className="max-w-6xl mx-auto p-4 pt-24 md:p-10 md:pt-24 space-y-6 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-text-900 tracking-tight">Leads (Franquia)</h1>
          <p className="text-text-500 mt-1">Gerencie os contatos recebidos pelo formulário do site.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredLeads.length === 0}
          className="flex items-center gap-2 bg-white border border-text-200 text-text-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white border border-text-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-text-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-text-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            {["todos", ...statusOptions.map(s => s.value)].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                  statusFilter === s
                    ? "bg-primary text-white"
                    : "bg-surface-50 text-text-500 hover:bg-surface-100"
                )}
              >
                {s === "todos" ? "Todos" : statusOptions.find(opt => opt.value === s)?.label || s}
              </button>
            ))}
          </div>
          <span className="text-xs text-text-400 font-medium ml-auto whitespace-nowrap">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 text-text-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Dados</th>
                <th className="px-6 py-4 font-medium">Mensagem</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-text-400">Nenhum lead encontrado.</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-text-900 text-sm">{lead.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {lead.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="text-text-500 line-clamp-2 max-w-xs">{lead.message || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === lead.id ? null : lead.id);
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:ring-2 hover:ring-offset-1 hover:ring-text-200",
                            getStatusStyle(lead.status)
                          )}
                        >
                          {statusOptions.find(s => s.value === lead.status)?.label ?? lead.status}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {openDropdownId === lead.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 bg-white border border-text-100 rounded-xl shadow-xl z-20 py-1 min-w-[140px]"
                            onClick={e => e.stopPropagation()}
                          >
                            {statusOptions.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(lead.id, opt.value)}
                                className={cn(
                                  "w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-50 transition-colors flex items-center gap-2",
                                  lead.status === opt.value ? "text-primary font-bold" : "text-text-700"
                                )}
                              >
                                <span className={cn("w-2 h-2 rounded-full", opt.dot)} />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
