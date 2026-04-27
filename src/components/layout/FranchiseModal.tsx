"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: Record<string, string>;
}

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function FranchiseModal({ isOpen, onClose, settings }: FranchiseModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    estado: "",
    cidade: "",
    lgpd: false
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lgpd) {
      alert("Você precisa aceitar os termos da LGPD para continuar.");
      return;
    }

    setLoading(true);

    try {
      // Salva na tabela leads
      const { error } = await supabase.from('leads').insert([{
        name: formData.nome,
        email: formData.email,
        phone: formData.whatsapp,
        message: `Estado: ${formData.estado} | Cidade: ${formData.cidade} | Interessado em Franquia`,
        source: 'Formulário de Franquia'
      }]);

      if (error) throw error;
      
      setStep("success");
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      alert("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 9) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    
    setFormData({ ...formData, whatsapp: value });
  };

  const whatsappNumber = settings?.contact_whatsapp?.replace(/\D/g, "");
  const whatsappLink = whatsappNumber ? `https://wa.me/55${whatsappNumber}?text=Olá,%20tenho%20interesse%20em%20ser%20um%20franqueado.` : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto flex justify-center py-4 md:py-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto mx-4"
          >
            {/* Header */}
            <div className="p-6 border-b border-text-100 flex items-center justify-between bg-surface-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-text-900 leading-none">Seja um Franqueado</h2>
                  <p className="text-text-400 text-xs mt-1">Preencha os dados abaixo e entraremos em contato.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-text-100 rounded-full transition-colors text-text-400 hover:text-text-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {step === "form" ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-bold text-text-700 mb-1.5">
                      Qual seu nome completo?*
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Responda aqui"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-50 border border-text-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-300"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-bold text-text-700 mb-1.5">
                      Agora, seu número de WhatsApp*
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="(11) 96123-4567"
                      value={formData.whatsapp}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 bg-surface-50 border border-text-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-300"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-text-700 mb-1.5">
                      Qual é seu e-mail?*
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="alguem@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-50 border border-text-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-300"
                    />
                  </div>

                  {/* Estado e Cidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-text-700 mb-1.5">
                        Estado de interesse?*
                      </label>
                      <select
                        required
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-50 border border-text-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Selecione uma opção</option>
                        {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-text-700 mb-1.5">
                        Em qual cidade?*
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Responda aqui"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-50 border border-text-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-300"
                      />
                    </div>
                  </div>

                  {/* LGPD */}
                  <div className="pt-2">
                    <p className="text-[10px] text-text-400 leading-relaxed mb-3">
                      De acordo com a Lei 13.709, Lei Geral de Proteção de Dados, o propósito da coleta dos seus dados é apenas para fins de atendimento e recebimento de informações sobre serviços deste site.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          required
                          type="checkbox"
                          checked={formData.lgpd}
                          onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-text-200 rounded peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                        </div>
                        <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-text-700 group-hover:text-primary transition-colors">Estou ciente</span>
                    </label>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl shadow-primary hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Enviar Solicitação</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-text-900 mb-2">Solicitação Enviada!</h3>
                  <p className="text-text-500 max-w-xs mb-8">
                    Obrigado pelo interesse. Em breve nossa equipe de expansão entrará em contato com você.
                  </p>
                  
                  {whatsappLink && (
                    <div className="w-full space-y-3">
                      <p className="text-sm text-text-400">Ou se preferir, fale conosco agora mesmo:</p>
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>Chamar no WhatsApp</span>
                      </a>
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="mt-6 text-text-400 font-bold hover:text-text-900 transition-colors"
                  >
                    Fechar Janela
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
