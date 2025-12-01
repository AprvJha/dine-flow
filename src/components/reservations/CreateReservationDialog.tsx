import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const CreateReservationDialog = () => {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [tableId, setTableId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tables } = useQuery({
    queryKey: ['all-tables'],
    queryFn: async () => {
      const { data } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number');
      return data || [];
    }
  });

  const createReservation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reservations')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          party_size: parseInt(partySize),
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          table_id: tableId || null,
          special_requests: specialRequests || null,
          status: 'confirmed'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ title: 'Reservation created successfully!' });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error creating reservation', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setPartySize('2');
    setReservationDate('');
    setReservationTime('');
    setTableId('');
    setSpecialRequests('');
  };

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create Reservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Customer Name *</Label>
            <Input 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label>Phone Number *</Label>
            <Input 
              value={customerPhone} 
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <Label>Email (Optional)</Label>
            <Input 
              type="email"
              value={customerEmail} 
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Party Size *</Label>
              <Select value={partySize} onValueChange={setPartySize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'Guest' : 'Guests'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Table (Optional)</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-assign</SelectItem>
                  {tables?.filter(t => t.capacity >= parseInt(partySize)).map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.table_number} ({table.capacity} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input 
                type="date"
                value={reservationDate} 
                onChange={(e) => setReservationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Time *</Label>
              <Select value={reservationTime} onValueChange={setReservationTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Special Requests</Label>
            <Textarea 
              value={specialRequests} 
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or dietary requirements..."
            />
          </div>

          <Button 
            className="w-full" 
            onClick={() => createReservation.mutate()}
            disabled={!customerName || !customerPhone || !reservationDate || !reservationTime || createReservation.isPending}
          >
            {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReservationDialog;