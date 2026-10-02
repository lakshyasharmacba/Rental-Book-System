import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ItemCard } from '@/components/cards/ItemCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart } from 'lucide-react';

export const FavoritesPage = () => {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get('/favorites');
      return data;
    },
    initialData: [] // Mock empty for preview
  });

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Saved Gear</h1>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Heart}
          title="No favorites yet"
          description="Heart an item you like, and it will show up here for easy access later."
        />
      )}
    </div>
  );
};

export default FavoritesPage;
