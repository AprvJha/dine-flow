import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  Calendar, 
  Receipt,
  ChefHat,
  TrendingUp,
  LogOut,
  CreditCard,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const { data: todayOrders } = useQuery({
    queryKey: ['today-orders-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);
      return count || 0;
    }
  });

  const { data: tablesData } = useQuery({
    queryKey: ['tables-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('restaurant_tables').select('status');
      const total = data?.length || 0;
      const occupied = data?.filter(t => t.status === 'occupied').length || 0;
      return { total, occupied };
    }
  });

  const { data: todayReservations } = useQuery({
    queryKey: ['today-reservations-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', today);
      return count || 0;
    }
  });

  const { data: todayRevenue } = useQuery({
    queryKey: ['today-revenue'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', today)
        .in('status', ['served', 'ready']);
      return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    }
  });

  const stats = [
    { title: 'Today\'s Orders', value: String(todayOrders || 0), icon: Receipt, color: 'bg-amber-500' },
    { title: 'Active Tables', value: `${tablesData?.occupied || 0}/${tablesData?.total || 0}`, icon: LayoutDashboard, color: 'bg-emerald-500' },
    { title: 'Reservations', value: String(todayReservations || 0), icon: Calendar, color: 'bg-blue-500' },
    { title: 'Revenue', value: `₹${todayRevenue?.toLocaleString('en-IN') || 0}`, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const quickActions = [
    { title: 'Menu Management', icon: UtensilsCrossed, path: '/admin/menu', desc: 'Manage items & categories' },
    { title: 'Table Management', icon: LayoutDashboard, path: '/admin/tables', desc: 'Floor plan & status' },
    { title: 'Staff Management', icon: Users, path: '/admin/staff', desc: 'Manage employees' },
    { title: 'Kitchen Display', icon: ChefHat, path: '/admin/kitchen', desc: 'Monitor kitchen queue' },
    { title: 'Orders', icon: Receipt, path: '/admin/orders', desc: 'View & create orders' },
    { title: 'Reservations', icon: Calendar, path: '/admin/reservations', desc: 'Manage bookings' },
    { title: 'Billing', icon: CreditCard, path: '/admin/billing', desc: 'Payments & invoices' },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-secondary-foreground/5 border-b border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-foreground">The Golden Ladle</h1>
              <Badge variant="outline" className="mt-1 border-primary text-primary">Admin Panel</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')} className="text-secondary-foreground hover:bg-secondary-foreground/10">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-secondary-foreground/5 border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-foreground/60">{stat.title}</p>
                    <p className="text-3xl font-bold text-secondary-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-secondary-foreground/5 border-secondary-foreground/10">
          <CardHeader>
            <CardTitle className="text-secondary-foreground">Management Console</CardTitle>
            <CardDescription className="text-secondary-foreground/60">Access restaurant operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card 
                  key={action.title}
                  className="bg-secondary-foreground/5 border-secondary-foreground/10 cursor-pointer hover:bg-primary/20 hover:border-primary/50 transition-all group"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <action.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-foreground">{action.title}</p>
                      <p className="text-xs text-secondary-foreground/50">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;