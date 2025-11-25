import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Flame } from 'lucide-react';

interface MenuCardProps {
  name: string;
  description: string;
  price: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  prepTime?: number;
  tags?: string[];
  imageUrl?: string;
}

export const MenuCard = ({
  name,
  description,
  price,
  isVegetarian,
  isVegan,
  isSpicy,
  prepTime,
  tags,
  imageUrl,
}: MenuCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isVegan && (
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  <Leaf className="w-3 h-3 mr-1" />
                  Vegan
                </Badge>
              )}
              {isVegetarian && !isVegan && (
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  <Leaf className="w-3 h-3 mr-1" />
                  Vegetarian
                </Badge>
              )}
              {isSpicy && (
                <Badge variant="outline" className="bg-danger/10 text-danger border-danger">
                  <Flame className="w-3 h-3 mr-1" />
                  Spicy
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">${price.toFixed(2)}</p>
            {prepTime && (
              <p className="text-xs text-muted-foreground">{prepTime} min</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-3">{description}</CardDescription>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
