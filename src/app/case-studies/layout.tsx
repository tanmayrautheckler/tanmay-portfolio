import type { Metadata } from "next";

/**
 * Case-study segment layout.
 *
 * Privacy posture: no index, no follow. These pages exist in the build but
 * should not appear in search results or link previews until the series is
 * approved for public publishing (attorney review — PERM in progress).
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  // Deliberately omit openGraph.images / twitter card until publish-approved.
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
