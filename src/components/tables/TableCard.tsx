import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position_x: number | null;
  position_y: number | null;
}

interface TableCardProps {
  table: Table;
  onStatusChange: (tableId: string, status: Table['status']) => void;
}

export const TableCard = ({ table, onStatusChange }: TableCardProps) => {
  const statusConfig = {
    available: {
      bg: 'bg-green-500',
      text: 'text-green-700',
      label: 'Available',
    },
    occupied: {
      bg: 'bg-red-500',
      text: 'text-red-700',
      label: 'Occupied',
    },
    reserved: {
      bg: 'bg-amber-500',
      text: 'text-amber-700',
      label: 'Reserved',
    },
    cleaning: {
      bg: 'bg-blue-500',
      text: 'text-blue-700',
      label: 'Cleaning',
    },
  };

  const config = statusConfig[table.status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Card className={`w-28 h-28 cursor-pointer hover:shadow-lg transition-all border-2 ${config.bg}/10 border-${config.bg.split('-')[1]}-300`}>
          <div className="h-full flex flex-col items-center justify-center p-2">
            <div className={`w-3 h-3 rounded-full ${config.bg} mb-2`}></div>
            <div className="text-lg font-bold text-foreground">{table.table_number}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Users className="h-3 w-3" />
              <span>{table.capacity}</span>
            </div>
            <div className={`text-xs ${config.text} mt-1 font-medium`}>
              {config.label}
            </div>
          </div>
        </Card>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onStatusChange(table.id, 'available')}>
          Mark as Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(table.id, 'occupied')}>
          Mark as Occupied
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(table.id, 'reserved')}>
          Mark as Reserved
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange(table.id, 'cleaning')}>
          Mark as Cleaning
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
