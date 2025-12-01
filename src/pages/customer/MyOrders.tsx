import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const MyOrders = () => {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            subtotal,
            menu_items (name)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'served': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <AuthGuard allowedRoles={['customer']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/customer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                My Orders
              </CardTitle>
              <CardDescription>Track your order history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{order.order_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'PPp')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status || 'pending')}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          {order.order_items?.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.menu_items?.name} x{item.quantity}</span>
                              <span>₹{item.subtotal}</span>
                            </div>
                          ))}
                          {order.order_items && order.order_items.length > 3 && (
                            <p className="text-muted-foreground">
                              +{order.order_items.length - 3} more items
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button className="mt-4" onClick={() => navigate('/customer/menu')}>
                    Browse Menu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default MyOrders;
