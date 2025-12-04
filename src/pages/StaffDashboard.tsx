import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, ChefHat, LogOut, ClipboardList, Sparkles, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type StaffRole = Database['public']['Enums']['staff_role'];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: staffData } = await supabase
          .from('staff_details')
          .select('staff_role')
          .eq('user_id', user.id)
          .single();
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setStaffRole(staffData?.staff_role || 'waiter');
        setStaffName(profileData?.full_name || user.email?.split('@')[0] || 'Staff');
      }
      setLoading(false);
    };
    fetchStaffRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getRoleConfig = () => {
    switch (staffRole) {
      case 'kitchen':
        return {
          title: 'Kitchen Staff',
          color: 'bg-orange-500',
          bgGradient: 'from-orange-500/20 via-background to-background',
          actions: [
            { title: 'Kitchen Queue', icon: ChefHat, path: '/staff/kitchen', description: 'View orders to prepare', color: 'bg-orange-500' },
            { title: 'Active Orders', icon: ClipboardList, path: '/staff/active-orders', description: 'Track all current orders', color: 'bg-amber-500' },
          ]
        };
      case 'waiter':
        return {
          title: 'Waiter',
          color: 'bg-blue-500',
          bgGradient: 'from-blue-500/20 via-background to-background',
          actions: [
            { title: 'Table Status', icon: LayoutDashboard, path: '/staff/tables', description: 'View and manage tables', color: 'bg-blue-500' },
            { title: 'Take Order', icon: Receipt, path: '/staff/orders', description: 'Create new orders', color: 'bg-emerald-500' },
            { title: 'Kitchen Queue', icon: ChefHat, path: '/staff/kitchen', description: 'Check order status', color: 'bg-orange-500' },
            { title: 'Active Orders', icon: ClipboardList, path: '/staff/active-orders', description: 'Track current orders', color: 'bg-purple-500' },
          ]
        };
      default:
        return {
          title: 'Cleaning Staff',
          color: 'bg-emerald-500',
          bgGradient: 'from-emerald-500/20 via-background to-background',
          actions: [
            { title: 'Table Status', icon: LayoutDashboard, path: '/staff/tables', description: 'View tables to clean', color: 'bg-blue-500' },
            { title: 'Cleaning Queue', icon: Sparkles, path: '/staff/cleaning', description: 'Tables marked for cleaning', color: 'bg-emerald-500' },
          ]
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const config = getRoleConfig();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center shadow-lg`}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Hello, {staffName}!</h1>
              <Badge className={`${config.color} text-white mt-1`}>{config.title}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Your Tasks</CardTitle>
            <CardDescription>Select an action to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.actions.map((action) => (
                <Card 
                  key={action.title} 
                  className="cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
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

export default StaffDashboard;