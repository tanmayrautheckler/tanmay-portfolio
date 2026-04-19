import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { InteractiveEffects } from "@/components/interactive-wrapper";
import "./globals.css";

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
  description: "I design how manufacturing businesses run through their systems. ERP Systems Engineer specializing in Odoo, manufacturing operations, and AI-augmented business process design.",
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
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground noise">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Nav />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <InteractiveEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
