import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getSettings } from "@/utils/settings";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { DynamicSections } from "@/components/layout/DynamicSections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await getSettings();
  const isMaintenanceMode = settings.general_maintenance_mode === "true";

  if (isMaintenanceMode) {
    return (
      <main className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <Image
              src="https://placehold.co/440x120/eeeeee/999999?text=LOGO"
              alt="Logo da Marca"
              width={220}
              height={60}
              className="mx-auto opacity-80"
            />
          </div>

          <div className="w-20 h-20 mx-auto mb-8 bg-white rounded-full shadow-sm flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-black text-text-900 tracking-tight mb-4">
            Estamos em manutenção
          </h1>
          <p className="text-text-500 text-lg leading-relaxed mb-8">
            Nosso site está passando por uma atualização rápida para ficar ainda melhor. Voltamos em breve!
          </p>

          <div className="flex items-center justify-center gap-2 text-text-300 text-sm">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Trabalhando nisso agora
          </div>
        </div>
      </main>
    );
  }

  // Buscar layout do banco
  const supabase = await createClient();
  const { data: layout } = await supabase
    .from("page_layouts")
    .select("sections, is_published")
    .eq("id", "home")
    .single();

  const sections = layout?.is_published ? layout.sections : null;

  return (
    <main className="min-h-screen bg-surface-50">
      
      <DynamicSections sections={sections} settings={settings} />
      
      <WhatsAppButton phone={settings.contact_whatsapp} />
      <Footer />
    </main>
  );
}
