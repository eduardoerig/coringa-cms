"use client";

import { useFranchiseModal } from "@/context/FranchiseContext";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface FooterBlockProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
  isEditor?: boolean;
}

export function FooterBlock({ settings = {}, props: editorProps, isEditor }: FooterBlockProps) {
  const { openModal } = useFranchiseModal();
  const styles = getSectionStyles(editorProps || {});

  // Global fallbacks (read from settings if editorProps is empty)
  const whatsapp = settings.contact_whatsapp || "(11) 99999-9999";
  const email = settings.contact_email || "contato@meusite.com.br";
  const instagram = settings.social_instagram || "#";
  const facebook = settings.social_facebook || "#";
  const tiktok = settings.social_tiktok || "#";
  
  // Editor properties with fallbacks
  const companyName = (editorProps?.companyName as string) || settings.footer_company_name || "Empresa Exemplo Ltda.";
  const cnpj = (editorProps?.cnpj as string) || settings.footer_cnpj || "";
  const description = (editorProps?.description as string) || settings.footer_description || "Oferecemos os melhores produtos e serviços com qualidade e dedicação.";
  const siteName = (editorProps?.siteName as string) || settings.general_site_name || "Meu Site";

  // Appearance
  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";

  return (
    <footer 
      className={cn("border-t transition-colors duration-500", styles.container)} 
      style={{
        ...styles.style,
        borderColor: styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-text-100)',
        borderTopWidth: '1px'
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          <div className="md:col-span-1">
            <h3 
              className="font-display font-bold text-xl mb-4"
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >{siteName}</h3>
            <p 
              className="text-sm leading-relaxed mb-6 pe-4"
              style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-400)') }}
            >
              {description}
            </p>
            <div className="flex items-center gap-4">
              {instagram && instagram !== "#" && (
                <a href={instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
                  style={{
                    backgroundColor: styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                    borderColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)',
                    color: styles.isDark ? '#FFFFFF' : 'var(--color-text-900)',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.borderColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
                    e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)';
                    e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-900)';
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {facebook && facebook !== "#" && (
                <a href={facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
                  style={{
                    backgroundColor: styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                    borderColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)',
                    color: styles.isDark ? '#FFFFFF' : 'var(--color-text-900)',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.borderColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
                    e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)';
                    e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-900)';
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                </a>
              )}
              {tiktok && tiktok !== "#" && (
                <a href={tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
                  style={{
                    backgroundColor: styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                    borderColor: styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)',
                    color: styles.isDark ? '#FFFFFF' : 'var(--color-text-900)',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.borderColor = accentColor || 'var(--color-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = styles.isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
                    e.currentTarget.style.borderColor = styles.isDark ? 'rgba(255,255,255,0.2)' : 'var(--color-text-100)';
                    e.currentTarget.style.color = styles.isDark ? '#FFFFFF' : 'var(--color-text-900)';
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <h4 
              className="font-display font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >Navegue</h4>
            <ul className="space-y-3">
              <li><a href="#hero-section" className="text-sm transition-colors duration-150" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>Início</a></li>
              <li><a href="#destaques" className="text-sm transition-colors duration-150" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>Destaques</a></li>
              <li><a href="#sobre" className="text-sm transition-colors duration-150" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>Sobre</a></li>
              <li><a href="#cardapio" className="text-sm transition-colors duration-150" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>Produtos</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 
              className="font-display font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >Institucional</h4>
            <ul className="space-y-3">
              <li><button onClick={openModal} className="text-sm transition-colors duration-150" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>Seja Parceiro</button></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 
              className="font-display font-bold text-xs uppercase tracking-widest mb-5"
              style={{ color: titleColor || (styles.isDark ? '#FFFFFF' : 'var(--color-text-900)') }}
            >Ajuda</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${whatsapp.replace(/\D/g, '')}`} className="text-sm transition-colors duration-150 inline-flex items-center gap-2" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.62-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {whatsapp}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-sm transition-colors duration-150 inline-flex items-center gap-2" style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)') }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-400)')}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div 
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 text-xs border-t transition-colors duration-500"
          style={{
            borderColor: styles.isDark ? 'rgba(255,255,255,0.1)' : 'var(--color-text-100)',
            color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.5)' : 'var(--color-text-300)')
          }}
        >
          <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left">
            <p>© {new Date().getFullYear()} {companyName}{cnpj ? ` — CNPJ: ${cnpj}` : ""}</p>
            <p>
              Feito com ⚡ por{" "}
              <a 
                href="https://www.instagram.com/_primodev/" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold transition-colors"
                style={{ color: subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-500)') }}
                onMouseEnter={(e) => e.currentTarget.style.color = accentColor || 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = subtitleColor || (styles.isDark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-500)')}
              >
                @_primodev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
