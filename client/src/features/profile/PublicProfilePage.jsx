import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Star, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const PublicProfilePage = () => {
  const { id } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}/public`);
      return data;
    },
    // Mock for initial render
    initialData: {
      id: id,
      name: 'Sarah Photographer',
      avatar: null,
      city: 'Mumbai',
      bio: 'Professional wedding and event photographer. I take great care of my gear and expect the same!',
      createdAt: '2025-01-15T00:00:00Z',
      rating: 4.9,
      completedRentals: 42,
      emailVerified: true,
      phoneVerified: true,
      reviews: []
    }
  });

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center p-12 text-text-muted">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-surface rounded-card border border-border shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-primary font-bold">{profile.name.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
            <div className="flex items-center gap-4 text-text-muted text-sm mb-3">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.city}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).getFullYear()}</span>
            </div>
            
            <div className="flex gap-4">
              {profile.emailVerified && (
                <div className="flex items-center gap-1 text-sm font-medium text-success bg-green-50 px-2 py-1 rounded-chip">
                  <ShieldCheck className="w-4 h-4" /> Email Verified
                </div>
              )}
              {profile.phoneVerified && (
                <div className="flex items-center gap-1 text-sm font-medium text-success bg-green-50 px-2 py-1 rounded-chip">
                  <ShieldCheck className="w-4 h-4" /> Phone Verified
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 border-y border-border mb-4">
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1 font-bold text-xl mb-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                {profile.rating}
              </div>
              <div className="text-xs text-text-muted">Average Rating</div>
            </div>
            <div className="text-center px-4 border-l border-border">
              <div className="font-bold text-xl mb-1">{profile.completedRentals}</div>
              <div className="text-xs text-text-muted">Completed Rentals</div>
            </div>
          </div>

          <p className="text-text-main whitespace-pre-wrap">
            {profile.bio || 'This user hasn\'t written a bio yet.'}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        Reviews ({profile.reviews?.length || 0})
      </h2>
      <div className="space-y-4">
        {profile.reviews?.length > 0 ? (
          profile.reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <EmptyState 
            icon={Star}
            title="No reviews yet"
            description="This user hasn't received any reviews."
          />
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
