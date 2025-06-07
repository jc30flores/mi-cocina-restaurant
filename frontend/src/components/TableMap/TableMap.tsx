import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableShape } from "./TableShapes";

// Default map dimensions
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;

export interface TableData {
  id: string;
  number: string;
  status: string;
  shape?: "round" | "square";
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  // Rotation in degrees
  rotation?: number;
  // Custom color for table (hex code)
  color?: string;
  // Link group identifier if table is linked
  group_id?: string;
}

// Generic map element for additional shapes/text
export interface ElementData {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'line';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation?: number;
  content?: string;
  // Color of the element (e.g., '#ff0000')
  color?: string;
}

export interface TableMapProps {
  tables: TableData[];
  elements?: ElementData[];
  isEditMode?: boolean;
  // Move handlers
  onTableMove: (id: string, x: number, y: number) => void;
  onElementMove?: (id: string, x: number, y: number) => void;
  // Rotate handlers (optional)
  onTableRotate?: (id: string, delta: number) => void;
  onElementRotate?: (id: string, delta: number) => void;
  // Selection handlers for showing rotate controls
  onTableSelect?: (id: string, tableNumber: string) => void;
  onElementSelect?: (id: string) => void;
  // Currently selected IDs
  selectedTableId?: string;
  selectedElementId?: string;
  // Optional text color override for table numbers
  textColor?: string;
  // Context menu actions
  onMergeTables?: (tableNumber: string) => void;
  onMergeOrders?: (tableNumber: string) => void;
  onMoveOrderTable?: (tableNumber: string) => void;
  onLinkTables?: (tableNumber: string) => void;
  onUnlinkTable?: (tableNumber: string, groupId: string) => void;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables = [],
  elements = [],
  isEditMode = false,
  onTableMove,
  onElementMove,
  onTableRotate,
  onElementRotate,
  onTableSelect,
  onElementSelect,
  selectedTableId,
  selectedElementId,
  onMergeTables,
  onMergeOrders,
  onMoveOrderTable,
  onLinkTables,
  onUnlinkTable,
}) => {
  // Initial zoom: reduce one zoom step for both views
  // Edit mode: start one step zoomed out; POS view: also one step zoomed out
  const [scale, setScale] = useState(
    isEditMode ? Math.pow(1.3, -0.5) : Math.pow(1.1, 0)
  );
  // minimum scale allowed when zooming out; updated based on screen size
  const minScaleRef = useRef(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // Ref to transformed content for bounds
  const contentRef = useRef<HTMLDivElement>(null);
  // Store starting positions by table id on drag start
  const dragStartRef = useRef<Record<string, { x: number; y: number }>>({});
  const [contextMenu, setContextMenu] = useState<
    { id: string; number: string; groupId?: string; x: number; y: number } | null
  >(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tableRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fit map to small screens on mount and resize
  useEffect(() => {
    const fitMap = () => {
      const container = mapRef.current;
      if (!container) return;
      if (window.innerWidth <= 1024) {
        const scaleW = container.clientWidth / MAP_WIDTH;
        const scaleH = container.clientHeight / MAP_HEIGHT;
        const baseScale = Math.min(scaleW, scaleH, 1);
        const zoomedScale = Math.min(baseScale * 1.3, 2);
        setScale(zoomedScale);
        // allow zooming out to the fitted scale if needed
        minScaleRef.current = baseScale;
      } else {
        // allow zooming out further on larger screens
        minScaleRef.current = 0.5;
      }
    };
    fitMap();
    window.addEventListener("resize", fitMap);
    return () => window.removeEventListener("resize", fitMap);
  }, []);

  const startLongPress = (
    e: React.TouchEvent | React.PointerEvent,
    tableId: string,
    tableNumber: string,
    groupId?: string
  ) => {
    if (isEditMode) return;
    const rect = mapRef.current?.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;
    const x = clientX - (rect?.left || 0);
    const y = clientY - (rect?.top || 0);
    longPressRef.current = setTimeout(() => {
      setContextMenu({ id: tableId, number: tableNumber, groupId, x, y });
    }, 3000);
  };
  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  // Close context menu on outside interaction
  useEffect(() => {
    if (!contextMenu) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const menuEl = menuRef.current;
      const tableEl = tableRefs.current[contextMenu.id];
      if (menuEl && menuEl.contains(e.target as Node)) return;
      if (tableEl && tableEl.contains(e.target as Node)) return;
      clearLongPress();
      setContextMenu(null);
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [contextMenu]);

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const handleZoomOut = () =>
    setScale((s) => Math.max(s / 1.2, minScaleRef.current));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode && e.target === mapRef.current) setIsPanning(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };
  const handleMouseUp = () => setIsPanning(false);

  return (
    <div
      ref={mapRef}
      className={`relative flex-1 border rounded bg-gray-50 dark:bg-gray-800 overflow-x-auto sm:overflow-hidden ${isEditMode ? "" : "cursor-grab active:cursor-grabbing"}`}
      style={{ height: "100%", width: "100%" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-popover text-popover-foreground border rounded-md shadow-lg divide-y"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            className="px-3 py-2 text-sm hover:bg-muted w-full text-left rounded-t-md"
            onClick={() => {
              clearLongPress();
              setContextMenu(null);
              onMergeTables?.(contextMenu.number);
            }}
          >
            Merge Tables
          </button>
          <button
            className="px-3 py-2 text-sm hover:bg-muted w-full text-left"
            onClick={() => {
              clearLongPress();
              setContextMenu(null);
              onLinkTables?.(contextMenu.number);
            }}
          >
            Link Table
          </button>
          {contextMenu.groupId && (
            <button
              className="px-3 py-2 text-sm hover:bg-muted w-full text-left"
              onClick={() => {
                clearLongPress();
                setContextMenu(null);
                if (contextMenu.groupId) {
                  onUnlinkTable?.(contextMenu.number, contextMenu.groupId);
                }
              }}
            >
              Unlink Table
            </button>
          )}
          <button
            className="px-3 py-2 text-sm hover:bg-muted w-full text-left"
            onClick={() => {
              clearLongPress();
              setContextMenu(null);
              onMergeOrders?.(contextMenu.number);
            }}
          >
            Merge Orders
          </button>
          <button
            className="px-3 py-2 text-sm hover:bg-muted w-full text-left rounded-b-md"
            onClick={() => {
              clearLongPress();
              setContextMenu(null);
              onMoveOrderTable?.(contextMenu.number);
            }}
          >
            Change Order Table
          </button>
        </div>
      )}

      {/* Tables layer */}
      <div
        ref={contentRef}
        className="absolute"
        style={{
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "0 0",
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
        }}
      >
        {/* Render additional map elements */}
        {elements.map((el, idx) => (
          <div key={el.id} className="relative">
            <motion.div
              key={el.id}
              className="absolute cursor-pointer"
              style={{
            left: el.position_x,
            top: el.position_y,
            width: el.width,
            height: el.height,
            // Apply rotation if specified
            transform: `rotate(${el.rotation || 0}deg)`
          }}
            drag={isEditMode}
            dragSnapToOrigin={false}
              dragMomentum={false}
              onClick={() => {
                // Select element when in edit mode
                if (isEditMode && onElementSelect) {
                  onElementSelect(el.id);
                }
              }}
              // Disable double-click for now
              onDragStart={() => {
              // record element's original position for smooth dragging
              dragStartRef.current[el.id] = { x: el.position_x, y: el.position_y };
            }}
            onDragEnd={(_e, info) => {
              const start = dragStartRef.current[el.id];
              if (!start || !onElementMove) return;
              // calculate new position based on drag offset and scale
              const newX = start.x + info.offset.x / scale;
              const newY = start.y + info.offset.y / scale;
              onElementMove(el.id, newX, newY);
              // cleanup
              delete dragStartRef.current[el.id];
            }}
          >
            {/* Element shapes */}
            {el.type === 'rect' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: el.color ? `${el.color}33` : 'rgba(0,0,255,0.2)',
                  border: `1px solid ${el.color || 'blue'}`
                }}
              />
            )}
            {el.type === 'circle' && (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: el.color ? `${el.color}33` : 'rgba(0,255,0,0.2)', border: `1px solid ${el.color || 'green'}` }} />
            )}
            {/* Line element */}
            {el.type === 'line' && (
              <div
                style={{
                  // Draw vertical line if height > width, else horizontal
                  width: el.width < el.height ? '2px' : '100%',
                  height: el.width < el.height ? '100%' : '2px',
                  background: el.color || '#000',
                }}
              />
            )}
            {el.type === 'text' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: el.fontSize ? `${el.fontSize}px` : '16px',
                  fontStyle: el.fontStyle || 'normal',
                  textDecoration: el.underline ? 'underline' : 'none',
                  color: el.color || '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {el.content || ''}
              </div>
            )}
            {/* Rotate controls for custom rectangle elements */}
            </motion.div>
            {/* Static rotation controls for elements */}
            {isEditMode && selectedElementId === el.id && onElementRotate && (
              <div
                className="absolute flex items-center space-x-1 z-20"
                style={{
                  left: el.position_x + el.width / 2,
                  top: el.position_y - 20,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <button
                  className="p-1 bg-white dark:bg-gray-800 rounded shadow"
                  onClick={() => onElementRotate(el.id, -15)}
                >
                  <RotateCcw size={16} />
                </button>
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded shadow">
                  {idx + 1}
                </div>
                <button
                  className="p-1 bg-white dark:bg-gray-800 rounded shadow"
                  onClick={() => onElementRotate(el.id, 15)}
                >
                  <RotateCw size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
        {/* Render tables */}
{tables.map((table) => (
          <div key={table.id} className="relative">
            <motion.div
              ref={(el) => {
                tableRefs.current[table.id] = el;
              }}
              className="absolute cursor-pointer"
              style={{
                left: table.position_x,
                top: table.position_y,
                width: table.width,
                height: table.height,
                rotate: table.rotation || 0,
                transformOrigin: "center center",
              }}
            onClick={() => {
                if (onTableSelect) {
                  onTableSelect(table.id, table.number);
                }
              }}
              onTouchStart={(e) => startLongPress(e, table.id, table.number, (table as any).group_id)}
              onTouchEnd={clearLongPress}
              onTouchCancel={clearLongPress}
              onContextMenu={(e) => {
                e.preventDefault();
                const rect = mapRef.current?.getBoundingClientRect();
                const x = e.clientX - (rect?.left || 0);
                const y = e.clientY - (rect?.top || 0);
                setContextMenu({ id: table.id, number: table.number, groupId: (table as any).group_id, x, y });
              }}
              drag={isEditMode}
              dragSnapToOrigin={false}
              dragMomentum={false}
              onDragStart={() => {
                dragStartRef.current[table.id] = { x: table.position_x, y: table.position_y };
              }}
              onDragEnd={(_e, info) => {
                const start = dragStartRef.current[table.id];
                if (!start) return;
                const dx = info.offset.x / scale;
                const dy = info.offset.y / scale;
                const newX = start.x + dx;
                const newY = start.y + dy;
                onTableMove(table.id, newX, newY);
                delete dragStartRef.current[table.id];
              }}
            >
              <TableShape
                status={table.status}
                width={table.width}
                height={table.height}
                tableNumber={table.number}
                shape={table.shape}
                color={table.color}
                textColor={table.textColor}
                highlight={(table as any).highlight}
                sourceHighlight={(table as any).sourceHighlight}
                linked={Boolean((table as any).group_id)}
              />
            </motion.div>

            {isEditMode && selectedTableId === table.id && onTableRotate && (
              <div
                className="absolute flex space-x-1 z-20"
                style={{
                  left: table.position_x + table.width / 2,
                  top: table.position_y - 20,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <button
                  className="p-1 bg-white dark:bg-gray-800 rounded shadow"
                  onClick={() => onTableRotate(table.id, -15)}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="p-1 bg-white dark:bg-gray-800 rounded shadow"
                  onClick={() => onTableRotate(table.id, 15)}
                >
                  <RotateCw size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};