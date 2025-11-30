import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { TableFloorPlan } from '@/components/tables/TableFloorPlan';
import { AddTableDialog } from '@/components/tables/AddTableDialog';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position_x: number | null;
  position_y: number | null;
}

const TableManagement = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading tables',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Set up realtime subscription
    const channel = supabase
      .channel('restaurant_tables_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables',
        },
        () => {
          fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: Table['status']) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status: newStatus })
        .eq('id', tableId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: 'Table status has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePositionChange = async (tableId: string, x: number, y: number) => {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ position_x: x, position_y: y })
        .eq('id', tableId);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error updating position',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
            <p className="text-muted-foreground mt-1">Manage restaurant floor plan and table status</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchTables} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <TableFloorPlan
            tables={tables}
            onStatusChange={handleStatusChange}
            onPositionChange={handlePositionChange}
          />
        </Card>

        <AddTableDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={fetchTables}
        />
      </div>
    </div>
  );
};

export default TableManagement;
