import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MyReservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    special_requests: ''
  });

  const { data: reservations, refetch } = useQuery({
    queryKey: ['customer-reservations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_id', user.id)
        .order('reservation_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reservations').insert({
        ...formData,
        customer_id: user.id
      });

      if (error) throw error;

      toast({ title: 'Reservation submitted successfully!' });
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        reservation_date: '',
        reservation_time: '',
        party_size: 2,
        special_requests: ''
      });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'seated': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  return (
    <AuthGuard allowedRoles={['customer']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/customer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Make a Reservation
              </CardTitle>
              <CardDescription>Book a table at The Golden Ladle</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Your Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Phone Number</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email (Optional)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party_size">Party Size</Label>
                  <Input
                    id="party_size"
                    type="number"
                    min={1}
                    max={20}
                    value={formData.party_size}
                    onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservation_date">Date</Label>
                  <Input
                    id="reservation_date"
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservation_time">Time</Label>
                  <Input
                    id="reservation_time"
                    type="time"
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                  <Input
                    id="special_requests"
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    placeholder="Any special requirements..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Submitting...' : 'Book Table'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {reservations && reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((res) => (
                    <Card key={res.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{res.reservation_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{res.reservation_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{res.party_size} guests</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(res.status || 'pending')}>
                            {res.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No reservations yet</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default MyReservations;
