import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ReservationsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: reservations, refetch } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, restaurant_tables(table_number)')
        .order('reservation_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateReservationStatus = async (id: string, status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled') => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Reservation ${status}` });
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'seated': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
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
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations?.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
                  <Badge className={getStatusColor(reservation.status || 'pending')}>
                    {reservation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(reservation.reservation_date).toLocaleDateString('en-IN')} at {reservation.reservation_time}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {reservation.party_size} guests
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {reservation.customer_phone}
                  </p>
                  {reservation.customer_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {reservation.customer_email}
                    </p>
                  )}
                  {reservation.restaurant_tables && (
                    <p>Table: {reservation.restaurant_tables.table_number}</p>
                  )}
                  {reservation.special_requests && (
                    <p className="text-orange-500">📝 {reservation.special_requests}</p>
                  )}
                </div>
                
                {reservation.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {reservation.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => updateReservationStatus(reservation.id, 'seated')}
                  >
                    Mark Seated
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!reservations || reservations.length === 0) && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reservations yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReservationsManagement;
