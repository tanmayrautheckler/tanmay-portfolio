"use client";

/**
 * Cmd+K command palette — fuzzy nav for routes, projects, case studies,
 * theme toggles, contact actions, easter eggs.
 *
 * Hotkeys:
 *   - Cmd/Ctrl+K → toggle
 *   - Esc → close
 *   - ↑/↓ → navigate items
 *   - Enter → run
 */

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  User,
  Briefcase,
  FolderKanban,
  Wrench,
  Mail,
  FileDown,
  Moon,
  Sun,
  Palette,
  Bot,
  BookOpen,
  Mountain,
  Sparkles,
  ExternalLink,
  FlaskConical,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/social-icons";
import { projects } from "@/data/projects";

const RESUME_URL = "/resume.pdf";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Cmd/Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  const runExternal = useCallback((url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const copyEmail = useCallback(async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText("tanmay.rautwork@gmail.com");
    } catch {
      window.location.href = "mailto:tanmay.rautwork@gmail.com";
    }
  }, []);

  const downloadResume = useCallback(() => {
    setOpen(false);
    const a = document.createElement("a");
    a.href = RESUME_URL;
    a.download = "Tanmay-Raut-Resume.pdf";
    a.click();
  }, []);

  const triggerKonami = useCallback(() => {
    setOpen(false);
    // Dispatch the konami sequence as synthetic events
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    seq.forEach((key, i) => {
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      }, i * 60);
    });
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <Command
              label="Global Command Palette"
              filter={(value, search) => {
                if (!search) return 1;
                return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
              }}
            >
              <div className="border-b border-border px-4 py-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-text-secondary/60"
                />
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-border text-text-secondary">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-sm text-text-secondary">
                  No matches. Try “projects”, “contact”, “resume”…
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-2 py-1.5">
                  <Item icon={<Home className="w-4 h-4" />} onSelect={() => go("/")} value="home">Home</Item>
                  <Item icon={<User className="w-4 h-4" />} onSelect={() => go("/about")} value="about">About</Item>
                  <Item icon={<Briefcase className="w-4 h-4" />} onSelect={() => go("/experience")} value="experience">Experience</Item>
                  <Item icon={<FolderKanban className="w-4 h-4" />} onSelect={() => go("/projects")} value="projects">Projects</Item>
                  <Item icon={<Wrench className="w-4 h-4" />} onSelect={() => go("/skills")} value="skills">Skills</Item>
                  <Item icon={<BookOpen className="w-4 h-4" />} onSelect={() => go("/case-studies")} value="case studies cases">Case Studies</Item>
                  <Item icon={<FlaskConical className="w-4 h-4" />} onSelect={() => go("/labs")} value="labs demos interactive live">Labs</Item>
                  <Item icon={<Mail className="w-4 h-4" />} onSelect={() => go("/contact")} value="contact">Contact</Item>
                </Command.Group>

                <Command.Group heading="Actions" className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-2 py-1.5 mt-2">
                  <Item icon={<FileDown className="w-4 h-4" />} onSelect={downloadResume} value="resume cv download">Download Resume</Item>
                  <Item icon={<Mail className="w-4 h-4" />} onSelect={copyEmail} value="copy email">Copy Email</Item>
                  <Item icon={<LinkedinIcon className="w-4 h-4" />} onSelect={() => runExternal("https://www.linkedin.com/in/tanmayraut/")} value="linkedin">LinkedIn <ExternalLink className="w-3 h-3 ml-auto opacity-50" /></Item>
                  <Item icon={<GithubIcon className="w-4 h-4" />} onSelect={() => runExternal("https://github.com/tanmayrautheckler")} value="github">GitHub <ExternalLink className="w-3 h-3 ml-auto opacity-50" /></Item>
                </Command.Group>

                <Command.Group heading="Theme" className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-2 py-1.5 mt-2">
                  <Item icon={<Sun className="w-4 h-4" />} onSelect={() => { setTheme("light"); setOpen(false); }} value="light mode theme">Light Mode</Item>
                  <Item icon={<Moon className="w-4 h-4" />} onSelect={() => { setTheme("dark"); setOpen(false); }} value="dark mode theme">Dark Mode</Item>
                  <Item icon={<Palette className="w-4 h-4" />} onSelect={() => { setTheme(theme === "dark" ? "light" : "dark"); setOpen(false); }} value="toggle theme switch">Toggle Theme</Item>
                </Command.Group>

                <Command.Group heading="Featured Projects" className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-2 py-1.5 mt-2">
                  {projects.filter((p) => p.featured).map((p) => (
                    <Item
                      key={p.slug}
                      icon={<FolderKanban className="w-4 h-4" />}
                      onSelect={() => go(`/projects/${p.slug}`)}
                      value={`${p.title} ${p.category} ${p.tech.join(" ")}`}
                    >
                      {p.title}
                      <span className="ml-auto text-[10px] text-text-secondary">{p.category}</span>
                    </Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Fun" className="text-[10px] font-mono uppercase tracking-widest text-text-secondary px-2 py-1.5 mt-2">
                  <Item icon={<Bot className="w-4 h-4" />} onSelect={() => { setOpen(false); document.querySelector<HTMLButtonElement>("[aria-label='Toggle menu'] ~ * button, .fixed.bottom-6.left-6 button")?.click?.(); }} value="chatbot ai ask">Open AI Chatbot</Item>
                  <Item icon={<Mountain className="w-4 h-4" />} onSelect={triggerKonami} value="konami easter egg secret confetti">Trigger Konami Code 🎮</Item>
                </Command.Group>
              </Command.List>

              <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 font-mono rounded border border-border">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 font-mono rounded border border-border">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 font-mono rounded border border-border">⌘K</kbd>
                  toggle
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}

function Item({
  icon,
  children,
  onSelect,
  value,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
  value: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground cursor-pointer aria-selected:bg-accent/15 aria-selected:text-accent transition-colors"
    >
      <span className="text-text-secondary">{icon}</span>
      {children}
    </Command.Item>
  );
}
