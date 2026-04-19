"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { LESSONS, type Lesson } from "@/data/case-studies/odoo-17/lessons";

function LessonCard({ lesson, index, inView }: { lesson: Lesson; index: number; inView: boolean }) {
  const reduced = useReducedMotion();
  const emphasized = lesson.emphasis;

  return (
    <motion.article
      initial={reduced ? undefined : { opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={
        emphasized
          ? "md:col-span-2 border-l-4 border-foreground bg-surface-hover/40 p-8 md:p-12 rounded-r-md"
          : "border-l-2 border-border bg-surface p-6 md:p-8 rounded-r-md hover:border-foreground/40 transition-colors"
      }
    >
      <div className="flex items-baseline gap-3 mb-4">
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
            emphasized ? "text-foreground" : "text-text-secondary"
          }`}
        >
          Lesson {String(lesson.number).padStart(2, "0")}
        </span>
        {emphasized ? (
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/60 px-2 py-0.5 rounded border border-foreground/30">
            Thesis
          </span>
        ) : null}
      </div>
      <h3
        className={`serif-display font-normal tracking-tight text-foreground ${
          emphasized ? "text-2xl md:text-4xl leading-[1.15]" : "text-xl md:text-2xl leading-[1.2]"
        }`}
      >
        {lesson.title}
      </h3>
      <p
        className={`mt-4 md:mt-5 serif-prose text-text-secondary leading-[1.7] ${
          emphasized ? "text-base md:text-lg" : "text-[15px] md:text-base"
        }`}
      >
        {lesson.body}
      </p>
    </motion.article>
  );
}

export function LessonsCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Lessons
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground">
            Five transferable insights.
          </h2>
          <p className="mt-5 text-base md:text-lg text-text-secondary serif-prose">
            Reusable on the next ERP upgrade I touch — and probably on yours too.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {LESSONS.map((lesson, i) => (
            <LessonCard key={lesson.number} lesson={lesson} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
