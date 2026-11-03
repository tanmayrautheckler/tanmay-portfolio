"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Copy, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/social-icons";
import { CONTACT_EMAIL, ReceiptForm } from "@/components/receipt-form";
import "./contact.css";

export default function ContactPage() {
  const [copyStatus, setCopyStatus] = useState("");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyStatus("Email address copied.");
    } catch {
      setCopyStatus("Select the email address to copy it, or use the email link.");
    }
  }

  return (
    <article className="contact-page">
      <header className="contact-heading"><p>CONTACT / START A CONVERSATION</p><h1>Something<br /><span>on your mind?</span></h1><div><p>A role, a systems problem, or an idea you&apos;re excited about. I&apos;d like to hear it.</p><ArrowDownRight aria-hidden="true" size={34} strokeWidth={1.2} /></div></header>
      <div className="contact-layout">
        <aside className="contact-details" aria-label="Contact options">
          <div className="contact-direct"><span>THE DIRECT ROUTE</span><a href={`mailto:${CONTACT_EMAIL}`} className="contact-email">{CONTACT_EMAIL}<ArrowUpRight size={18} /></a><Button variant="ghost" onClick={copyEmail} className="contact-copy-address">{copyStatus === "Email address copied." ? <Check size={14} /> : <Copy size={14} />}Copy email</Button><p role="status">{copyStatus}</p></div>
          <div className="contact-about"><span>A FEW GOOD REASONS TO SAY HELLO</span><p>You&apos;re looking for someone who can connect business needs with the systems behind them.</p><p>You&apos;re untangling an Odoo workflow, bringing teams onto the same page, or building a tool of your own.</p></div>
          <div className="contact-elsewhere"><a href="https://www.linkedin.com/in/rauttanmay/" target="_blank" rel="noopener noreferrer"><LinkedinIcon className="size-4" /><span>Connect on LinkedIn</span><ArrowUpRight size={15} /></a><a href="https://github.com/tanmayrautheckler" target="_blank" rel="noopener noreferrer"><GithubIcon className="size-4" /><span>Explore my GitHub</span><ArrowUpRight size={15} /></a><a href="/resume.pdf" download="Tanmay-Raut-Resume.pdf"><FileDown size={16} /><span>Download my résumé</span><ArrowUpRight size={15} /></a></div>
          <p className="contact-location"><span />Based in Phoenix, Arizona.</p>
        </aside>
        <ReceiptForm />
      </div>
    </article>
  );
}
