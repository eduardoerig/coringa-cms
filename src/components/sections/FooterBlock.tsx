"use client";

import { useFranchiseModal } from "@/context/FranchiseContext";
import { getSectionStyles } from "@/utils/sectionStyles";
import { cn } from "@/lib/utils";

interface FooterBlockProps {
  settings?: Record<string, string>;
  props?: Record<string, any>;
  isEditor?: boolean;
}

export function FooterBlock({ settings = {}, props: editorProps }: FooterBlockProps) {
  const { openModal } = useFranchiseModal();
  const styles = getSectionStyles(editorProps || {});

  // Conteúdo (props têm prioridade; caem para settings globais quando vazios)
  const siteName = (editorProps?.siteName as string) || settings.general_site_name || "Meu Site";
  const description = (editorProps?.description as string) || settings.footer_description || "Oferecemos os melhores produtos e serviços com qualidade e dedicação.";
  const companyName = (editorProps?.companyName as string) || settings.footer_company_name || "Empresa Exemplo Ltda.";
  const cnpj = (editorProps?.cnpj as string) || settings.footer_cnpj || "";

  const navTitle = (editorProps?.navTitle as string) || "Navegue";
  const navLinks = (editorProps?.navLinks as Array<{ label: string; url: string }>) || [
    { label: "Início", url: "#hero-section" },
    { label: "Destaques", url: "#destaques" },
    { label: "Sobre", url: "#sobre" },
    { label: "Produtos", url: "#cardapio" },
  ];
  const institutionalTitle = (editorProps?.institutionalTitle as string) || "Institucional";
  const partnerLabel = (editorProps?.partnerLabel as string) || "Seja parceiro";
  const helpTitle = (editorProps?.helpTitle as string) || "Ajuda";

  const whatsapp = (editorProps?.whatsapp as string) || settings.contact_whatsapp || "";
  const email = (editorProps?.email as string) || settings.contact_email || "";
  const instagram = (editorProps?.instagram as string) || settings.social_instagram || "";
  const facebook = (editorProps?.facebook as string) || settings.social_facebook || "";
  const tiktok = (editorProps?.tiktok as string) || settings.social_tiktok || "";

  const titleColor = (editorProps?.titleColor as string) || "";
  const subtitleColor = (editorProps?.subtitleColor as string) || "";
  const accentColor = (editorProps?.accentColor as string) || "";
  const accent = accentColor || "var(--color-primary)";

  const headingColor = titleColor || (styles.isDark ? "#FFFFFF" : "var(--color-text-900)");
  const bodyColor = subtitleColor || (styles.isDark ? "rgba(255,255,255,0.65)" : "var(--color-text-400)");

  const socials = [
    { key: "instagram", url: instagram, icon: <><rect x="2" y="2" width="20" height="20" rx="6" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></> },
    { key: "facebook", url: facebook, icon: <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v7h3v-7h2.5l.5-3H14v-1.5a.5.5 0 0 1 .5-.5H17V5h-2a4 4 0 0 0-4 4" /> },
    { key: "tiktok", url: tiktok, icon: <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.7a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.4a6.8 6.8 0 0 0-1-.05A6.3 6.3 0 1 0 15.9 15.6v-7a8.2 8.2 0 0 0 4.8 1.5V6.7z" /> },
  ].filter((s) => s.url && s.url !== "#");

  return (
    <footer className={cn("border-t transition-colors duration-500", styles.container)} style={{ ...styles.style, borderColor: styles.isDark ? "rgba(255,255,255,0.1)" : "var(--color-text-100)", borderTopWidth: "1px" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-8 mb-12">

          {/* Marca */}
          <div className="md:col-span-1">
            <h3 data-field="siteName" className="font-display font-semibold text-xl mb-4" style={{ color: headingColor }}>{siteName}</h3>
            <p data-field="description" className="text-sm leading-relaxed mb-6 pe-4" style={{ color: bodyColor }}>{description}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map((s) => (
                  <a key={s.key} href={s.url} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: styles.isDark ? "rgba(255,255,255,0.08)" : "var(--color-surface-100)", color: headingColor }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accent; e.currentTarget.style.color = "#FFFFFF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = styles.isDark ? "rgba(255,255,255,0.08)" : "var(--color-surface-100)"; e.currentTarget.style.color = headingColor; }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navegação */}
          <div className="md:col-span-1">
            <h4 data-field="navTitle" className="font-display font-semibold text-sm mb-5" style={{ color: headingColor }}>{navTitle}</h4>
            <ul className="space-y-3">
              {navLinks.map((link, i) => (
                <li key={i} data-field="navLinks" data-item-index={i}>
                  <a href={link.url} className="text-sm transition-colors" style={{ color: bodyColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = bodyColor)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div className="md:col-span-1">
            <h4 data-field="institutionalTitle" className="font-display font-semibold text-sm mb-5" style={{ color: headingColor }}>{institutionalTitle}</h4>
            <ul className="space-y-3">
              <li>
                <button data-field="partnerLabel" onClick={openModal} className="text-sm transition-colors" style={{ color: bodyColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = bodyColor)}>
                  {partnerLabel}
                </button>
              </li>
            </ul>
          </div>

          {/* Ajuda / contato */}
          <div className="md:col-span-1">
            <h4 data-field="helpTitle" className="font-display font-semibold text-sm mb-5" style={{ color: headingColor }}>{helpTitle}</h4>
            <ul className="space-y-3">
              {whatsapp && (
                <li>
                  <a data-field="whatsapp" href={`tel:${whatsapp.replace(/\D/g, "")}`} className="text-sm transition-colors inline-flex items-center gap-2" style={{ color: bodyColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = accent)} onMouseLeave={(e) => (e.currentTarget.style.color = bodyColor)}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.62-.91a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    {whatsapp}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a data-field="email" href={`mailto:${email}`} className="text-sm transition-colors inline-flex items-center gap-2" style={{ color: bodyColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = accent)} onMouseLeave={(e) => (e.currentTarget.style.color = bodyColor)}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 text-xs border-t" style={{ borderColor: styles.isDark ? "rgba(255,255,255,0.1)" : "var(--color-text-100)", color: bodyColor }}>
          <p data-field="companyName">© {new Date().getFullYear()} {companyName}{cnpj ? ` — CNPJ: ${cnpj}` : ""}</p>
          <p>
            Feito com ⚡ por{" "}
            <a href="https://www.instagram.com/_primodev/" target="_blank" rel="noreferrer" className="font-semibold transition-colors" style={{ color: headingColor }}>@_primodev</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
