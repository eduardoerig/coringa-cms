"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Save,
  Loader2,
  Globe,
  Phone,
  Share2,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/ToastContainer";

interface Setting {
  key: string;
  value: string;
  group: string;
  label: string;
  type: string;
}

const tabGroups = [
  {
    groupLabel: "Configurações",
    tabs: [
      { id: "geral",      label: "Geral",           icon: Globe },
      { id: "contato",    label: "Contatos",         icon: Phone },
      { id: "social",     label: "Redes Sociais",    icon: Share2 },
      { id: "marketing",  label: "Marketing & SEO",  icon: BarChart3 },
    ],
  },
];

const allTabs = tabGroups.flatMap(g => g.tabs);

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const { toasts, addToast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  // Detectar se há alterações não salvas
  const hasUnsavedChanges = useMemo(() => {
    return settings.some(s => s.value !== originalSettings[s.key]);
  }, [settings, originalSettings]);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('group');
    
    if (error) {
      console.error('Erro ao buscar configurações:', error);
    } else if (data) {
      setSettings(data);
      const map: Record<string, string> = {};
      data.forEach(s => { map[s.key] = s.value; });
      setOriginalSettings(map);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdateValue = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  // Helper para pegar valor atual de uma setting pelo key
  const getValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || "";
  };

  async function handleSave() {
    setIsSaving(true);
    
    const changedSettings = settings.filter(s => s.value !== originalSettings[s.key]);
    
    if (changedSettings.length === 0) {
      addToast("Nenhuma alteração para salvar.", "warning");
      setIsSaving(false);
      return;
    }

    const updates = changedSettings.map(setting => 
      supabase
        .from('site_settings')
        .update({ 
          value: setting.value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', setting.key)
    );

    const results = await Promise.all(updates);
    const hasError = results.some(r => r.error);

    if (hasError) {
      addToast("Algumas configurações não puderam ser salvas.", "error");
    } else {
      const map: Record<string, string> = {};
      settings.forEach(s => { map[s.key] = s.value; });
      setOriginalSettings(map);
      addToast("Salvo com sucesso!");
    }
    
    setIsSaving(false);
  }

  const groupedSettings = settings.filter(s => s.group === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-24 md:p-10 md:pt-24 space-y-6 overflow-y-auto h-full custom-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-text-900 tracking-tight">Configurações</h1>
          <p className="text-text-500 mt-1">Gerencie as informações globais e o conteúdo das seções.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Alterações não salvas
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-5">
          {tabGroups.map((group) => (
            <div key={group.groupLabel}>
              <p className="text-[10px] font-bold text-text-400 uppercase tracking-[0.15em] px-4 mb-2">{group.groupLabel}</p>
              <div className="space-y-1">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-text-500 hover:bg-surface-100 hover:text-primary"
                    )}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Form Area */}
          <div className="bg-white border border-text-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-text-100 pb-4 mb-6">
                    <h3 className="text-xl font-display font-black text-text-900 capitalize">
                      {allTabs.find(t => t.id === activeTab)?.label}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {groupedSettings.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-text-700">{setting.label}</label>
                          <span className="text-[10px] text-text-300 font-mono hidden sm:inline">{setting.key}</span>
                        </div>
                        
                        {setting.type === 'switch' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateValue(setting.key, setting.value === 'true' ? 'false' : 'true')}
                              className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                                setting.value === 'true' ? "bg-primary" : "bg-text-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "toggle-knob inline-block h-4 w-4 transform rounded-full transition-transform",
                                  setting.value === 'true' ? "translate-x-6" : "translate-x-1"
                                )}
                              />
                            </button>
                            <span className="text-sm text-text-500">{setting.value === 'true' ? 'Ativado' : 'Desativado'}</span>
                          </div>
                        ) : setting.type === 'textarea' ? (
                          <textarea
                            value={setting.value || ""}
                            onChange={e => handleUpdateValue(setting.key, e.target.value)}
                            className="w-full px-4 py-3 border border-text-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] text-sm resize-none transition-all"
                          />
                        ) : (
                          <input
                            type={setting.type === 'url' ? 'url' : 'text'}
                            value={setting.value || ""}
                            onChange={e => handleUpdateValue(setting.key, e.target.value)}
                            className="w-full px-4 py-2.5 border border-text-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {groupedSettings.length === 0 && (
                    <div className="text-center py-12 text-text-400">
                      Nenhuma configuração neste grupo.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

