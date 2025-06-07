
import React from "react";
import { Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ThemeToggle() {
  const { theme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Moon className="h-5 w-5" />
            <span className="sr-only">Modo oscuro</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Modo oscuro activo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
