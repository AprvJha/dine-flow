import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MenuCard } from '@/components/menu/MenuCard';

const MenuManagement = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('*, menu_categories(name)');
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All Items
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems?.map((item) => (
            <MenuCard 
              key={item.id} 
              name={item.name}
              description={item.description || ''}
              price={item.price}
              isVegetarian={item.is_vegetarian || false}
              isVegan={item.is_vegan || false}
              isSpicy={item.is_spicy || false}
              prepTime={item.prep_time_minutes || undefined}
              tags={item.tags || undefined}
              imageUrl={item.image_url || undefined}
            />
          ))}
        </div>

        {menuItems?.length === 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No menu items found</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
