import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, requireAuth = true, allowedRoles }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user role
        setTimeout(() => {
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data }) => {
              setUserRole(data?.role ?? null);
              setLoading(false);
            });
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/auth');
      } else if (!requireAuth && user) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'staff') {
          navigate('/staff');
        } else {
          navigate('/customer');
        }
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        navigate('/unauthorized');
      }
    }
  }, [user, loading, requireAuth, navigate, allowedRoles, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
