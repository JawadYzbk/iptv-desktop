import { useMemo } from "react";
import { Breakpont, useBreakpoint } from "./use-breakpoint";

type GridCol = 2 | 3 | 4 | 5;

export type GridConfig = {
  [K in Breakpont]: GridCol;
};

type Result<T> = {
  className: string;
  items: T[][];
};

export const useGrid = <T>(items: T[], config: GridConfig): Result<T> => {
  const { breakpoint } = useBreakpoint();

  const result = useMemo(() => {
    const cols = config[breakpoint];
    const totalRow = Math.ceil(items.length / cols);
    let rows: T[][] = [];
    for (let i = 0; i < totalRow; i++) {
      const offset = i * cols;
      const item = items.slice(offset, offset + cols);

      rows.push(item);
    }
    let className: string;
    switch (cols) {
      case 2:
        className = "grid-cols-2";
        break;

      case 3:
        className = "grid-cols-3";
        break;

      case 4:
        className = "grid-cols-4";
        break;

      case 5:
        className = "grid-cols-5";
        break;
    }

    return {
      className,
      items: rows,
    };
  }, [items, breakpoint, config]);

  return result;
};
