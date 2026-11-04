import { Instrument_Sans, Newsreader } from "next/font/google";

const projectSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const projectDisplay = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-work-display",
  display: "swap",
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${projectSans.variable} ${projectDisplay.variable}`}>{children}</div>;
}
