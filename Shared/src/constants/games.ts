export const Results = ["white", "black", "draw"] as const;

export type ResultType = (typeof Results)[number];

export const TimeClasses = [
  "ultraBullet",
  "bullet",
  "blitz",
  "rapid",
  "classical",
  "daily",
  "correspondence",
] as const;

export type TimeClassType = (typeof TimeClasses)[number];

export const MAX_GAMES_PER_USER = 1000;
