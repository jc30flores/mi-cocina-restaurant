
import React from "react";
import { Users } from "lucide-react";


interface TableShapeProps {
  status: string;
  width: number;
  height: number;
  tableNumber: string;
  // Table type: 'round' or 'square'
  shape?: 'round' | 'square';
  // Custom color for table (hex code)
  color?: string;
  // Optional override for text color (hex code)
  textColor?: string;
  // Highlight ring when in special modes
  highlight?: boolean;
  // Distinct highlight for the source table when merging orders
  sourceHighlight?: boolean;
  // Whether this table is linked to others
  linked?: boolean;
}

// Color mapping based on table status
const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-500";
    case "occupied":
      return "bg-red-100 border-red-500";
    case "pending":
      return "bg-yellow-100 border-yellow-500";
    case "reserved":
      return "bg-blue-100 border-blue-500";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

// Determine readable text color (black or white) based on background brightness
const getTextColorFromBg = (hex: string): string => {
  const cleanHex = hex.replace(/^#/, '').slice(0, 6);
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.7 ? '#000000' : '#FFFFFF';
};
// Round table with chairs arranged in a circle
export const RoundTable: React.FC<TableShapeProps> = ({
  capacity,
  status,
  width,
  height,
  tableNumber,
  color,
  textColor,
  highlight,
  sourceHighlight,
  linked
}) => {
  const statusColor = getStatusColor(status);
  // Determine table size (circle)
  const tableDiameter = Math.min(width, height) * 0.8;
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {linked && (
        <div className="absolute top-1 right-1 text-xs">🔗</div>
      )}
      <div
        className={`rounded-full border-2 flex flex-col items-center justify-center z-10 ${!color ? statusColor : ''} ${highlight ? 'ring-2 ring-blue-400' : ''} ${sourceHighlight ? 'ring-2 ring-blue-600' : ''}`}
        style={{
          width: `${tableDiameter}px`,
          height: `${tableDiameter}px`,
          ...(color
            ? { backgroundColor: color, borderColor: color }
            : {}),
          // Brighten non-available tables
          filter: status !== 'available' ? 'brightness(1.2)' : undefined,
        }}
      >
      <span
        className="font-bold text-sm sm:text-lg"
        style={
          textColor
            ? { color: textColor }
            : color
            ? { color: getTextColorFromBg(color) }
            : undefined
        }
      >
        {tableNumber}
      </span>
      </div>
    </div>
  );
};

// Rectangular table with chairs on sides
export const RectangleTable: React.FC<TableShapeProps> = ({
  capacity,
  status,
  width,
  height,
  tableNumber,
  color,
  textColor,
  highlight,
  sourceHighlight,
  linked
}) => {
  const statusColor = getStatusColor(status);
  // Table dimensions
  const tableWidth = width * 0.8;
  const tableHeight = height * 0.6;
  // Determine chair size (between 12px and 24px)
  let chairSize = Math.min(tableWidth, tableHeight) * 0.15;
  chairSize = Math.max(12, Math.min(chairSize, 24));
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {linked && (
        <div className="absolute top-1 right-1 text-xs">🔗</div>
      )}
      <div
        className={`border-2 flex flex-col items-center justify-center z-10 ${!color ? statusColor : ''} ${highlight ? 'ring-2 ring-blue-400' : ''} ${sourceHighlight ? 'ring-2 ring-blue-600' : ''}`}
        style={{
          width: `${tableWidth}px`,
          height: `${tableHeight}px`,
          borderRadius: '8px',
          ...(color
            ? { backgroundColor: color, borderColor: color }
            : {}),
          // Brighten non-available tables
          filter: status !== 'available' ? 'brightness(1.2)' : undefined,
        }}
      >
        <span
          className="font-bold text-sm sm:text-lg"
          style={
            textColor
              ? { color: textColor }
              : color
              ? { color: getTextColorFromBg(color) }
              : undefined
          }
        >
          {tableNumber}
        </span>
      </div>
    </div>
  );
};

// Determine which table shape to use based on capacity
export const TableShape: React.FC<TableShapeProps> = (props) => {
  if (props.shape === 'round') {
    return <RoundTable {...props} />;
  }
  // Default to square/rectangular shape
  return <RectangleTable {...props} />;
};
