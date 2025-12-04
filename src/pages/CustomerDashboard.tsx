import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Calendar, Receipt, LogOut, Star, User } from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(data?.full_name || user.email?.split('@')[0] || 'Guest');
      }
    };
    fetchUserName();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const quickActions = [
    { 
      title: 'View Menu', 
      icon: UtensilsCrossed, 
      path: '/customer/menu',
      description: 'Browse our delicious offerings',
      color: 'bg-primary'
    },
    { 
      title: 'Make Reservation', 
      icon: Calendar, 
      path: '/customer/reservations',
      description: 'Book a table with us',
      color: 'bg-emerald-500'
    },
    { 
      title: 'My Orders', 
      icon: Receipt, 
      path: '/customer/orders',
      description: 'Track your orders',
      color: 'bg-blue-500'
    },
    { 
      title: 'Reviews', 
      icon: Star, 
      path: '/customer/reviews',
      description: 'Share your experience',
      color: 'bg-purple-500'
    },
  ];

  return (
    <AuthGuard allowedRoles={['customer']}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">The Golden Ladle</h1>
                <p className="text-sm text-muted-foreground">Fine Dining Experience</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-primary/20 hover:bg-primary/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Welcome back, {userName}!</h2>
            <p className="text-muted-foreground mt-2">What would you like to do today?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action) => (
              <Card 
                key={action.title} 
                className="cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30 overflow-hidden"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`${action.color} p-6 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 text-center">
            <Card className="inline-block bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Need help? Call us at <span className="font-semibold text-primary">+91 98765 43210</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default CustomerDashboard;