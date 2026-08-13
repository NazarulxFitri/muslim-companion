"use client";

import { useState } from "react";
import PrayerTimes from "./components/PrayerTimes";
import KiblatFinder from "./components/KiblatFinder";
import { Moon, Compass, Clock } from "lucide-react";

type TabType = "solat" | "kiblat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("solat");

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
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
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("solat")}
              className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "solat"
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20"
                  : "text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Waktu Solat
            </button>
            
            <button
              onClick={() => setActiveTab("kiblat")}
              className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "kiblat"
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20"
                  : "text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Kiblat Finder
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-start">
        {activeTab === "solat" ? <PrayerTimes /> : <KiblatFinder />}
      </main>

      {/* Subtle background glow decorative elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/3 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
