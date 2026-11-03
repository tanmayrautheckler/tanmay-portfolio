import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Project archive | Tanmay Raut",
  description: "Browse Tanmay Raut’s business systems, personal research and academic projects by category, technology and year.",
};
export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
