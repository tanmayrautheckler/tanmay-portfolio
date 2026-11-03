"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, FileDown, Folder, Mail, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { contactDetails, siteNavigation } from "@/data/site-navigation";
import { projects } from "@/data/projects";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.dispatchEvent(new Event("portfolio:close-overlays"));
      setOpen(true);
      setStatus("");
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else onOpen();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("portfolio:open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("portfolio:open-search", onOpen);
    };
  }, [open]);

  function go(path: string) { setOpen(false); router.push(path); }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(contactDetails.email); setStatus("Email address copied."); }
    catch { setStatus(contactDetails.email); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="site-command-panel" onCloseAutoFocus={(event) => {
        event.preventDefault();
        const previous = opener.current;
        if (previous?.isConnected && !previous.closest('[role="dialog"]')) previous.focus();
        else document.querySelector<HTMLButtonElement>('[aria-label="Search pages and projects"]')?.focus();
      }}>
        <div className="site-command-heading"><DialogTitle>Find something</DialogTitle><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close search"><X /></Button></DialogClose></div>
        <DialogDescription className="sr-only">Search pages, projects and contact actions. Use arrow keys to choose a result and Enter to open it.</DialogDescription>
        <Command label="Search portfolio" filter={(value, search) => {
          const words = search.toLowerCase().trim().split(/\s+/);
          return words.every(word => value.toLowerCase().includes(word)) ? 1 : 0;
        }}>
          <div className="site-command-search"><Search size={20} /><Command.Input autoFocus placeholder="A project, a skill, a page…" aria-label="Search portfolio" /></div>
          <Command.List className="site-command-list" data-lenis-prevent>
            <Command.Empty className="site-command-empty">No matches. Try Odoo, manufacturing, trading or contact.</Command.Empty>
            <Command.Group heading="Pages">
              {siteNavigation.map((link) => <Command.Item className="site-command-item" key={link.href} value={`${link.label} ${link.href}`} onSelect={() => go(link.href)}><ArrowUpRight size={16} /><span>{link.label}</span><small>{link.description}</small></Command.Item>)}
              <Command.Item className="site-command-item" value="all projects archive browse" onSelect={() => go("/projects/archive")}><Folder size={16} />Project archive<small>{projects.length} projects</small></Command.Item>
              <Command.Item className="site-command-item" value="case studies cases long form" onSelect={() => go("/case-studies")}><Folder size={16} />Case studies<small>Decisions, process and outcomes</small></Command.Item>
            </Command.Group>
            <Command.Group heading="Projects">
              {projects.map((project) => <Command.Item className="site-command-item" key={project.slug} value={`${project.slug} ${project.title} ${project.tech.join(" ")} ${project.category}`} onSelect={() => go(`/projects/${project.slug}`)}><Folder size={16} /><span>{project.title}</span><small>{project.category}</small></Command.Item>)}
            </Command.Group>
            <Command.Group heading="Get in touch">
              <Command.Item className="site-command-item" value="copy email contact" onSelect={copyEmail}><Mail size={16} />Copy email address<small>{contactDetails.email}</small></Command.Item>
              <Command.Item className="site-command-item" value="resume cv download" onSelect={() => {
                const anchor = document.createElement("a"); anchor.href = contactDetails.resume; anchor.download = "Tanmay-Raut-Resume.pdf"; anchor.click(); setOpen(false);
              }}><FileDown size={16} />Download resume</Command.Item>
            </Command.Group>
          </Command.List>
          <div className="site-command-footer"><span role="status">{status || "↑ ↓ to browse"}</span><span className="inline-flex items-center gap-1"><CornerDownLeft size={12} /> Open <span className="ml-3">Esc Close</span></span></div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
