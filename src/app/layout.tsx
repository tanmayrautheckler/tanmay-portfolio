import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { ClubAtmosphereProvider } from "@/components/club-atmosphere";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { InteractiveEffects } from "@/components/interactive-wrapper";
import { PageTransition } from "@/components/page-transition";
import { paletteBootScript, paletteStyles } from "@/lib/appearance-palettes";
import "./globals.css";
import "@/components/site-shell.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tanmay Raut — Business Systems Architect",
  description: "I look after ERP and business systems at Heckler Design. Explore my work in Odoo, manufacturing, cost accounting and process design.",
  keywords: ["ERP", "Odoo", "Manufacturing", "Business Systems", "AI", "MCP", "Systems Architect"],
  openGraph: {
    title: "Tanmay Raut — Business Systems Architect",
    description: "I design how manufacturing businesses run through their systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteStyles }} />
        <script dangerouslySetInnerHTML={{ __html: paletteBootScript }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground noise">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClubAtmosphereProvider>
          <Nav />
          <main id="main-content" tabIndex={-1} className="flex-1 pt-16 outline-none">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <InteractiveEffects />
          <Analytics />
          </ClubAtmosphereProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
