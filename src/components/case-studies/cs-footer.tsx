import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import styles from "@/app/case-studies/case-studies.module.css";
const cases = [
  { slug: "odoo-17", label: "Case 01 / ERP migration", title: "The Odoo 16 to 17 cutover", description: "Preparing, testing and supporting an ERP version change across the business." },
  { slug: "vendor-portal", label: "Case 02 / Vendor operations", title: "AEI Vendor Management Portal", description: "Replacing a spreadsheet with a supplier workspace connected to Odoo." },
  { slug: "mcp-cowork", label: "Case 03 / AI integration", title: "MCP-to-Odoo AI Integration", description: "Connecting an assistant to business records through a defined tool interface." },
];
export function CSFooter({ current = "odoo-17" }: { current?: string }) {
  return <footer className={styles.seriesFooter}>
    <p>Continue the preview collection</p><h2>Two more sides of the system.</h2>
    <div className={styles.seriesLinks}>{cases.filter((entry) => entry.slug !== current).map((entry) => <Link key={entry.slug} href={`/case-studies/${entry.slug}`}><span>{entry.label}</span><h3>{entry.title}</h3><p>{entry.description}</p><span className={styles.readLink}>Read the preview <ArrowUpRight size={15} /></span></Link>)}</div>
    <Link href="/case-studies" className={styles.seriesBack}><ArrowLeft size={16} /> All case notes</Link>
  </footer>;
}
