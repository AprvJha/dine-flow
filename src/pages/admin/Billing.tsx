import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Wallet, QrCode, Banknote, Receipt, CheckCircle, Printer } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

const Billing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [splitCount, setSplitCount] = useState(1);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['billing-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_tables(table_number),
          order_items(
            *,
            menu_items(name)
          )
        `)
        .in('status', ['ready', 'served'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const markAsPaid = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'served' as OrderStatus })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-orders'] });
      toast({
        title: 'Payment Processed',
        description: 'Order has been marked as paid.'
      });
      setShowPaymentDialog(false);
      setSelectedOrder(null);
    }
  });

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'upi', label: 'UPI/QR', icon: QrCode },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const handleProcessPayment = () => {
    if (!paymentMethod) {
      toast({
        title: 'Select Payment Method',
        description: 'Please select a payment method to proceed.',
        variant: 'destructive'
      });
      return;
    }
    markAsPaid.mutate(selectedOrder.id);
  };

  const getSplitAmount = (total: number) => {
    return (total / splitCount).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Billing & Payments</h1>
              <p className="text-sm text-muted-foreground">Process payments for ready orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders ready for billing</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders?.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.order_number}</CardTitle>
                    <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Table: {order.restaurant_tables?.table_number || 'Takeaway'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <span>{item.quantity}x {item.menu_items?.name}</span>
                          <span>₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Charge</span>
                        <span>₹{order.service_charge}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog open={showPaymentDialog && selectedOrder?.id === order.id} onOpenChange={(open) => {
                        setShowPaymentDialog(open);
                        if (open) setSelectedOrder(order);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="flex-1">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Process Payment - {order.order_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {/* Amount */}
                            <div className="text-center p-4 bg-primary/10 rounded-xl">
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-4xl font-bold text-primary">₹{order.total}</p>
                            </div>

                            {/* Split Bill */}
                            <div>
                              <Label>Split Bill</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={splitCount}
                                  onChange={(e) => setSplitCount(parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">ways</span>
                                {splitCount > 1 && (
                                  <Badge variant="secondary" className="ml-auto">
                                    ₹{getSplitAmount(order.total || 0)} each
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                              <Label>Payment Method</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {paymentMethods.map((method) => (
                                  <Button
                                    key={method.id}
                                    variant={paymentMethod === method.id ? 'default' : 'outline'}
                                    className="h-16 flex flex-col items-center justify-center"
                                    onClick={() => setPaymentMethod(method.id)}
                                  >
                                    <method.icon className="w-5 h-5 mb-1" />
                                    {method.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Bill
                              </Button>
                              <Button 
                                className="flex-1" 
                                onClick={handleProcessPayment}
                                disabled={markAsPaid.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {markAsPaid.isPending ? 'Processing...' : 'Confirm Payment'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Billing;