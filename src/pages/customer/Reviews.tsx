import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';

const Reviews = () => {
  const navigate = useNavigate();

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

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews & Feedback
              </CardTitle>
              <CardDescription>Share your dining experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Reviews Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on bringing you a way to share your experience at The Golden Ladle.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Reviews;
