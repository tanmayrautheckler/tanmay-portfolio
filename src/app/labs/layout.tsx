import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Playground | Tanmay Raut",
  description: "Explore interactive examples of my systems, operations tools and experiments.",
};

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
