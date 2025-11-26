import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  Calendar, 
  Receipt,
  ChefHat,
  TrendingUp,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const stats = [
    { title: 'Today\'s Orders', value: '24', icon: Receipt, color: 'text-primary' },
    { title: 'Active Tables', value: '8/15', icon: LayoutDashboard, color: 'text-success' },
    { title: 'Reservations', value: '12', icon: Calendar, color: 'text-warning' },
    { title: 'Revenue', value: '$1,240', icon: TrendingUp, color: 'text-primary' },
  ];

  const quickActions = [
    { title: 'Menu Management', icon: UtensilsCrossed, path: '/admin/menu' },
    { title: 'Table Management', icon: LayoutDashboard, path: '/admin/tables' },
    { title: 'Staff Management', icon: Users, path: '/admin/staff' },
    { title: 'Kitchen Display', icon: ChefHat, path: '/admin/kitchen' },
    { title: 'Orders', icon: Receipt, path: '/admin/orders' },
    { title: 'Reservations', icon: Calendar, path: '/admin/reservations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        {/* Header */}
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your restaurant</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage restaurant operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  );
};

export default AdminDashboard;
