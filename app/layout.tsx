import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import { getSiteContent } from "@/lib/site-content";

/**
 * Every page renders against live content, so admin edits appear immediately
 * instead of waiting for a rebuild.
 */
export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kabaprints — Printshop + Design",
    template: "%s · Kabaprints",
  },
  description:
    "Kabaprints is a marketing and printing agency specialising in advert production: transfer prints, screen prints, banners, vehicle branding, engraving, signage and graphic design.",
  keywords: [
    "printing Lagos", "screen printing", "transfer print", "vehicle branding", "banners",
    "roll up banners", "engraving", "signage", "business cards", "Kabaprints",
  ],
  openGraph: {
    title: "Kabaprints — Printshop + Design",
    description: "Quality printing, branding and design services. Get a quote today.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e3b5c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  // Only the fields the header menus need are passed to the client component.
  const headerServices = content.services.map((s) => ({ slug: s.slug, tag: s.tag, tagline: s.tagline }));

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Header site={content.site} services={headerServices} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}
