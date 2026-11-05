export type JournalTurn = {
  id: number;
  from: number;
  to: number;
  manual?: boolean;
  progress?: number;
  cancelled?: boolean;
};
export type JournalDirection = 'next' | 'previous';
