import { Moon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 select-none">
      {/* Premium glowing crescent icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-xl border border-emerald-500/20 shadow-emerald-900/20">
          <Moon className="w-8 h-8 text-amber-300 fill-amber-300/25 animate-pulse" />
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-2 rounded-2xl bg-emerald-500/15 blur-xl opacity-75 animate-pulse" />
      </div>
      <h3 className="mt-6 text-stone-750 dark:text-stone-300 font-serif font-bold text-base tracking-wide">
        Muslim Companion
      </h3>
      <p className="mt-2 text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Memuatkan Aplikasi...
      </p>
    </div>
  );
}
