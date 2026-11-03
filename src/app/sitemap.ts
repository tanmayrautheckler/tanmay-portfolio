import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const BASE = "https://tanmay-portfolio-pied.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static routes — priority roughly by importance
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/",                       priority: 1.0, freq: "weekly" },
    { path: "/about",                  priority: 0.8, freq: "monthly" },
    { path: "/experience",             priority: 0.8, freq: "monthly" },
    { path: "/projects",               priority: 0.9, freq: "weekly" },
    { path: "/projects/archive",       priority: 0.5, freq: "monthly" },
    { path: "/skills",                 priority: 0.7, freq: "monthly" },
    { path: "/labs",                   priority: 0.9, freq: "weekly" },
    { path: "/contact",                priority: 0.6, freq: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  // Per-project pages
  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries];
}
