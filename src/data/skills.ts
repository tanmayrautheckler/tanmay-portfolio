export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: "Expert" | "Proficient" | "Familiar";
  percentage: number;
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Systems & ERP",
    icon: "server",
    skills: [
      { name: "Odoo ERP (MRP, Inventory, Accounting, Sales, Purchase, Quality, CRM, Studio)", level: "Expert", percentage: 95 },
      { name: "Business Process Design & Workflow Mapping", level: "Expert", percentage: 95 },
      { name: "SQL (PostgreSQL)", level: "Proficient", percentage: 70 },
      { name: "SAP S/4HANA", level: "Familiar", percentage: 40 },
      { name: "Excel (VBA, Power Query, PivotTables)", level: "Proficient", percentage: 75 },
    ]
  },
  {
    name: "Automation & AI",
    icon: "bot",
    skills: [
      { name: "AI-Assisted Development (Claude, ChatGPT, Gemini)", level: "Expert", percentage: 90 },
      { name: "MCP Protocol Integration", level: "Expert", percentage: 90 },
      { name: "Odoo Studio Automations (Python, XML)", level: "Expert", percentage: 85 },
      { name: "Custom Module Prototyping", level: "Proficient", percentage: 75 },
    ]
  },
  {
    name: "Manufacturing & CI",
    icon: "factory",
    skills: [
      { name: "BOM/Routing Architecture", level: "Expert", percentage: 95 },
      { name: "Production Planning & Scheduling", level: "Expert", percentage: 90 },
      { name: "Lean Manufacturing (Kaizen, 5S, VSM)", level: "Expert", percentage: 90 },
      { name: "SPC, DOE, FMEA, Root Cause Analysis", level: "Proficient", percentage: 80 },
      { name: "GD&T", level: "Proficient", percentage: 70 },
    ]
  },
  {
    name: "Integrations",
    icon: "plug",
    skills: [
      { name: "Shopify Connector", level: "Proficient", percentage: 75 },
      { name: "ShipStation", level: "Proficient", percentage: 70 },
      { name: "Stripe Payment Gateway", level: "Proficient", percentage: 70 },
      { name: "Avalara/AvaTax", level: "Proficient", percentage: 65 },
      { name: "Slack & Ramp", level: "Proficient", percentage: 65 },
    ]
  },
  {
    name: "Analytics & Visualization",
    icon: "bar-chart-3",
    skills: [
      { name: "Dashboard Ninja (Custom SQL)", level: "Expert", percentage: 85 },
      { name: "KPI Design & Reporting", level: "Expert", percentage: 90 },
      { name: "Tableau", level: "Proficient", percentage: 65 },
      { name: "JMP Statistical Analysis", level: "Proficient", percentage: 60 },
    ]
  },
  {
    name: "Tools & Engineering",
    icon: "wrench",
    skills: [
      { name: "SolidWorks", level: "Familiar", percentage: 50 },
      { name: "AutoCAD / Creo / CATIA", level: "Familiar", percentage: 45 },
      { name: "JIRA / Wrike / Microsoft Project", level: "Proficient", percentage: 70 },
    ]
  }
];
