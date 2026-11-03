"use client";

/** Lightweight Pikachu fallback and chat avatar; the launcher retains its original 3D scene. */
export function PikachuAvatar({ size = 48, active = false }: { size?: number; active?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true" className={`pika-avatar${active ? " is-active" : ""}`}>
    <path className="pika-tail" d="m88 78 22-19-2 18 10 4-21 24-1-18-8 4" fill="#F5CA35" stroke="#815429" strokeWidth="2.5" strokeLinejoin="round"/>
    <g className="pika-body">
      <path d="M33 48C23 38 20 16 24 8c12 4 24 20 24 35M73 43C78 25 92 10 101 10c1 14-9 32-19 40" fill="#F5D345" stroke="#815429" strokeWidth="2.3"/>
      <path d="M24 8c7 2 14 9 18 16l-16 5C23 20 22 13 24 8ZM101 10c1 7-2 16-6 23l-14-7c6-8 13-15 20-16Z" fill="#35312B"/>
      <path d="M30 81c-4 14-4 25 4 28l13-4h26l12 4c8-3 8-16 2-29" fill="#EDC13E" stroke="#815429" strokeWidth="2.3"/>
      <path d="M28 49c-5 10-8 27-3 36 7 13 61 15 68-1 4-10-1-28-8-36-12-13-45-13-57 1Z" fill="#FFDC53" stroke="#815429" strokeWidth="2.3"/>
      <ellipse cx="31" cy="76" rx="8" ry="6" fill="#EB6754"/><ellipse cx="84" cy="76" rx="8" ry="6" fill="#EB6754"/>
      <g className="pika-eyes"><ellipse cx="42" cy="62" rx="5" ry="6.5" fill="#302D29"/><ellipse cx="74" cy="62" rx="5" ry="6.5" fill="#302D29"/><circle cx="43.5" cy="60" r="1.8" fill="white"/><circle cx="75.5" cy="60" r="1.8" fill="white"/></g>
      <path d="m55 71 4 1 3-1" stroke="#513C2D" strokeWidth="3" strokeLinecap="round"/><path d="M49 78c3 4 7 4 10 0 3 4 7 4 10 0" stroke="#69412C" strokeWidth="2" strokeLinecap="round"/>
      <path className="pika-wave" d="M31 87c-10-1-16-8-14-13 2-4 9 1 15 7" fill="#FFDC53" stroke="#815429" strokeWidth="2.3" strokeLinecap="round"/>
    </g>
  </svg>;
}
