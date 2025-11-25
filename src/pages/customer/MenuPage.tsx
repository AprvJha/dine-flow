import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MenuCard } from '@/components/menu/MenuCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  prep_time_minutes: number;
  tags: string[];
  image_url: string | null;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

const MenuPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResult, itemsResult] = await Promise.all([
        supabase.from('menu_categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('menu_items').select('*').eq('is_available', true),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (itemsResult.data) setMenuItems(itemsResult.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemsByCategory = (categoryId: string) =>
    filteredItems.filter(item => item.category_id === categoryId);

  return (
    <AuthGuard allowedRoles={['customer']}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <header className="border-b bg-card shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => navigate('/customer')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Our Menu</h1>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue={categories[0]?.id} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getItemsByCategory(category.id).map((item) => (
                      <MenuCard
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        isVegetarian={item.is_vegetarian}
                        isVegan={item.is_vegan}
                        isSpicy={item.is_spicy}
                        prepTime={item.prep_time_minutes}
                        tags={item.tags}
                        imageUrl={item.image_url}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default MenuPage;
