import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export const CreateOrderDialog = () => {
  const [open, setOpen] = useState(false);
  const [tableId, setTableId] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tables } = useQuery({
    queryKey: ['available-tables'],
    queryFn: async () => {
      const { data } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');
      return data || [];
    }
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('is_available', true)
        .order('name');
      return data || [];
    }
  });

  const createOrder = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.05; // 5% GST
      const serviceCharge = subtotal * 0.05; // 5% service
      const total = subtotal + tax + serviceCharge;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId || null,
          staff_id: user?.id,
          order_type: tableId ? 'dine-in' : 'takeaway',
          notes,
          subtotal,
          tax,
          service_charge: serviceCharge,
          total,
          status: 'pending',
          order_number: `ORD-${Date.now()}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Update table status if dine-in
      if (tableId) {
        await supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', tableId);
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['available-tables'] });
      toast({ title: 'Order created successfully!' });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating order', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setTableId('');
    setOrderItems([]);
    setNotes('');
  };

  const addItem = (menuItem: any) => {
    const existing = orderItems.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (menuItemId: string) => {
    setOrderItems(orderItems.filter(i => i.menuItemId !== menuItemId));
  };

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Menu Items */}
          <div className="space-y-4">
            <Label>Menu Items</Label>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {menuItems?.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => addItem(item)}
                >
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.menu_categories?.name}
                      </p>
                    </div>
                    <Badge variant="secondary">₹{item.price}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div>
              <Label>Table (Optional for Takeaway)</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select table or leave empty for takeaway" />
                </SelectTrigger>
                <SelectContent>
                  {tables?.filter(t => t.status === 'available').map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.table_number} (Capacity: {table.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order Items</Label>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                  <p>Click menu items to add them</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>GST (5%)</span>
                <span>₹{(total * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service (5%)</span>
                <span>₹{(total * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{(total * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => createOrder.mutate()}
              disabled={orderItems.length === 0 || createOrder.isPending}
            >
              {createOrder.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;