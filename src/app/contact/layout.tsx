import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact | Tanmay Raut",
  description: "Get in touch with Tanmay Raut about business systems, ERP and new opportunities.",
};

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
