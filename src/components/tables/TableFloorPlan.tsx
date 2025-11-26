import { useState, useRef } from 'react';
import { TableCard } from './TableCard';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position_x: number | null;
  position_y: number | null;
}

interface TableFloorPlanProps {
  tables: Table[];
  onStatusChange: (tableId: string, status: Table['status']) => void;
  onPositionChange: (tableId: string, x: number, y: number) => void;
}

export const TableFloorPlan = ({ tables, onStatusChange, onPositionChange }: TableFloorPlanProps) => {
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const floorPlanRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (tableId: string) => {
    setDraggedTable(tableId);
  };

  const handleDragEnd = (e: React.DragEvent, tableId: string) => {
    if (!floorPlanRef.current) return;

    const rect = floorPlanRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ensure position is within bounds
    const maxX = rect.width - 120; // table width
    const maxY = rect.height - 120; // table height
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    onPositionChange(tableId, boundedX, boundedY);
    setDraggedTable(null);
  };

  // Auto-arrange tables that don't have positions
  const getTablePosition = (table: Table, index: number) => {
    if (table.position_x !== null && table.position_y !== null) {
      return { x: table.position_x, y: table.position_y };
    }

    // Auto-arrange in grid
    const cols = 4;
    const spacing = 150;
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      x: col * spacing + 50,
      y: row * spacing + 50,
    };
  };

  const statusColors = {
    available: 'text-green-600 bg-green-50 border-green-200',
    occupied: 'text-red-600 bg-red-50 border-red-200',
    reserved: 'text-amber-600 bg-amber-50 border-amber-200',
    cleaning: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Available ({tables.filter(t => t.status === 'available').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Occupied ({tables.filter(t => t.status === 'occupied').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm">Reserved ({tables.filter(t => t.status === 'reserved').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm">Cleaning ({tables.filter(t => t.status === 'cleaning').length})</span>
        </div>
      </div>

      <div
        ref={floorPlanRef}
        className="relative bg-muted/30 border-2 border-dashed border-border rounded-lg"
        style={{ minHeight: '600px' }}
      >
        {tables.map((table, index) => {
          const position = getTablePosition(table, index);
          return (
            <div
              key={table.id}
              style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: 'move',
              }}
              draggable
              onDragStart={() => handleDragStart(table.id)}
              onDragEnd={(e) => handleDragEnd(e, table.id)}
            >
              <TableCard
                table={table}
                onStatusChange={onStatusChange}
              />
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No tables added yet</p>
              <p className="text-sm">Click "Add Table" to create your first table</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
