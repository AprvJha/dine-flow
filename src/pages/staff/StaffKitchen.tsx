import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const StaffKitchen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            special_instructions,
            menu_items (name)
          ),
          restaurant_tables (table_number)
        `)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast({ title: 'Order status updated' });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
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
                <ChefHat className="w-5 h-5" />
                Kitchen Queue
              </CardTitle>
              <CardDescription>Orders waiting to be prepared</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-2">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <Badge className={getStatusColor(order.status || 'pending')}>
                            {order.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Table {order.restaurant_tables?.table_number} • {format(new Date(order.created_at), 'HH:mm')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.menu_items?.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'preparing' })}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'ready' })}
                            >
                              Mark Ready
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders in queue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default StaffKitchen;
