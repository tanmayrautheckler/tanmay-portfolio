"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/use-sound";

const themes = [
  {
    id: "cyan",
    label: "Default",
    desc: "Clean & minimal",
    colors: ["#0EBBFF", "#6366f1", "#a855f7"],
    icon: "◆",
  },
  {
    id: "ember",
    label: "Ember",
    desc: "Warm terracotta",
    colors: ["#d4764e", "#c9a87c", "#8b6f5c"],
    icon: "🔥",
  },
  {
    id: "ocean",
    label: "Ocean",
    desc: "Cool electric blue",
    colors: ["#3b82f6", "#6366f1", "#8b5cf6"],
    icon: "🌊",
  },
  {
    id: "luxe",
    label: "Luxe",
    desc: "Gold & noir",
    colors: ["#d4a44c", "#f5d78e", "#b8860b"],
    icon: "✦",
  },
] as const;

type ThemeId = (typeof themes)[number]["id"];

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>("cyan");
  const [soundOn, setSoundOn] = useState(true);
  const { play, toggle } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as ThemeId | null;
    if (saved && themes.some(t => t.id === saved)) {
      setActive(saved);
      applyTheme(saved, false);
    }
    const soundPref = localStorage.getItem("portfolio-sound");
    if (soundPref === "off") setSoundOn(false);
  }, []);

  const applyTheme = useCallback((id: ThemeId, withSound = true) => {
    const html = document.documentElement;
    themes.forEach(t => html.classList.remove(`theme-${t.id}`));
    if (id !== "cyan") html.classList.add(`theme-${id}`);
    localStorage.setItem("portfolio-theme", id);
    setActive(id);
    if (withSound) play("switch");
  }, [play]);

  const toggleSound = useCallback(() => {
    const on = toggle();
    setSoundOn(on);
    localStorage.setItem("portfolio-sound", on ? "on" : "off");
    if (on) play("pop");
  }, [toggle, play]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-4 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl min-w-[220px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest text-text-secondary">Theme</div>
              <button
                onClick={toggleSound}
                className="text-text-secondary hover:text-accent transition-colors p-1"
                aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="space-y-1">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { applyTheme(t.id); setOpen(false); }}
                  onMouseEnter={() => play("hover")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    active === t.id
                      ? "bg-accent/10 ring-1 ring-accent/20"
                      : "hover:bg-surface"
                  }`}
                >
                  <div className="flex gap-1 shrink-0">
                    {t.colors.map((c, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{ background: c }}
                        animate={active === t.id ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${active === t.id ? "text-accent" : "text-foreground"}`}>
                      {t.icon} {t.label}
                    </div>
                    <div className="text-[10px] text-text-secondary truncate">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { setOpen(!open); play("click"); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-11 h-11 rounded-full border border-border bg-background/80 backdrop-blur-xl flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all shadow-lg"
        aria-label="Change theme"
      >
        <motion.div animate={open ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.3 }}>
          <Palette className="w-4.5 h-4.5" />
        </motion.div>
      </motion.button>
    </div>
  );
}
