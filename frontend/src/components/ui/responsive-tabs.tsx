
import React from "react";
import { cn } from "@/lib/utils";

interface TabProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function TabsContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto scrollbar-none py-1 -mx-2 px-2", className)}>
      {children}
    </div>
  );
}

export function Tab({ 
  children, 
  className, 
  onClick, 
  isActive = false 
}: TabProps) {
  return (
    <button
      className={cn(
        "tab-button px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap", 
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: {
    id: string;
    label: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  spacing?: "none" | "small" | "normal" | "tight";
  fullWidth?: boolean;
}

export function TabsList({
  tabs,
  activeTab,
  onTabChange,
  spacing = "normal",
  fullWidth = false,
  className,
  ...props
}: TabsListProps) {
  const getSpacing = () => {
    switch (spacing) {
      case "none": return "gap-0";
      case "small": return "gap-1";
      case "tight": return "gap-1";
      case "normal":
      default: return "gap-2";
    }
  };

  return (
    <div 
      className={cn(
        "overflow-x-auto scrollbar-none py-1 -mx-2 px-2", 
        className
      )} 
      {...props}
    >
      <div className={cn(
        "flex", 
        getSpacing(), 
        fullWidth ? "w-full" : "w-max"
      )}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={fullWidth ? "flex-1 text-center" : ""}
          >
            {tab.label}
          </Tab>
        ))}
      </div>
    </div>
  );
}
