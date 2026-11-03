import styles from "@/app/case-studies/case-studies.module.css";
export function ReadingGuide({ items }: { items: { id: string; label: string }[] }) {
  return <nav className={styles.guide} aria-label="Case study sections"><span>In this case</span>{items.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>;
}
