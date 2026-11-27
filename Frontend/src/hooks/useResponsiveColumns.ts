import { useEffect, useState } from "react";

function getColumnCount(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

/**
 * Tracks Tailwind's responsive 1 / 2 / 3-column grid breakpoints
 * (<640px = 1, sm >=640px = 2, lg >=1024px = 3).
 */
export function useResponsiveColumns(): number {
  const [columns, setColumns] = useState<number>(getColumnCount);

  useEffect(() => {
    const handleResize = () => setColumns(getColumnCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}

export function chunkIntoRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
}
