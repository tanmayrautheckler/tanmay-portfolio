"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionReveal } from "@/components/section-reveal";
import { Send, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/social-icons";

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, mailto fallback. Replace with Formspree/Resend later.
    window.location.href = `mailto:tanmay.rautwork@gmail.com?subject=Portfolio Contact from ${formState.name}&body=${encodeURIComponent(formState.message)}%0A%0AFrom: ${formState.email}`;
    setSubmitted(true);
  };

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

        <div className="mt-16 grid md:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <SectionReveal>
              <div className="space-y-4">
                <a
                  href="mailto:tanmay.rautwork@gmail.com"
                  className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Email</div>
                    <div className="text-sm text-foreground">tanmay.rautwork@gmail.com</div>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/rauttanmay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">LinkedIn</div>
                    <div className="text-sm text-foreground">linkedin.com/in/rauttanmay</div>
                  </div>
                </a>

                <a
                  href="https://github.com/tanmayrautheckler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-text-secondary hover:text-accent transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">GitHub</div>
                    <div className="text-sm text-foreground">tanmayrautheckler</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-text-secondary">
                  <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Location</div>
                    <div className="text-sm text-foreground">Phoenix, AZ</div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <SectionReveal delay={0.1}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface border border-border rounded-xl p-8 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Message Ready</h3>
                  <p className="text-sm text-text-secondary">
                    Your email client should have opened. If not, email me directly at tanmay.rautwork@gmail.com
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-8 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                      placeholder="Let's talk about how systems should work..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-black font-medium rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </SectionReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
