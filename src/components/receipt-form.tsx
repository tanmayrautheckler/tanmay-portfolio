"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CONTACT_EMAIL = "tanmay.rautwork@gmail.com";
const TOPICS = ["A role or collaboration", "A systems question", "An idea to share"];

export function ReceiptForm() {
  const id = useId();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const subject = `${topic} / ${name.trim() || "Portfolio enquiry"}`;
  const body = `${message.trim()}\n\n${name.trim()}${email.trim() ? `\n${email.trim()}` : ""}`;

  function openDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied(false);
    setStatus("Draft prepared. Finish sending in your email app. If nothing opened, copy the message below.");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      setStatus("Draft copied. Paste it into your preferred email app.");
    } catch {
      setCopied(false);
      setStatus("Copy is unavailable in this browser. Your message is still here; select and copy it from the form.");
    }
  }

  return (
    <div className="contact-letter">
      <div className="contact-letter-top"><span>TO / TANMAY RAUT</span><Mail aria-hidden="true" size={18} /></div>
      <form onSubmit={openDraft} className="contact-compose">
        <fieldset className="contact-topics"><legend>What brings you here?</legend><div>{TOPICS.map((item) => <Button key={item} type="button" variant="ghost" aria-pressed={topic === item} onClick={() => { setTopic(item); setStatus(""); setCopied(false); }}>{item}</Button>)}</div></fieldset>
        <div className="contact-input-row">
          <div><label htmlFor={`${id}-name`}>Your name</label><input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120} value={name} onChange={(event) => { setName(event.target.value); setStatus(""); setCopied(false); }} placeholder="Alex Morgan" /></div>
          <div><label htmlFor={`${id}-email`}>Your email</label><input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={200} value={email} onChange={(event) => { setEmail(event.target.value); setStatus(""); setCopied(false); }} placeholder="alex@example.com" /></div>
        </div>
        <div className="contact-message"><label htmlFor={`${id}-message`}>A little context</label><textarea id={`${id}-message`} name="message" required rows={5} maxLength={2500} value={message} onChange={(event) => { setMessage(event.target.value); setStatus(""); setCopied(false); }} placeholder="What are you working on, and where could I help?" /><span>{message.length.toLocaleString("en-US")} / 2,500</span></div>
        <div className="contact-compose-actions"><Button type="submit" className="contact-send">Open email draft <ArrowUpRight size={17} /></Button><Button type="button" variant="ghost" onClick={copyDraft} disabled={!message.trim()} className="contact-copy-draft">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy draft"}</Button></div>
        <p className="contact-form-note">This opens your email app. Nothing is sent from this website.</p>
        <p className="contact-form-status" role="status" aria-live="polite">{status}</p>
      </form>
      <div className="contact-letter-bottom"><span>PHOENIX, ARIZONA</span><span>Let&apos;s make something useful.</span></div>
    </div>
  );
}
