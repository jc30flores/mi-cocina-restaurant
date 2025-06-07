
import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "small" | "medium" | "large";
  className?: string;
}

function getGridColumns(cols: number) {
  switch (cols) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-2";
    case 3: return "grid-cols-3";
    case 4: return "grid-cols-4";
    case 5: return "grid-cols-5";
    case 6: return "grid-cols-6";
    default: return "grid-cols-1";
  }
}

function getGridGap(gap: "none" | "small" | "medium" | "large") {
  switch (gap) {
    case "none": return "gap-0";
    case "small": return "gap-2 sm:gap-3";
    case "medium": return "gap-3 sm:gap-4 md:gap-5";
    case "large": return "gap-4 sm:gap-6 md:gap-8";
    default: return "gap-4";
  }
}

export function ResponsiveGrid({
  children,
  columns = { default: 1 },
  gap = "medium",
  className
}: ResponsiveGridProps) {
  const { default: defaultCols, sm, md, lg, xl } = columns;
  
  const gridClasses = cn(
    "grid w-full",
    getGridColumns(defaultCols),
    sm && `sm:${getGridColumns(sm)}`,
    md && `md:${getGridColumns(md)}`,
    lg && `lg:${getGridColumns(lg)}`,
    xl && `xl:${getGridColumns(xl)}`,
    getGridGap(gap),
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

export interface FlexContainerProps {
  children: React.ReactNode;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: boolean;
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  gap?: "none" | "small" | "medium" | "large";
  className?: string;
  responsive?: boolean;
  fullWidth?: boolean;
}

function getFlexDirection(direction: string) {
  switch (direction) {
    case "row": return "flex-row";
    case "column": return "flex-col";
    case "row-reverse": return "flex-row-reverse";
    case "column-reverse": return "flex-col-reverse";
    default: return "flex-row";
  }
}

function getJustify(justify: string) {
  switch (justify) {
    case "start": return "justify-start";
    case "end": return "justify-end";
    case "center": return "justify-center";
    case "between": return "justify-between";
    case "around": return "justify-around";
    case "evenly": return "justify-evenly";
    default: return "justify-start";
  }
}

function getAlign(align: string) {
  switch (align) {
    case "start": return "items-start";
    case "end": return "items-end";
    case "center": return "items-center";
    case "baseline": return "items-baseline";
    case "stretch": return "items-stretch";
    default: return "items-start";
  }
}

function getGap(gap: "none" | "small" | "medium" | "large") {
  switch (gap) {
    case "none": return "gap-0";
    case "small": return "gap-2 sm:gap-3";
    case "medium": return "gap-3 sm:gap-4 md:gap-5";
    case "large": return "gap-4 sm:gap-6 md:gap-8";
    default: return "gap-4";
  }
}

export function FlexContainer({
  children,
  direction = "row",
  wrap = false,
  justify = "start",
  align = "start",
  gap = "medium",
  responsive = false,
  fullWidth = false,
  className
}: FlexContainerProps) {
  const flexClasses = cn(
    "flex",
    fullWidth && "w-full",
    responsive ? "flex-col sm:flex-row" : getFlexDirection(direction),
    wrap ? "flex-wrap" : "",
    getJustify(justify),
    getAlign(align),
    getGap(gap),
    className
  );

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}
