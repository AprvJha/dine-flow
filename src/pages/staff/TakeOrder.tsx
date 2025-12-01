import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Plus, Minus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
}

const TakeOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tables } = useQuery({
    queryKey: ['available-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');
      if (error) throw error;
      return data;
    }
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('is_available', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.menu_item_id === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (menu_item_id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.menu_item_id === menu_item_id) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : c;
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (menu_item_id: string) => {
    setCart(cart.filter(c => c.menu_item_id !== menu_item_id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      toast({ title: 'Please select a table', variant: 'destructive' });
      return;
    }
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: selectedTable,
          staff_id: user?.id,
          subtotal: total,
          total: total,
          order_number: `ORD-${Date.now()}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update table status
      await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable);

      toast({ title: 'Order created successfully!' });
      setCart([]);
      setSelectedTable('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Menu Items
                  </CardTitle>
                  <CardDescription>Select items to add to order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {menuItems?.map((item) => (
                      <Card 
                        key={item.id} 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => addToCart(item)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.menu_categories?.name}
                              </p>
                            </div>
                            <Badge variant="secondary">₹{item.price}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Cart
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Table</label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables?.map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            Table {table.table_number} ({table.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Cart is empty</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.menu_item_id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.menu_item_id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.menu_item_id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <>
                      <div className="border-t pt-3 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating Order...' : 'Submit Order'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default TakeOrder;
