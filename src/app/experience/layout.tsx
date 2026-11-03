import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Experience | Tanmay Raut",
  description: "From production floors to ERP ownership. A record of roles, responsibilities and projects.",
};

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
