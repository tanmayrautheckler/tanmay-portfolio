"use client";

import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { SkillBar } from "@/components/skill-bar";
import { skillCategories } from "@/data/skills";
import { Server, Bot, Factory, Plug, BarChart3, Wrench, type LucideProps } from "lucide-react";

type IconComponent = React.FC<LucideProps>;

const iconMap: Record<string, IconComponent> = {
  server: Server,
  bot: Bot,
  factory: Factory,
  plug: Plug,
  "bar-chart-3": BarChart3,
  wrench: Wrench,
};

const gradientMap: Record<string, string> = {
  "Systems & ERP": "from-cyan-500/10 to-transparent",
  "Automation & AI": "from-violet-500/10 to-transparent",
  "Manufacturing & CI": "from-orange-500/10 to-transparent",
  "Integrations": "from-purple-500/10 to-transparent",
  "Analytics & Visualization": "from-blue-500/10 to-transparent",
  "Tools & Engineering": "from-amber-500/10 to-transparent",
};

export default function SkillsPage() {
  return (
    <div className="py-32 md:py-40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <SectionReveal>
          <div className="grid md:grid-cols-[140px_1fr] gap-8 md:gap-16 mb-24">
            <div className="section-number">S</div>
            <div>
              <p className="text-accent text-xs font-mono tracking-[0.2em] uppercase mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-accent pulse-dot mr-2 align-middle" />
                Capabilities
              </p>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-6">
                What I Bring.
              </h1>
              <p className="text-text-secondary text-lg max-w-xl leading-relaxed">
                A unique combination of manufacturing floor experience, end-to-end ERP ownership,
                and AI-augmented delivery — all in one person.
              </p>
            </div>
          </div>
        </SectionReveal>

        {/* Skills grid */}
        <StaggerContainer className="grid md:grid-cols-2 gap-6">
          {skillCategories.map((category) => {
            const Icon = iconMap[category.icon] || Server;
            const gradient = gradientMap[category.name] || "from-accent/10 to-transparent";
            return (
              <StaggerItem key={category.name}>
                <div className="luxury-card shimmer-on-hover bg-surface border border-border rounded-2xl overflow-hidden h-full">
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-r ${gradient} px-8 pt-8 pb-6`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background/50 backdrop-blur flex items-center justify-center border border-border">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">{category.name}</h2>
                        <p className="text-xs text-text-secondary">{category.skills.length} skills</p>
                      </div>
                    </div>
                  </div>
                  {/* Skills */}
                  <div className="px-8 py-6">
                    {category.skills.map((skill) => (
                      <SkillBar key={skill.name} skill={skill} />
                    ))}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}
