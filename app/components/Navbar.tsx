"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Compass, Clock } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-500/20 shadow-emerald-900/10">
            <Moon className="w-5 h-5 text-amber-300 fill-amber-300/20" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-emerald-900 dark:text-emerald-400">
              Muslim
            </span>{" "}
            <span className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              Companion
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              pathname === "/"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20"
                : "text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Waktu Solat
          </Link>
          
          <Link
            href="/kiblat"
            className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              pathname === "/kiblat"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20"
                : "text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Kiblat Finder
          </Link>
        </nav>
      </div>
    </header>
  );
}
