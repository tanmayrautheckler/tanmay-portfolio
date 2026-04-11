"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrinterSound } from "@/hooks/use-printer-sound";
import { Send, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/social-icons";

const serviceItems = [
  { label: "ERP Consultation", price: "$0.00" },
  { label: "Systems Architecture", price: "$0.00" },
  { label: "Process Optimization", price: "$0.00" },
  { label: "Odoo Implementation", price: "$0.00" },
];

export function ReceiptForm() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [printing, setPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { play: playPrinter } = usePrinterSound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrinting(true);
    playPrinter();

    // Wait for print animation, then open mailto
    setTimeout(() => {
      window.location.href = `mailto:tanmay.rautwork@gmail.com?subject=Portfolio Contact from ${formState.name}&body=${encodeURIComponent(formState.message)}%0A%0AFrom: ${formState.email}`;
      setPrinting(false);
      setSubmitted(true);
    }, 1800);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-md mx-auto">
      {/* Receipt */}
      <motion.div
        ref={receiptRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="receipt-paper"
      >
        {/* Zigzag top */}
        <div className="receipt-zigzag" />

        <div className="px-6 pt-4 pb-6 font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-lg font-bold tracking-wider">TANMAY RAUT</div>
            <div className="text-xs text-text-secondary tracking-widest mt-1">BUSINESS SYSTEMS ARCHITECT</div>
            <div className="text-xs text-text-secondary mt-1">Phoenix, AZ</div>
          </div>

          <div className="receipt-divider" />

          {/* Date / Order info */}
          <div className="flex justify-between text-xs text-text-secondary my-3">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
          <div className="text-xs text-text-secondary mb-3">
            ORDER #: {Math.floor(Math.random() * 9000 + 1000).toString()}
          </div>

          <div className="receipt-divider" />

          {/* Service Items */}
          <div className="my-3 space-y-1.5">
            {serviceItems.map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-foreground">{item.label}</span>
                <span className="text-text-secondary">{item.price}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider" />

          {/* Total */}
          <div className="flex justify-between my-3 font-bold text-sm">
            <span>TOTAL</span>
            <span className="text-accent">FREE</span>
          </div>

          <div className="receipt-divider" />

          {/* Contact Links */}
          <div className="my-4 space-y-2 text-xs">
            <a href="mailto:tanmay.rautwork@gmail.com" className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
              <Mail className="w-3 h-3" />
              <span>tanmay.rautwork@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/rauttanmay/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
              <LinkedinIcon className="w-3 h-3" />
              <span>linkedin.com/in/rauttanmay</span>
            </a>
            <a href="https://github.com/tanmayrautheckler" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors">
              <GithubIcon className="w-3 h-3" />
              <span>tanmayrautheckler</span>
            </a>
          </div>

          <div className="receipt-divider" />

          {/* Form / Success */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-4 h-4 text-success" />
                </div>
                <div className="text-sm font-bold mb-1">RECEIPT PRINTED</div>
                <div className="text-xs text-text-secondary">
                  Email client opened. If not, email tanmay.rautwork@gmail.com directly.
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mt-4 space-y-3"
                exit={{ opacity: 0 }}
              >
                <div className="text-xs text-text-secondary text-center mb-3 tracking-wider">
                  — LEAVE A MESSAGE —
                </div>
                <div>
                  <label htmlFor="name" className="block text-xs text-text-secondary mb-1 uppercase tracking-wider">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent border-b border-border text-sm font-mono focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs text-text-secondary mb-1 uppercase tracking-wider">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent border-b border-border text-sm font-mono focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs text-text-secondary mb-1 uppercase tracking-wider">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={3}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent border-b border-border text-sm font-mono focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-text-secondary/40"
                    placeholder="Let's talk systems..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={printing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {printing ? (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      PRINTING...
                    </motion.span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      PRINT RECEIPT
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Barcode decoration */}
          <div className="mt-6 mb-2">
            <div className="receipt-barcode mx-auto" />
            <div className="text-center text-[10px] text-text-secondary mt-1 tracking-widest">
              THANK YOU FOR YOUR VISIT
            </div>
          </div>
        </div>

        {/* Zigzag bottom */}
        <div className="receipt-zigzag rotate-180" />
      </motion.div>

      {/* Print animation overlay */}
      <AnimatePresence>
        {printing && (
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "linear" }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-sm font-mono text-accent tracking-widest"
              >
                PRINTING RECEIPT...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
