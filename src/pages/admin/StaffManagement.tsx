import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const StaffManagement = () => {
  const navigate = useNavigate();

  const { data: staffMembers } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_details')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-500';
      case 'waiter': return 'bg-blue-500';
      case 'kitchen': return 'bg-orange-500';
      case 'cashier': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers?.map((staff) => (
            <Card key={staff.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Staff #{staff.id.slice(0, 8)}
                  </CardTitle>
                  <Badge className={getRoleBadgeColor(staff.staff_role)}>
                    {staff.staff_role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Shift: {staff.shift_start || 'N/A'} - {staff.shift_end || 'N/A'}</p>
                  <p>Status: {staff.is_active ? '🟢 Active' : '🔴 Inactive'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!staffMembers || staffMembers.length === 0) && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
