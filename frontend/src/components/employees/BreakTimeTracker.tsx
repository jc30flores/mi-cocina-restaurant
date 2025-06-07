
import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BreakTimeTrackerProps {
  employeeId: string;
  status: "active" | "off" | "break";
  breakStart: string | null;
  breakEnd: string | null;
  onStartBreak: (employeeId: string) => void;
  onEndBreak: (employeeId: string) => void;
}

const BreakTimeTracker = ({
  employeeId,
  status,
  breakStart,
  breakEnd,
  onStartBreak,
  onEndBreak,
}: BreakTimeTrackerProps) => {
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "--:--";
    return format(new Date(timeString), "HH:mm");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col text-xs mr-2">
        <span>Start: {formatTime(breakStart)}</span>
        <span>End: {formatTime(breakEnd)}</span>
      </div>

      {status === "active" ? (
        <Button 
          size="sm" 
          onClick={() => onStartBreak(employeeId)}
          variant="outline"
        >
          Start Break
        </Button>
      ) : status === "break" ? (
        <Button 
          size="sm" 
          onClick={() => onEndBreak(employeeId)}
        >
          End Break
        </Button>
      ) : (
        <Badge variant="outline" className="bg-gray-200 text-gray-700">Off Shift</Badge>
      )}
    </div>
  );
};

export default BreakTimeTracker;
