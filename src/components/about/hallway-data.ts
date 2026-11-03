export type RoomPoint = { x: number; z: number };
export const hallwayRooms = [
  {
    keepsake: "Paper plane", number: "01", name: "Where it began", side: -1, z: -4,
    title: "Mumbai to Phoenix.",
    text: "I crossed continents for a master’s in mechanical engineering at Arizona State University. Before that, I studied aeronautical engineering at Manipal.",
    detail: "My working life started on the manufacturing floor, managing welders and machinists. That experience still shapes how I look at a problem.",
    object: 0, action: "Launch the paper plane", response: "Paper plane found. Origins stamp collected.",
    accent: "#e9ba83",
  },
  {
    keepsake: "Compass", number: "02", name: "Out of office", side: 1, z: -10,
    title: "Take the long way.",
    text: "Thirty places and counting. Monument Valley, Hawaii, Iceland, France, Singapore and plenty of stops between them.",
    detail: "These photos are mine. I like leaving the desk behind and finding something I haven’t seen before.",
    object: 4, action: "Turn the globe", response: "Compass found. Travel stamp collected.",
    accent: "#91c5d0",
  },
  {
    keepsake: "Match ball", number: "03", name: "The weekend", side: -1, z: -16,
    title: "A ball. A bit of space.",
    text: "FC Barcelona and Messi. Soccer is my weekend reset: a different rhythm after a week at a desk.",
    detail: "A game with friends is a good way to get out of my head and into the weekend.",
    object: 3, action: "Kick the ball", response: "Match ball found. Weekend stamp collected.",
    accent: "#bad393",
  },
  {
    keepsake: "Open book", number: "04", name: "Still curious", side: 1, z: -22,
    title: "A different way to look.",
    text: "I like listening to different philosophies and thinking through how people see the same thing differently.",
    detail: "An interesting idea usually leaves me with another question.",
    object: 2, action: "Open the book", response: "Open book found. Curiosity stamp collected.",
    accent: "#c8b5d8",
  },
  {
    keepsake: "Research lens", number: "05", name: "After hours", side: -1, z: -28,
    title: "Following a question.",
    text: "Markets are something I study for fun. I build research tools, investigate patterns and try to understand what sits behind a signal.",
    detail: "I like building something that lets me follow an idea further.",
    object: 1, action: "Wake the screens", response: "Research lens found. After-hours stamp collected.",
    accent: "#98c9b2",
  },
] as const;

export function roomAt(point: RoomPoint): number | null {
  const index = hallwayRooms.findIndex(room =>
    point.x * room.side > 3.3 && point.x * room.side < 10.5 && Math.abs(point.z - room.z) < 3.05);
  return index < 0 ? null : index;
}

export function nearestDoor(point: RoomPoint): number | null {
  let nearest: number | null = null;
  let distance = 2.8;
  hallwayRooms.forEach((room, index) => {
    const next = Math.hypot(point.x - room.side * 3, point.z - room.z);
    if (next < distance) { nearest = index; distance = next; }
  });
  return nearest;
}

// Corridor, doorway thresholds and rooms are separate spaces. Closed doors block entry.
export function canWalk(point: RoomPoint, doors: readonly boolean[], rooftop = false): boolean {
  if (rooftop && point.z < -31.7 && point.z > -42.5 && Math.abs(point.x) < (point.z > -33.4 ? .88 : 5.4)) return true;
  if (Math.abs(point.x) <= 2.65 && point.z >= -32 && point.z <= 4.3) return true;
  return hallwayRooms.some((room, index) => {
    if (!doors[index]) return false;
    const depth = point.x * room.side;
    const offset = Math.abs(point.z - room.z);
    if (depth > 2.65 && depth <= 3.4) return offset < .78;
    if (depth > 3.4 && depth < 10.35 && offset < 2.95) {
      // Keep the visitor outside the central furniture footprint.
      const furnitureX = 7.8;
      return !(Math.abs(depth - furnitureX) < 1.5 && Math.abs(point.z - (room.z - .7)) < 1.15);
    }
    return false;
  });
}
