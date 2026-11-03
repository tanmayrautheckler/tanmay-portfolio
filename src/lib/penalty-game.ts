export type ShotOutcome = "goal" | "saved" | "over";
export function resolveShot(aim: number, keeper: number, power: number): ShotOutcome {
  if (power > 90) return "over";
  if (power < 35) return "saved";
  const reach = power < 55 ? 36 : 21;
  return Math.abs(aim - keeper) <= reach ? "saved" : "goal";
}
export function shotFeedback(outcome: ShotOutcome, power: number) {
  if (outcome === "goal") return "Goal. You found the space.";
  if (outcome === "over") return "Over the bar. Ease off the power.";
  return power < 35 ? "Too soft. The keeper had time to recover." : "Saved. Try the other side of the keeper.";
}
