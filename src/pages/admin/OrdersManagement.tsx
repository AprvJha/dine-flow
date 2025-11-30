import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const OrdersManagement = () => {
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, menu_items(name)),
          restaurant_tables(table_number)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'served': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_number}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status || 'pending')}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Table: {order.restaurant_tables?.table_number || 'Takeaway'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4 text-sm">
                  {order.order_items?.slice(0, 3).map((item: any) => (
                    <p key={item.id}>{item.quantity}x {item.menu_items?.name}</p>
                  ))}
                  {order.order_items && order.order_items.length > 3 && (
                    <p className="text-muted-foreground">
                      +{order.order_items.length - 3} more items
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleString('en-IN')}
                  </span>
                  <span className="font-bold">₹{order.total || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!orders || orders.length === 0) && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
