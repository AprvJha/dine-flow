import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Sparkles, UtensilsCrossed, Clock } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: 'Welcome to the restaurant management system.',
      });
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-background dark:via-muted dark:to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-primary dark:to-primary/80 flex items-center justify-center shadow-lg animate-scale-in">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-primary dark:to-accent bg-clip-text text-transparent">
                    The Golden Ladle
                  </h1>
                  <p className="text-muted-foreground text-lg">Restaurant Management System</p>
                </div>
              </div>
              
              <p className="text-xl text-foreground/80">
                Experience authentic Indian cuisine crafted with passion and served with excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Rich Menu Selection</h3>
                  <p className="text-sm text-muted-foreground">From appetizers to biryanis, explore our diverse Indian menu</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Management</h3>
                  <p className="text-sm text-muted-foreground">Track orders, tables, and reservations seamlessly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Premium Experience</h3>
                  <p className="text-sm text-muted-foreground">Exceptional service powered by modern technology</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <Card className="w-full shadow-2xl border-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center mb-2 lg:hidden">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-primary dark:to-primary/80 flex items-center justify-center shadow-lg animate-scale-in">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="lg:hidden">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-primary dark:to-accent bg-clip-text text-transparent">
                  The Golden Ladle
                </CardTitle>
              </div>
              <CardTitle className="text-2xl font-bold hidden lg:block">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to manage your restaurant operations
              </CardDescription>
            </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
