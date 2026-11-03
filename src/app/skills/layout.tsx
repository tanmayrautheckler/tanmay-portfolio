import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Capabilities | Tanmay Raut",
  description: "Business systems, manufacturing, integrations and automation, connected to actual project work.",
};

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
