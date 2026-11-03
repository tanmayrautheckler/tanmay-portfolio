import Link from "next/link";
import { ArrowRight, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative mx-auto grid min-h-[65svh] max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1fr_.7fr] md:px-12">
      <div>
        <p className="mb-5 font-mono text-xs uppercase tracking-[.18em] text-text-secondary">404 / A small detour</p>
        <h1 className="text-5xl font-medium leading-[1.05] tracking-[-.04em] md:text-7xl">This path<br /><span className="font-serif italic">ends here.</span></h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary">The page may have moved, or the address might be incomplete. There’s plenty more to explore.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="h-11 px-5"><Link href="/projects">Explore projects <ArrowRight /></Link></Button>
          <Button asChild variant="outline" className="h-11 px-5"><Link href="/">Back home</Link></Button>
        </div>
      </div>
      <div className="relative hidden aspect-square items-center justify-center border border-border bg-surface md:flex" aria-hidden="true">
        <div className="absolute inset-8 rounded-full border border-dashed border-border" />
        <Mountain size={170} strokeWidth={.8} className="text-text-secondary" />
        <span className="absolute bottom-6 left-6 font-mono text-xs text-text-secondary">A different route awaits.</span>
      </div>
    </section>
  );
}
