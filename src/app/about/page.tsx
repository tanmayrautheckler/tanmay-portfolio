import type { Metadata } from "next";
import AboutJournal from "@/components/about/journal/about-journal";

export const metadata: Metadata = {
  title: "About — A personal journal | Tanmay Raut",
  description: "A few pages about Tanmay Raut: Mumbai to Phoenix, travel, FC Barcelona, curiosity, and life beyond work.",
};

export default function About() {
  return <AboutJournal/>;
}
