import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const KitchenDisplay = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: orders, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, menu_items(name, prep_time_minutes)),
          restaurant_tables(table_number)
        `)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready') => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Order marked as ${status}` });
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeSinceOrder = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return minutes;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Kitchen Display System
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders?.map((order) => {
            const timeSince = getTimeSinceOrder(order.created_at);
            const isDelayed = timeSince > 15;

            return (
              <Card 
                key={order.id} 
                className={`border-2 ${isDelayed ? 'border-red-500 animate-pulse' : 'border-border'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.order_number}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status || 'pending')}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Table: {order.restaurant_tables?.table_number || 'Takeaway'}</span>
                    <span className={`flex items-center gap-1 ${isDelayed ? 'text-red-500 font-bold' : ''}`}>
                      <Clock className="h-4 w-4" />
                      {timeSince} min
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.menu_items?.name}</span>
                        {item.special_instructions && (
                          <span className="text-orange-500 text-xs">
                            Note: {item.special_instructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <p className="text-sm text-orange-500 mb-4">📝 {order.notes}</p>
                  )}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button 
                        className="flex-1" 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700" 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!orders || orders.length === 0) && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending orders</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
