import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StaffTables = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useQuery({
    queryKey: ['staff-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'available' | 'occupied' | 'reserved' | 'cleaning' }) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tables'] });
      toast({ title: 'Table status updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  return (
    <AuthGuard allowedRoles={['staff']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/staff')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Table Status
              </CardTitle>
              <CardDescription>View and update table statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables?.map((table) => (
                    <Card key={table.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">Table {table.table_number}</h3>
                          <Badge className={getStatusColor(table.status || 'available')}>
                            {table.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Capacity: {table.capacity} guests
                        </p>
                        <Select
                          value={table.status || 'available'}
                          onValueChange={(value) => updateStatus.mutate({ id: table.id, status: value as 'available' | 'occupied' | 'reserved' | 'cleaning' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default StaffTables;
