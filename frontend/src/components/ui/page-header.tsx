
import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  children,
  className,
  compact = false
}: PageHeaderProps) {
  return (
    <div className={cn(
      "w-full", 
      compact ? "mb-3 sm:mb-4" : "mb-5 sm:mb-6", 
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className={cn(
            "font-bold tracking-tight", 
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          )}>
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 flex flex-wrap gap-2 justify-start sm:justify-end">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function PageSection({
  title,
  description,
  children,
  className,
  actions,
  compact = false
}: PageSectionProps) {
  return (
    <section className={cn(
      "w-full", 
      compact ? "mb-3 sm:mb-4" : "mb-5 sm:mb-6", 
      className
    )}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className={cn(
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl", 
                "font-semibold"
              )}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
