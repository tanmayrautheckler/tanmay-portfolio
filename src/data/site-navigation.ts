export const siteNavigation = [
  { href: "/", label: "Home", description: "A walk through my work", group: "Explore" },
  { href: "/projects", label: "Projects", description: "The problems, decisions and results", group: "Explore" },
  { href: "/labs", label: "Playground", description: "Try the tools for yourself", group: "Explore" },
  { href: "/about", label: "About", description: "The person behind the systems", group: "Background" },
  { href: "/experience", label: "Experience", description: "From the floor to the full business", group: "Background" },
  { href: "/skills", label: "Capabilities", description: "What I use and where it shows up", group: "Background" },
  { href: "/contact", label: "Contact", description: "Start a conversation", group: "Connect" },
] as const;

export const contactDetails = {
  email: "tanmay.rautwork@gmail.com",
  linkedin: "https://www.linkedin.com/in/rauttanmay/",
  github: "https://github.com/tanmayrautheckler",
  resume: "/resume.pdf",
};

export function isActiveRoute(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
