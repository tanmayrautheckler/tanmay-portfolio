import type { Metadata } from "next";
import Link from "next/link";
import styles from "./case-studies.module.css";

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
  return <div className={styles.casePage}><aside className={styles.previewBar} aria-label="Publication status"><span><strong>Preview edition.</strong> Publication review is pending. These case studies are not indexed.</span><Link href="/projects">Browse public project stories</Link></aside>{children}</div>;
}
