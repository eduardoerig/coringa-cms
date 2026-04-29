import type { Metadata } from "next";
import { Inter, Space_Grotesk, Roboto, Poppins, Playfair_Display } from "next/font/google";
import { Preloader } from "@/components/ui/Preloader";
import "./globals.css";
import { getSettings } from "@/utils/settings";
import { FranchiseProvider } from "@/context/FranchiseContext";
import Script from "next/script";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

import { generatePalette } from "@/utils/colors";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.general_site_name || "Meu Site";
  const siteDescription = settings.seo_description || "Bem-vindo ao nosso site. Confira nossos produtos e serviços.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    icons: {
      icon: settings.theme_favicon_url || "/favicon.ico",
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      siteName: siteName,
      locale: "pt_BR",
      type: "website",
      images: settings.theme_logo_url ? [
        {
          url: settings.theme_logo_url,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: settings.theme_logo_url ? [settings.theme_logo_url] : [],
    },
  };
}

export const viewport = {
  themeColor: "#C8687B",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const gaId = settings.marketing_ga_id;
  const pixelId = settings.marketing_pixel_id;

  // Gerar paleta de cores dinâmica
  const primaryColor = settings.theme_primary_color || "#C8687B";
  const surfaceBg = settings.theme_bg_color || "#FFF8F6";
  const palette = generatePalette(primaryColor);

  const textHeading = settings.theme_heading_color || "#2C2218";
  const textBody = settings.theme_text_color || "#5C4A3A";
  const tertiaryColor = settings.theme_tertiary_color || "#D4AF37";
  const primaryHover = settings.theme_button_hover || "#A85068";
  
  const fontSans = settings.theme_font_sans || "inter";
  const fontDisplay = settings.theme_font_display || "playfair-display";

  const themeStyles = `
    :root {
      --theme-primary: ${palette.primary};
      --theme-primary-dark: ${palette.dark};
      --theme-primary-light: ${palette.light};
      --theme-primary-soft: ${palette.soft};
      --theme-primary-bg: ${palette.bg};
      --theme-primary-hover: ${primaryHover};
      --theme-surface-50: ${surfaceBg};
      --theme-text-heading: ${textHeading};
      --theme-text-body: ${textBody};
      --theme-tertiary: ${tertiaryColor};
      --font-sans: var(--font-${fontSans});
      --font-display: var(--font-${fontDisplay});
    }
  `;

  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${inter.variable} ${spaceGrotesk.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className="antialiased font-sans">
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Facebook Pixel */}
        {pixelId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        <Preloader />
        <FranchiseProvider settings={settings}>
          {children}
        </FranchiseProvider>
      </body>
    </html>
  );
}
