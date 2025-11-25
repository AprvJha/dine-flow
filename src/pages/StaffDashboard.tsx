import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, ChefHat, LogOut, ClipboardList } from 'lucide-react';

const StaffDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const quickActions = [
    { title: 'Table Status', icon: LayoutDashboard, path: '/staff/tables', description: 'View and manage tables' },
    { title: 'Take Order', icon: Receipt, path: '/staff/orders', description: 'Create new orders' },
    { title: 'Kitchen Queue', icon: ChefHat, path: '/staff/kitchen', description: 'View order status' },
    { title: 'Active Orders', icon: ClipboardList, path: '/staff/active-orders', description: 'Track current orders' },
  ];

  return (
    <AuthGuard allowedRoles={['staff']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Staff Dashboard</h1>
                <p className="text-sm text-muted-foreground">Restaurant operations</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Staff Operations</CardTitle>
              <CardDescription>Access your work tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Card 
                    key={action.title} 
                    className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                    onClick={() => navigate(action.path)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <action.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription>{action.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default StaffDashboard;
