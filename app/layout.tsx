import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "./components/Navbar";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muslim Companion - Waktu Solat & Pencari Arah Kiblat Malaysia",
  description: "Dapatkan waktu solat tepat di Malaysia berdasarkan zon JAKIM serta pencari arah Kiblat kompas automatik. Rekaan moden, ringan, dan mesra peranti mudah alih.",
  keywords: ["waktu solat", "arah kiblat", "kiblat finder", "kompas kiblat", "jakim waktu solat", "muslim companion", "solat malaysia", "kompas online", "kiblat malaysia", "kaabah"],
  authors: [{ name: "Nazarul" }],
  openGraph: {
    title: "Muslim Companion - Waktu Solat & Arah Kiblat Malaysia",
    description: "Semak waktu solat zon JAKIM dan tentukan arah Kiblat dengan kompas penderia automatik secara online.",
    type: "website",
    locale: "ms-MY",
    siteName: "Muslim Companion",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muslim Companion - Waktu Solat & Arah Kiblat Malaysia",
    description: "Semak waktu solat zon JAKIM dan tentukan arah Kiblat dengan kompas penderia automatik secara online.",
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ms"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex flex-col justify-start">
          {children}
        </main>
        
        {/* Unified Footer */}
        <footer className="w-full max-w-5xl mx-auto px-4 py-8 border-t border-stone-200 dark:border-stone-850 text-stone-550 dark:text-stone-400 text-xs">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="max-w-xl">
              <p className="font-semibold text-stone-750 dark:text-stone-300">
                Muslim Companion &copy; {new Date().getFullYear()}
              </p>
              <p className="mt-1 text-stone-450 dark:text-stone-550 text-[11px] leading-relaxed">
                Data waktu solat dan rujukan kiblat dibekalkan dengan kerjasama API pihak ketiga, dirujuk rasmi dari **JAKIM Malaysia (Jabatan Kemajuan Islam Malaysia)**.
              </p>
            </div>
            <div className="flex flex-col md:items-end text-[11px] text-stone-450 dark:text-stone-500">
              <span>Dibangunkan oleh <strong className="text-emerald-800 dark:text-emerald-450 font-semibold">Nazarul</strong></span>
              <span className="mt-0.5">Selusuri arah kiblat & waktu solat di mana-mana sahaja.</span>
            </div>
          </div>
        </footer>

        {/* Subtle background glow decorative elements */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/3 blur-[120px] pointer-events-none -z-10" />
      </body>
    </html>
  );
}
