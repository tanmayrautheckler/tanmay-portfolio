import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./social-icons";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Built with Next.js, Three.js & Framer Motion
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/tanmayrautheckler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/rauttanmay/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>
          <a
            href="mailto:tanmay.rautwork@gmail.com"
            className="text-text-secondary hover:text-accent transition-colors"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
