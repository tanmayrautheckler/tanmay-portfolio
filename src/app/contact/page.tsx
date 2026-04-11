"use client";

import { SectionReveal } from "@/components/section-reveal";
import { ReceiptForm } from "@/components/receipt-form";

export default function ContactPage() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <SectionReveal>
          <p className="text-accent text-sm font-mono tracking-wider uppercase mb-4">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Let&apos;s Connect</h1>
          <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
            Whether you need an ERP architect, a business systems consultant, or just want to talk
            about manufacturing and technology — I&apos;d love to hear from you.
          </p>
        </SectionReveal>

        <div className="mt-16">
          <SectionReveal delay={0.1}>
            <ReceiptForm />
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
