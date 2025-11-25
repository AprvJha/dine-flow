import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Calendar, Receipt, LogOut, Star } from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const quickActions = [
    { 
      title: 'View Menu', 
      icon: UtensilsCrossed, 
      path: '/customer/menu',
      description: 'Browse our delicious offerings'
    },
    { 
      title: 'Make Reservation', 
      icon: Calendar, 
      path: '/customer/reservations',
      description: 'Book a table with us'
    },
    { 
      title: 'My Orders', 
      icon: Receipt, 
      path: '/customer/orders',
      description: 'Track your orders'
    },
    { 
      title: 'Reviews', 
      icon: Star, 
      path: '/customer/reviews',
      description: 'Share your experience'
    },
  ];

  return (
    <AuthGuard allowedRoles={['customer']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Welcome Back!</h1>
              <p className="text-sm text-muted-foreground">Discover great food</p>
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
              <CardTitle>What would you like to do?</CardTitle>
              <CardDescription>Choose from the options below</CardDescription>
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                          <action.icon className="w-6 h-6 text-primary-foreground" />
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

export default CustomerDashboard;
