import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orhjdobroevnidamqcai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaGpkb2Jyb2V2bmlkYW1xY2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDI1NTQsImV4cCI6MjA5Mjg3ODU1NH0.NmLdLmtPuUHkdlmlWEtziFMckGr9_mtoTbyTkvN2U2A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCamarimTheme() {
  const settings = [
    // === GERAL ===
    { key: 'general_site_name', value: 'Camarim Estética, Spa e Saúde Integrada' },

    // === APARÊNCIA / TEMA ===
    { key: 'theme_primary_color', value: '#C5A55A' },   // Dourado principal
    { key: 'theme_bg_color', value: '#FAF7F2' },         // Off-white quente
    { key: 'theme_tertiary_color', value: '#D4AF37' },   // Ouro brilhante (destaques)
    { key: 'theme_button_hover', value: '#B8962F' },     // Dourado quente (hover)
    { key: 'theme_heading_color', value: '#2C2218' },    // Marrom café (títulos)
    { key: 'theme_text_color', value: '#5C4A3A' },       // Marrom médio (corpo)

    // === CONTATO ===
    { key: 'contact_whatsapp', value: '(45) 99840-4228' },
    { key: 'contact_email', value: 'franriechel@gmail.com' },
    { key: 'contact_address', value: 'Rua Dom Pedro I, 157 - Centro, Marechal Cândido Rondon/PR - CEP 85960-000' },

    // === REDES SOCIAIS ===
    { key: 'social_instagram', value: 'https://instagram.com/camarimesteticaspaesaude' },
    { key: 'social_facebook', value: 'https://facebook.com/camarimesteticaspaesaude' },
    { key: 'social_tiktok', value: '' },

    // === MARKETING & SEO ===
    { key: 'marketing_cta_label', value: 'Agende sua Sessão' },
    { key: 'marketing_cta_link', value: 'https://wa.me/5545998404228?text=Olá!%20Gostaria%20de%20agendar%20uma%20sessão.' },
    { key: 'seo_description', value: 'Camarim Estética, Spa e Saúde Integrada — o único spa urbano de Marechal Cândido Rondon. Tratamentos estéticos personalizados, harmonização facial, spa para casais, nutrição integrada e tecnologias de ponta. Sinta o poder do autocuidado!' },

    // === RODAPÉ ===
    { key: 'footer_company_name', value: 'Camarim Estetica e Spa LTDA' },
    { key: 'footer_cnpj', value: '26.031.413/0001-27' },
    { key: 'footer_description', value: 'Mais que estética, cuidamos de você. Clínica de estética personalizada com foco em autoestima, bem-estar e saúde integrada.' },
  ];

  console.log('🪞 Atualizando tema para Camarim Estética...\n');

  for (const setting of settings) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: setting.value })
      .eq('key', setting.key);
    
    if (error) {
      console.error(`  ❌ ${setting.key}: ${error.message}`);
    } else {
      console.log(`  ✅ ${setting.key} = ${setting.value}`);
    }
  }

  console.log('\n✨ Tema Camarim aplicado com sucesso!');
}

updateCamarimTheme();
